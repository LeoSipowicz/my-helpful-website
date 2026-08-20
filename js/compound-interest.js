document.addEventListener('DOMContentLoaded', () => {
  const principalInput = document.getElementById('principal');
  const contribInput = document.getElementById('contrib');
  const contribFreqSelect = document.getElementById('contrib-freq');
  const rateInput = document.getElementById('rate');
  const compFreqSelect = document.getElementById('comp-freq');
  const yearsInput = document.getElementById('years');
  const atStartCheck = document.getElementById('at-start');
  const copyBtn = document.getElementById('copy-btn');
  const copyFeedback = document.getElementById('copy-feedback');
  const resultBlock = document.getElementById('result-block');
  const finalValue = document.getElementById('final-value');
  const totalContribValue = document.getElementById('total-contrib');
  const totalInterestValue = document.getElementById('total-interest');
  const interestShareValue = document.getElementById('interest-share');
  const ruleOf72 = document.getElementById('rule-72');
  const yearTableBody = document.getElementById('year-table-body');
  const chartCanvas = document.getElementById('growth-chart');

  const moneyFmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  });

  const FREQ_LABELS = {
    monthly: 'month',
    quarterly: 'quarter',
    yearly: 'year'
  };
  const COMP_LABELS = {
    annually: 'annually',
    semiannually: 'semiannually',
    quarterly: 'quarterly',
    monthly: 'monthly',
    daily: 'daily'
  };
  const COMP_PERIODS = {
    annually: 1,
    semiannually: 2,
    quarterly: 4,
    monthly: 12,
    daily: 365
  };

  function parseNum(value) {
    const n = parseFloat(value);
    return isNaN(n) ? NaN : n;
  }

  function simulate(principal, contrib, contribFreq, rate, compFreq, years, atStart) {
    const k = COMP_PERIODS[compFreq];
    const totalMonths = Math.max(1, Math.round(years * 12));
    const contribMonths = contribFreq === 'monthly' ? 1 : contribFreq === 'quarterly' ? 3 : 12;
    const block = 12 / k;
    const monthlyRate = k >= 12 ? Math.pow(1 + rate / k, k / 12) - 1 : 0;

    let balance = principal;
    let totalContributions = principal;
    let yearInterest = 0;
    const rows = [];

    for (let m = 1; m <= totalMonths; m++) {
      const isContribMonth = (m - 1) % contribMonths === 0;
      if (atStart && isContribMonth) {
        balance += contrib;
        totalContributions += contrib;
      }
      if (k >= 12) {
        yearInterest += balance * monthlyRate;
        balance *= 1 + monthlyRate;
      } else if (m % block === 0) {
        yearInterest += balance * (rate / k);
        balance *= 1 + rate / k;
      }
      if (!atStart && isContribMonth) {
        balance += contrib;
        totalContributions += contrib;
      }
      if (m % 12 === 0) {
        const rowInterest = yearInterest;
        rows.push({
          year: m / 12,
          balance: balance,
          contributions: totalContributions,
          interest: balance - totalContributions,
          yearInterest: rowInterest
        });
        yearInterest = 0;
      }
    }

    return {
      final: balance,
      totalContributions: totalContributions,
      totalInterest: balance - totalContributions,
      rows: rows
    };
  }

  function fmt(n) {
    return moneyFmt.format(n);
  }

  function fmtPct(n) {
    return String(Math.round(n * 10) / 10);
  }

  function clearTable() {
    yearTableBody.innerHTML = '';
  }

  function renderTable(rows) {
    clearTable();
    let frag = document.createDocumentFragment();
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      const cells = [row.year, fmt(row.balance), fmt(row.contributions), fmt(row.yearInterest), fmt(row.interest)];
      cells.forEach((cell) => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      frag.appendChild(tr);
    });
    yearTableBody.appendChild(frag);
  }

  function drawChart(rows) {
    if (!chartCanvas) return;
    const container = chartCanvas.parentElement;
    const cssWidth = Math.min(container ? container.clientWidth : 600, 900);
    const cssHeight = 300;
    const dpr = window.devicePixelRatio || 1;
    chartCanvas.width = Math.round(cssWidth * dpr);
    chartCanvas.height = Math.round(cssHeight * dpr);
    chartCanvas.style.width = cssWidth + 'px';
    chartCanvas.style.height = cssHeight + 'px';

    const ctx = chartCanvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    if (!rows.length) return;

    const padL = 14;
    const padB = 26;
    const padT = 10;
    const padR = 8;
    const plotW = cssWidth - padL - padR;
    const plotH = cssHeight - padT - padB;
    const maxVal = Math.max(rows[rows.length - 1].balance, 1);
    const barWidth = Math.max(2, Math.min(34, plotW / rows.length * 0.62));
    const gap = plotW / rows.length;
    const yMax = 4;
    const yLabels = [];
    for (let i = 0; i <= yMax; i++) {
      yLabels.push(maxVal * i / yMax);
    }

    ctx.font = '10px Georgia, serif';
    ctx.fillStyle = '#151515';
    ctx.strokeStyle = 'rgba(21,21,21,0.25)';
    ctx.lineWidth = 1;

    yLabels.forEach((val, i) => {
      const y = padT + plotH - (plotH * i / yMax);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(cssWidth - padR, y);
      ctx.stroke();
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(abbrev(val), padL - 6, y);
    });

    const labelEvery = Math.max(1, Math.ceil(rows.length / 8));
    rows.forEach((row, i) => {
      const x = padL + gap * i + gap / 2 - barWidth / 2;
      const totalH = plotH * (row.balance / maxVal);
      const contribH = plotH * (Math.min(row.contributions, row.balance) / maxVal);
      const yTotal = padT + plotH - totalH;
      const yContrib = padT + plotH - contribH;

      if (contribH > 0) {
        ctx.fillStyle = '#6D72C3';
        ctx.fillRect(x, yContrib, barWidth, contribH);
      }
      const interestH = totalH - contribH;
      if (interestH > 0) {
        ctx.fillStyle = '#151515';
        ctx.fillRect(x, yTotal, barWidth, interestH);
      }

      if (row.year % labelEvery === 0 || i === rows.length - 1 || i === 0) {
        ctx.fillStyle = '#151515';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(String(row.year), x + barWidth / 2, padT + plotH + 6);
      }
    });

    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(21,21,21,0.7)';
    ctx.font = '11px Georgia, serif';
    ctx.fillText('years', cssWidth - padR - 22, cssHeight - 2);
  }

  function abbrev(n) {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(n % 1000000 >= 100000 ? 0 : 1) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'k';
    return '$' + Math.round(n);
  }

  function render() {
    const principal = parseNum(principalInput.value);
    const contrib = parseNum(contribInput.value);
    const rate = parseNum(rateInput.value);
    const years = parseNum(yearsInput.value);

    if (
      !isFinite(principal) || principal < 0 ||
      !isFinite(contrib) || contrib < 0 ||
      !isFinite(rate) || rate < 0 || rate > 100 ||
      !isFinite(years) || years <= 0 || years > 100 || !Number.isInteger(years)
    ) {
      resultBlock.style.display = 'none';
      return;
    }

    const atStart = atStartCheck.checked;
    const contribFreq = contribFreqSelect.value;
    const compFreq = compFreqSelect.value;
    const result = simulate(principal, contrib, contribFreq, rate, compFreq, years, atStart);

    finalValue.textContent = fmt(result.final);
    totalContribValue.textContent = fmt(result.totalContributions);
    totalInterestValue.textContent = fmt(result.totalInterest);
    interestShareValue.textContent = result.totalInterest > 0
      ? fmtPct(result.totalInterest / result.final * 100) + '% of the balance'
      : '0% of the balance';

    if (rate > 0 && result.totalInterest > 0) {
      const yearsToDouble = 72 / rate;
      ruleOf72.textContent = 'At ' + rate + '% interest, an initial balance doubles in about ' +
        (yearsToDouble < 10 ? yearsToDouble.toFixed(1) : Math.round(yearsToDouble)) + ' years. (Rule of 72)';
      ruleOf72.style.display = 'block';
    } else {
      ruleOf72.style.display = 'none';
    }

    renderTable(result.rows);
    drawChart(result.rows);
    resultBlock.style.display = 'block';
  }

  [principalInput, contribInput, rateInput, yearsInput].forEach((el) => {
    el.addEventListener('input', render);
  });
  [contribFreqSelect, compFreqSelect].forEach((el) => {
    el.addEventListener('change', render);
  });
  atStartCheck.addEventListener('change', render);
  window.addEventListener('resize', () => {
    if (resultBlock.style.display !== 'none') render();
  });

  function buildSummaryText(result) {
    const principal = parseNum(principalInput.value);
    const contrib = parseNum(contribInput.value);
    const rate = parseNum(rateInput.value);
    const years = parseNum(yearsInput.value);
    const atStart = atStartCheck.checked;
    const contribFreq = contribFreqSelect.value;
    const compFreq = compFreqSelect.value;

    const parts = [];
    parts.push('Start with ' + fmt(principal));
    if (contrib > 0) {
      const timing = atStart ? 'the start' : 'the end';
      parts.push('add ' + fmt(contrib) + ' each ' + FREQ_LABELS[contribFreq] + ' (at ' + timing + ')');
    }
    parts.push('earn ' + rate + '% compounded ' + COMP_LABELS[compFreq]);
    parts.push('after ' + years + ' years');
    const sentence = parts.join(', ') + ', the balance is ' + fmt(result.final) + '.';
    const pct = result.totalInterest > 0 ? fmtPct(result.totalInterest / result.final * 100) : '0';
    const breakdown = ' Total contributions: ' + fmt(result.totalContributions) +
      '. Interest earned: ' + fmt(result.totalInterest) + ' (' + pct + '% of the balance).';
    return sentence + breakdown;
  }

  copyBtn.addEventListener('click', () => {
    const principal = parseNum(principalInput.value);
    const contrib = parseNum(contribInput.value);
    const rate = parseNum(rateInput.value);
    const years = parseNum(yearsInput.value);
    if (
      !isFinite(principal) || principal < 0 ||
      !isFinite(contrib) || contrib < 0 ||
      !isFinite(rate) || rate < 0 || rate > 100 ||
      !isFinite(years) || years <= 0 || years > 100 || !Number.isInteger(years)
    ) {
      return;
    }
    const result = simulate(principal, contrib, contribFreqSelect.value, rate, compFreqSelect.value, years, atStartCheck.checked);
    navigator.clipboard.writeText(buildSummaryText(result)).then(() => {
      copyFeedback.style.display = '';
      setTimeout(() => {
        copyFeedback.style.display = 'none';
      }, 2000);
    }).catch(() => {});
  });

  render();

  if (typeof window.__compoundInterestTest === 'undefined') {
    window.__compoundInterestTest = { simulate: simulate };
  }
});