(function() {
  'use strict';

  var GF256_LOG = new Array(256);
  var GF256_EXP = new Array(256);

  (function initGF() {
    var i, val = 1;
    for (i = 0; i < 255; i++) {
      GF256_EXP[i] = val;
      GF256_LOG[val] = i;
      val = (val * 2) ^ (val >= 128 ? 0x11D : 0);
      val &= 0xFF;
    }
    GF256_LOG[0] = -1;
  })();

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return GF256_EXP[(GF256_LOG[a] + GF256_LOG[b]) % 255];
  }

  function gfPolyMul(poly1, poly2) {
    var result = new Array(poly1.length + poly2.length - 1).fill(0);
    for (var i = 0; i < poly1.length; i++) {
      for (var j = 0; j < poly2.length; j++) {
        result[i + j] ^= gfMul(poly1[i], poly2[j]);
      }
    }
    return result;
  }

  function rsGeneratorPoly(ecCount) {
    var poly = [1];
    for (var i = 0; i < ecCount; i++) {
      poly = gfPolyMul(poly, [1, GF256_EXP[i]]);
    }
    return poly;
  }

  function rsEncode(data, ecCount) {
    var gen = rsGeneratorPoly(ecCount);
    var padded = data.slice();
    for (var i = 0; i < ecCount; i++) padded.push(0);
    for (i = 0; i < data.length; i++) {
      if (padded[i] !== 0) {
        var factor = GF256_LOG[padded[i]];
        for (var j = 0; j < gen.length; j++) {
          padded[i + j] ^= gfMul(gen[j], GF256_EXP[factor]);
        }
      }
    }
    return padded.slice(data.length);
  }

  var VERSION_TABLES = (function() {
    var totalCW = [0, 26, 44, 70, 100, 134, 172, 196, 242, 292, 346];
    var byteCap = {
      L: [0, 17, 32, 53, 78, 106, 134, 154, 192, 230, 271],
      M: [0, 14, 26, 42, 62, 84, 106, 122, 152, 180, 213],
      Q: [0, 11, 20, 32, 46, 60, 74, 86, 108, 130, 151],
      H: [0, 7, 14, 24, 34, 44, 58, 64, 84, 98, 119]
    };
    var ecCW = { L: [0,7,10,15,20,26,18,20,24,30,18], M: [0,10,16,26,18,24,16,18,22,22,26], Q: [0,13,22,18,26,18,24,18,22,20,24], H: [0,17,28,22,16,22,28,26,26,24,28] };
    var blocks = { L: [0,1,1,1,1,1,2,2,2,2,4], M: [0,1,1,1,2,2,4,4,4,5,5], Q: [0,1,1,2,2,4,4,6,6,8,8], H: [0,1,1,2,4,4,4,5,6,8,8] };
    return { totalCW: totalCW, byteCap: byteCap, ecCW: ecCW, blocks: blocks };
  })();

  function byteLengthOf(text) {
    return new TextEncoder().encode(text).length;
  }

  function getVersion(byteLen, ecLevel) {
    var caps = VERSION_TABLES.byteCap[ecLevel];
    for (var v = 1; v <= 10; v++) {
      if (caps[v] >= byteLen) return v;
    }
    return -1;
  }

  function encodeByteData(text, version, ecLevel) {
    var encoder = new TextEncoder();
    var bytes = encoder.encode(text);
    var cap = VERSION_TABLES.byteCap[ecLevel][version];
    if (bytes.length > cap) return null;

    var modeBits = [0,1,0,0];
    var charCountBits = version <= 9 ? 8 : 16;
    var charCount = bytes.length;
    var countBits = [];
    for (var i = charCountBits - 1; i >= 0; i--) {
      countBits.push((charCount >> i) & 1);
    }

    var bitStream = [].concat(modeBits, countBits);
    for (i = 0; i < bytes.length; i++) {
      for (var b = 7; b >= 0; b--) {
        bitStream.push((bytes[i] >> b) & 1);
      }
    }

    var totalDataCW = VERSION_TABLES.totalCW[version];
    var ecCWPerBlock = VERSION_TABLES.ecCW[ecLevel][version];
    var numBlocks = VERSION_TABLES.blocks[ecLevel][version];
    var totalData = totalDataCW - ecCWPerBlock * numBlocks;
    var dataShort = Math.floor(totalData / numBlocks);
    var numLong = totalData % numBlocks;

    var dataBitsNeeded = totalData * 8;
    var terminatorLen = Math.min(4, dataBitsNeeded - bitStream.length);
    for (i = 0; i < terminatorLen; i++) bitStream.push(0);

    while (bitStream.length < dataBitsNeeded && bitStream.length % 8 !== 0) {
      bitStream.push(0);
    }

    var padPatterns = [0xEC, 0x11];
    var padIdx = 0;
    while (bitStream.length < dataBitsNeeded) {
      var padByte = padPatterns[padIdx % 2];
      for (var b2 = 7; b2 >= 0; b2--) {
        bitStream.push((padByte >> b2) & 1);
      }
      padIdx++;
    }

    if (bitStream.length > dataBitsNeeded) {
      bitStream = bitStream.slice(0, dataBitsNeeded);
    }

    var dataCW = [];
    for (i = 0; i < bitStream.length; i += 8) {
      var byteVal = 0;
      for (var j = 0; j < 8; j++) {
        byteVal = (byteVal << 1) | bitStream[i + j];
      }
      dataCW.push(byteVal);
    }

    return { dataCW: dataCW, ecCWPerBlock: ecCWPerBlock, numBlocks: numBlocks, dataShort: dataShort, numLong: numLong };
  }

  function interleaveBlocks(dataCW, numBlocks, dataShort, numLong, ecCWPerBlock) {
    var numShort = numBlocks - numLong;
    var blocks = [];
    var pos = 0;
    for (var i = 0; i < numShort; i++) {
      blocks.push(dataCW.slice(pos, pos + dataShort));
      pos += dataShort;
    }
    for (i = 0; i < numLong; i++) {
      blocks.push(dataCW.slice(pos, pos + dataShort + 1));
      pos += dataShort + 1;
    }

    var ecBlocks = [];
    for (i = 0; i < numBlocks; i++) {
      ecBlocks.push(rsEncode(blocks[i], ecCWPerBlock));
    }

    var interleaved = [];
    for (var col = 0; col < dataShort; col++) {
      for (var b = 0; b < numBlocks; b++) {
        interleaved.push(blocks[b][col]);
      }
    }
    for (b = 0; b < numLong; b++) {
      interleaved.push(blocks[numShort + b][dataShort]);
    }
    for (col = 0; col < ecCWPerBlock; col++) {
      for (b = 0; b < numBlocks; b++) {
        interleaved.push(ecBlocks[b][col]);
      }
    }

    return interleaved;
  }

  function createMatrix(version) {
    var size = 17 + version * 4;
    var matrix = [];
    var funcVal = [];
    for (var r = 0; r < size; r++) {
      matrix[r] = new Array(size).fill(0);
      funcVal[r] = new Array(size).fill(-1);
    }
    return { matrix: matrix, funcVal: funcVal, size: size };
  }

  function setFunctionModule(matrix, funcVal, r, c, val) {
    matrix[r][c] = 2;
    funcVal[r][c] = val;
  }

  function addFinderPattern(matrix, funcVal, size, row, col) {
    for (var r = -1; r <= 7; r++) {
      for (var c = -1; c <= 7; c++) {
        var mr = row + r, mc = col + c;
        if (mr < 0 || mr >= size || mc < 0 || mc >= size) continue;
        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          var isOuter = r === 0 || r === 6 || c === 0 || c === 6;
          var isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          setFunctionModule(matrix, funcVal, mr, mc, (isOuter || isInner) ? 1 : 0);
        } else {
          setFunctionModule(matrix, funcVal, mr, mc, 0);
        }
      }
    }
  }

  function addAlignmentPattern(matrix, funcVal, size, row, col) {
    for (var r = -2; r <= 2; r++) {
      for (var c = -2; c <= 2; c++) {
        var mr = row + r, mc = col + c;
        if (mr < 0 || mr >= size || mc < 0 || mc >= size) continue;
        if (r === 0 && c === 0) { setFunctionModule(matrix, funcVal, mr, mc, 1); }
        else if (Math.abs(r) === 2 || Math.abs(c) === 2) { setFunctionModule(matrix, funcVal, mr, mc, 1); }
        else { setFunctionModule(matrix, funcVal, mr, mc, 0); }
      }
    }
  }

  function getAlignmentPositions(version) {
    if (version === 1) return [];
    var positions = { 2: [6,18], 3: [6,22], 4: [6,26], 5: [6,30], 6: [6,34], 7: [6,22,38], 8: [6,24,42], 9: [6,26,46], 10: [6,28,50] };
    return positions[version] || (function() {
      var step = version >= 7 ? 16 : 0;
      var first = 6;
      var pos = [first];
      var next = first + step;
      while (next < 17 + version * 4 - 7) {
        pos.push(next);
        next += step;
      }
      pos.push(17 + version * 4 - 7);
      return pos;
    })();
  }

  function addTimingPatterns(matrix, funcVal, size) {
    for (var i = 8; i < size - 8; i++) {
      if (matrix[6][i] !== 2) setFunctionModule(matrix, funcVal, 6, i, i % 2 === 0 ? 1 : 0);
      if (matrix[i][6] !== 2) setFunctionModule(matrix, funcVal, i, 6, i % 2 === 0 ? 1 : 0);
    }
  }

  function reserveFormatInfo(matrix, size) {
    for (var i = 0; i <= 8; i++) {
      if (i !== 6) {
        if (matrix[8][i] === 0) matrix[8][i] = -1;
        if (matrix[i][8] === 0) matrix[i][8] = -1;
      }
    }
    for (i = size - 8; i < size; i++) {
      if (matrix[8][i] === 0) matrix[8][i] = -1;
    }
    for (i = size - 7; i <= size - 1; i++) {
      if (matrix[i][8] === 0) matrix[i][8] = -1;
    }
    matrix[size - 8][8] = -1;
  }

  var FORMAT_INFO = {};

  function initFormatInfo() {
    var ecMasks = { L: 1, M: 0, Q: 3, H: 2 };
    for (var e in ecMasks) {
      FORMAT_INFO[e] = [];
      for (var m = 0; m < 8; m++) {
        var ecBits = ecMasks[e];
        var data = (ecBits << 3) | m;
        var gen = 0x537;
        var ec = data << 10;
        for (var i = 14; i >= 10; i--) {
          if ((ec >> i) & 1) ec ^= gen << (i - 10);
        }
        var codeword = ((data << 10) | ec) ^ 0x5412;
        FORMAT_INFO[e][m] = codeword;
      }
    }
  }
  initFormatInfo();

  function addFormatInfo(matrix, size, ecLevel, maskPattern) {
    var fi = FORMAT_INFO[ecLevel][maskPattern];
    var cells = [
      [8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],
      [7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8],
      [size-1,8],[size-2,8],[size-3,8],[size-4,8],[size-5,8],[size-6,8],[size-7,8],
      [8,size-8],[8,size-7],[8,size-6],[8,size-5],[8,size-4],[8,size-3],[8,size-2],[8,size-1]
    ];
    for (var i = 0; i < 15; i++) {
      var bit = (fi >> (14 - i)) & 1;
      var cell = cells[i];
      matrix[cell[0]][cell[1]] = bit;
      var mirror = cells[i + 15];
      matrix[mirror[0]][mirror[1]] = bit;
    }
    matrix[size-8][8] = 1;
  }

  var VERSION_INFO = {};

  function initVersionInfo() {
    var gen = 0x1F25;
    for (var v = 7; v <= 10; v++) {
      var data = v;
      var ec = data << 12;
      for (var i = 17; i >= 12; i--) {
        if ((ec >> i) & 1) ec ^= gen << (i - 12);
      }
      VERSION_INFO[v] = (data << 12) | ec;
    }
  }
  initVersionInfo();

  function reserveVersionInfo(matrix, size, version) {
    if (version < 7) return;
    for (var i = 0; i < 6; i++) {
      for (var j = 0; j < 3; j++) {
        matrix[size-11+j][i] = -1;
        matrix[i][size-11+j] = -1;
      }
    }
  }

  function addVersionInfo(matrix, size, version) {
    if (version < 7) return;
    var vi = VERSION_INFO[version];
    var cells = [];
    for (var i = 0; i < 6; i++) {
      for (var j = 0; j < 3; j++) {
        cells.push([size-11+j, i]);
        cells.push([i, size-11+j]);
      }
    }
    for (i = 0; i < 18; i++) {
      var bit = (vi >> (17 - i)) & 1;
      matrix[cells[i][0]][cells[i][1]] = bit;
      matrix[cells[i+18][0]][cells[i+18][1]] = bit;
    }
  }

  function addDataBits(matrix, size, bits) {
    var row = size - 1, col = size - 1;
    var dir = -1;
    var bitIdx = 0;

    while (col > 0) {
      if (col === 6) col = 5;

      for (var pass = 0; pass < 2; pass++) {
        var c = col - pass;
        if (c < 0) continue;
        var r = row;
        if (matrix[r][c] === 0 || matrix[r][c] === -1) {
          if (matrix[r][c] !== -1) {
            matrix[r][c] = bitIdx < bits.length ? bits[bitIdx] : 0;
            bitIdx++;
          }
        }
      }

      row += dir;
      if (row < 0 || row >= size) {
        dir = -dir;
        row += dir;
        col -= 2;
        if (col === 6) col = 5;
      }
    }
  }

  function applyMask(matrix, size, pattern) {
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        if (matrix[r][c] < 0 || matrix[r][c] === 2) continue;
        var shouldFlip = false;
        switch (pattern) {
          case 0: shouldFlip = (r + c) % 2 === 0; break;
          case 1: shouldFlip = r % 2 === 0; break;
          case 2: shouldFlip = c % 3 === 0; break;
          case 3: shouldFlip = (r + c) % 3 === 0; break;
          case 4: shouldFlip = (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; break;
          case 5: shouldFlip = ((r * c) % 2) + ((r * c) % 3) === 0; break;
          case 6: shouldFlip = (((r * c) % 2) + ((r * c) % 3)) % 2 === 0; break;
          case 7: shouldFlip = (((r + c) % 2) + ((r * c) % 3)) % 2 === 0; break;
        }
        if (shouldFlip) matrix[r][c] = matrix[r][c] === 1 ? 0 : 1;
      }
    }
  }

  function evaluateMask(matrix, size) {
    var score = 0;

    for (var r = 0; r < size; r++) {
      var runCount = 1;
      for (var c = 1; c < size; c++) {
        if (matrix[r][c] === matrix[r][c-1]) {
          runCount++;
        } else {
          if (runCount >= 5) score += 3 + (runCount - 5);
          runCount = 1;
        }
      }
      if (runCount >= 5) score += 3 + (runCount - 5);
    }

    for (var c = 0; c < size; c++) {
      runCount = 1;
      for (r = 1; r < size; r++) {
        if (matrix[r][c] === matrix[r-1][c]) {
          runCount++;
        } else {
          if (runCount >= 5) score += 3 + (runCount - 5);
          runCount = 1;
        }
      }
      if (runCount >= 5) score += 3 + (runCount - 5);
    }

    for (r = 0; r < size - 1; r++) {
      for (c = 0; c < size - 1; c++) {
        var v = matrix[r][c];
        if (v === matrix[r][c+1] && v === matrix[r+1][c] && v === matrix[r+1][c+1]) {
          score += 3;
        }
      }
    }

    var darkCount = 0;
    for (r = 0; r < size; r++) {
      for (c = 0; c < size; c++) {
        if (matrix[r][c] === 1) darkCount++;
      }
    }
    var percent = Math.round((darkCount * 100) / (size * size));
    var prev = Math.floor(percent / 5) * 5;
    var next = Math.ceil(percent / 5) * 5;
    score += Math.min(Math.abs(percent - prev), Math.abs(percent - next)) * 10;

    return score;
  }

  function findBestMask(matrix, funcVal, size, ecLevel) {
    var bestScore = Infinity;
    var bestPattern = 0;
    var savedMatrix = [];
    for (var r = 0; r < size; r++) {
      savedMatrix[r] = matrix[r].slice();
    }

    for (var p = 0; p < 8; p++) {
      var testMatrix = [];
      for (r = 0; r < size; r++) {
        testMatrix[r] = savedMatrix[r].slice();
      }
      applyMask(testMatrix, size, p);
      for (r = 0; r < size; r++) {
        for (var c = 0; c < size; c++) {
          if (testMatrix[r][c] === 2) testMatrix[r][c] = funcVal[r][c];
        }
      }
      addFormatInfo(testMatrix, size, ecLevel, p);
      var score = evaluateMask(testMatrix, size);
      if (score < bestScore) {
        bestScore = score;
        bestPattern = p;
      }
    }

    return bestPattern;
  }

  function renderMatrix(matrix, size, moduleSize, fgColor, bgColor) {
    var canvas = document.createElement('canvas');
    var padding = moduleSize * 2;
    canvas.width = size * moduleSize + padding * 2;
    canvas.height = size * moduleSize + padding * 2;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = fgColor;
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        if (matrix[r][c] === 1) {
          ctx.fillRect(padding + c * moduleSize, padding + r * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    return canvas;
  }

  function generateQR(text, options) {
    options = options || {};
    var ecLevel = options.ecLevel || 'M';
    var moduleSize = options.moduleSize || 4;
    var fgColor = options.fgColor || '#151515';
    var bgColor = options.bgColor || '#E6E1C5';

    if (!text || text.length === 0) return null;

    var version = getVersion(byteLengthOf(text), ecLevel);
    if (version === -1) return null;

    var encoded = encodeByteData(text, version, ecLevel);
    if (!encoded) return null;

    var interleaved = interleaveBlocks(
      encoded.dataCW, encoded.numBlocks,
      encoded.dataShort, encoded.numLong, encoded.ecCWPerBlock
    );

    var bits = [];
    for (var i = 0; i < interleaved.length; i++) {
      for (var b = 7; b >= 0; b--) {
        bits.push((interleaved[i] >> b) & 1);
      }
    }

    var size = 17 + version * 4;
    var created = createMatrix(version);
    var matrix = created.matrix;
    var funcVal = created.funcVal;

    addFinderPattern(matrix, funcVal, size, 0, 0);
    addFinderPattern(matrix, funcVal, size, 0, size - 7);
    addFinderPattern(matrix, funcVal, size, size - 7, 0);

    var alignPositions = getAlignmentPositions(version);
    for (i = 0; i < alignPositions.length; i++) {
      for (var j = 0; j < alignPositions.length; j++) {
        if (i === 0 && j === 0) continue;
        if (i === 0 && j === alignPositions.length - 1) continue;
        if (i === alignPositions.length - 1 && j === 0) continue;
        addAlignmentPattern(matrix, funcVal, size, alignPositions[i], alignPositions[j]);
      }
    }

    addTimingPatterns(matrix, funcVal, size);
    reserveFormatInfo(matrix, size);
    reserveVersionInfo(matrix, size, version);
    addDataBits(matrix, size, bits);

    var bestMask = findBestMask(matrix, funcVal, size, ecLevel);
    applyMask(matrix, size, bestMask);
    addFormatInfo(matrix, size, ecLevel, bestMask);
    addVersionInfo(matrix, size, version);

    for (var fr = 0; fr < size; fr++) {
      for (var fc = 0; fc < size; fc++) {
        if (matrix[fr][fc] === 2) matrix[fr][fc] = funcVal[fr][fc];
      }
    }

    var canvas = renderMatrix(matrix, size, moduleSize, fgColor, bgColor);

    return {
      canvas: canvas,
      version: version,
      ecLevel: ecLevel,
      matrix: matrix,
      size: size,
      moduleSize: moduleSize
    };
  }

  window.QRCode = { generate: generateQR };

  document.addEventListener('DOMContentLoaded', function() {
    var textInput = document.getElementById('qr-input');
    var generateBtn = document.getElementById('generate-btn');
    var ecSelect = document.getElementById('ec-level');
    var sizeSlider = document.getElementById('module-size');
    var sizeDisplay = document.getElementById('size-display');
    var resultArea = document.getElementById('result-area');
    var qrCanvas = document.getElementById('qr-canvas');
    var downloadBtn = document.getElementById('download-btn');
    var copyBtn = document.getElementById('copy-btn');
    var errorMsg = document.getElementById('error-msg');
    var copyFeedback = document.getElementById('copy-feedback');
    var versionInfo = document.getElementById('version-info');

    function generate() {
      var text = textInput.value.trim();
      if (!text) {
        errorMsg.textContent = 'Enter some text or a URL to generate a QR code.';
        errorMsg.style.display = 'block';
        resultArea.style.display = 'none';
        return;
      }

      var ecLevel = ecSelect.value;
      var modSize = parseInt(sizeSlider.value, 10);

      errorMsg.style.display = 'none';

      var result = QRCode.generate(text, {
        ecLevel: ecLevel,
        moduleSize: modSize
      });

      if (!result) {
        errorMsg.textContent = 'Input is too long for the selected error correction level. Try using a lower EC level or shorter text.';
        errorMsg.style.display = 'block';
        resultArea.style.display = 'none';
        return;
      }

      qrCanvas.width = result.canvas.width;
      qrCanvas.height = result.canvas.height;
      var ctx = qrCanvas.getContext('2d');
      ctx.drawImage(result.canvas, 0, 0);

      versionInfo.textContent = 'Version ' + result.version + ' | Error Correction: ' + result.ecLevel;
      resultArea.style.display = 'block';
    }

    generateBtn.addEventListener('click', generate);

    textInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') generate();
    });

    sizeSlider.addEventListener('input', function() {
      sizeDisplay.textContent = this.value;
    });

    downloadBtn.addEventListener('click', function() {
      if (resultArea.style.display !== 'block') return;
      var link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = qrCanvas.toDataURL('image/png');
      link.click();
    });

    copyBtn.addEventListener('click', function() {
      if (resultArea.style.display !== 'block') return;
      qrCanvas.toBlob(function(blob) {
        navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]).then(function() {
          copyFeedback.style.display = '';
          setTimeout(function() { copyFeedback.style.display = 'none'; }, 2000);
        }).catch(function() {});
      });
    });
  });
})();
