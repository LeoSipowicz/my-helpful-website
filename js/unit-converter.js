(function() {
  'use strict';

  const CATEGORIES = {
    length: {
      units: {
        m:    { name: 'Meter (m)', factor: 1 },
        km:   { name: 'Kilometer (km)', factor: 1000 },
        cm:   { name: 'Centimeter (cm)', factor: 0.01 },
        mm:   { name: 'Millimeter (mm)', factor: 0.001 },
        um:   { name: 'Micrometer (µm)', factor: 0.000001 },
        nm:   { name: 'Nanometer (nm)', factor: 0.000000001 },
        mi:   { name: 'Mile (mi)', factor: 1609.344 },
        yd:   { name: 'Yard (yd)', factor: 0.9144 },
        ft:   { name: 'Foot (ft)', factor: 0.3048 },
        in:   { name: 'Inch (in)', factor: 0.0254 },
        nmi:  { name: 'Nautical mile (nmi)', factor: 1852 }
      }
    },
    weight: {
      units: {
        g:    { name: 'Gram (g)', factor: 1 },
        kg:   { name: 'Kilogram (kg)', factor: 1000 },
        mg:   { name: 'Milligram (mg)', factor: 0.001 },
        t:    { name: 'Metric ton (t)', factor: 1000000 },
        lb:   { name: 'Pound (lb)', factor: 453.59237 },
        oz:   { name: 'Ounce (oz)', factor: 28.349523125 },
        st:   { name: 'Stone (st)', factor: 6350.29318 },
        ust:  { name: 'US ton', factor: 907184.74 }
      }
    },
    temperature: {
      units: {
        c: { name: 'Celsius (°C)' },
        f: { name: 'Fahrenheit (°F)' },
        k: { name: 'Kelvin (K)' }
      }
    },
    area: {
      units: {
        m2:   { name: 'Square meter (m²)', factor: 1 },
        km2:  { name: 'Square kilometer (km²)', factor: 1000000 },
        cm2:  { name: 'Square centimeter (cm²)', factor: 0.0001 },
        mm2:  { name: 'Square millimeter (mm²)', factor: 0.000001 },
        ha:   { name: 'Hectare (ha)', factor: 10000 },
        acre: { name: 'Acre', factor: 4046.8564224 },
        mi2:  { name: 'Square mile (mi²)', factor: 2589988.110336 },
        yd2:  { name: 'Square yard (yd²)', factor: 0.83612736 },
        ft2:  { name: 'Square foot (ft²)', factor: 0.09290304 },
        in2:  { name: 'Square inch (in²)', factor: 0.00064516 }
      }
    },
    volume: {
      units: {
        l:      { name: 'Liter (L)', factor: 1 },
        ml:     { name: 'Milliliter (mL)', factor: 0.001 },
        m3:     { name: 'Cubic meter (m³)', factor: 1000 },
        cm3:    { name: 'Cubic centimeter (cm³)', factor: 0.001 },
        tsp:    { name: 'US teaspoon (tsp)', factor: 0.00492892159375 },
        tbsp:   { name: 'US tablespoon (tbsp)', factor: 0.01478676478125 },
        floz_us:{ name: 'US fluid ounce (fl oz)', factor: 0.0295735295625 },
        cup_us: { name: 'US cup', factor: 0.2365882365 },
        pt_us:  { name: 'US pint (pt)', factor: 0.473176473 },
        qt_us:  { name: 'US quart (qt)', factor: 0.946352946 },
        gal_us: { name: 'US gallon (gal)', factor: 3.785411784 },
        gal_uk: { name: 'UK gallon', factor: 4.54609 },
        in3:    { name: 'Cubic inch (in³)', factor: 0.016387064 },
        ft3:    { name: 'Cubic foot (ft³)', factor: 28.316846592 }
      }
    },
    speed: {
      units: {
        mps:  { name: 'Meter per second (m/s)', factor: 1 },
        kmh:  { name: 'Kilometer per hour (km/h)', factor: 0.2777777777777778 },
        mph:  { name: 'Mile per hour (mph)', factor: 0.44704 },
        fts:  { name: 'Foot per second (ft/s)', factor: 0.3048 },
        knot: { name: 'Knot (kn)', factor: 0.5144444444444445 },
        mach: { name: 'Mach', factor: 340.29 }
      }
    },
    time: {
      units: {
        ms:  { name: 'Millisecond (ms)', factor: 0.001 },
        s:   { name: 'Second (s)', factor: 1 },
        min: { name: 'Minute (min)', factor: 60 },
        h:   { name: 'Hour (h)', factor: 3600 },
        d:   { name: 'Day (d)', factor: 86400 },
        wk:  { name: 'Week (wk)', factor: 604800 },
        mo:  { name: 'Month (30 days)', factor: 2592000 },
        yr:  { name: 'Year (365 days)', factor: 31536000 }
      }
    },
    data: {
      units: {
        b:  { name: 'Bit (b)', factor: 0.125 },
        B:  { name: 'Byte (B)', factor: 1 },
        kb: { name: 'Kilobyte (KB)', factor: 1024 },
        mb: { name: 'Megabyte (MB)', factor: 1048576 },
        gb: { name: 'Gigabyte (GB)', factor: 1073741824 },
        tb: { name: 'Terabyte (TB)', factor: 1099511627776 },
        pb: { name: 'Petabyte (PB)', factor: 1125899906842624 }
      }
    }
  };

  const categorySelect = document.getElementById('category');
  const fromUnitSelect = document.getElementById('from-unit');
  const toUnitSelect = document.getElementById('to-unit');
  const fromValueInput = document.getElementById('from-value');
  const toValueInput = document.getElementById('to-value');
  const conversionList = document.getElementById('conversion-list');
  const swapBtn = document.getElementById('swap-btn');
  const copyBtn = document.getElementById('copy-btn');
  const copyFeedback = document.getElementById('copy-feedback');

  function getCategory() {
    return CATEGORIES[categorySelect.value];
  }

  function toBase(value, unit) {
    const cat = getCategory();
    if (cat.units[unit].factor !== undefined) {
      return value * cat.units[unit].factor;
    }
    if (unit === 'c') return value;
    if (unit === 'f') return (value - 32) * 5 / 9;
    return value - 273.15;
  }

  function fromBase(baseValue, unit) {
    const cat = getCategory();
    if (cat.units[unit].factor !== undefined) {
      return baseValue / cat.units[unit].factor;
    }
    if (unit === 'c') return baseValue;
    if (unit === 'f') return baseValue * 9 / 5 + 32;
    return baseValue + 273.15;
  }

  function formatNumber(n) {
    if (!isFinite(n)) return '-';
    if (n === 0) return '0';
    return String(parseFloat(n.toPrecision(10)));
  }

  function populateUnitSelect(select, selectedKey) {
    select.innerHTML = '';
    const units = getCategory().units;
    Object.keys(units).forEach(function(key) {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = units[key].name;
      select.appendChild(opt);
    });
    select.value = selectedKey;
  }

  function renderList(baseValue) {
    conversionList.innerHTML = '';
    const units = getCategory().units;
    const valid = baseValue !== null && isFinite(baseValue);
    Object.keys(units).forEach(function(key) {
      const row = document.createElement('div');
      row.className = 'conv-row';

      const label = document.createElement('span');
      label.className = 'conv-label';
      label.textContent = units[key].name;

      const value = document.createElement('span');
      value.className = 'conv-value';
      value.textContent = valid ? formatNumber(fromBase(baseValue, key)) : '-';

      const copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'conv-copy';
      copy.textContent = 'Copy';

      row.appendChild(label);
      row.appendChild(value);
      row.appendChild(copy);
      conversionList.appendChild(row);
    });
  }

  function update() {
    const raw = fromValueInput.value.trim();
    if (raw === '') {
      toValueInput.value = '';
      renderList(null);
      return;
    }
    const val = parseFloat(raw);
    if (isNaN(val)) {
      toValueInput.value = 'Invalid';
      renderList(null);
      return;
    }
    const base = toBase(val, fromUnitSelect.value);
    toValueInput.value = formatNumber(fromBase(base, toUnitSelect.value));
    renderList(base);
  }

  fromValueInput.addEventListener('input', update);

  fromUnitSelect.addEventListener('change', update);

  toUnitSelect.addEventListener('change', update);

  toValueInput.addEventListener('input', function() {
    const raw = toValueInput.value.trim();
    if (raw === '') {
      fromValueInput.value = '';
      renderList(null);
      return;
    }
    const val = parseFloat(raw);
    if (isNaN(val)) {
      fromValueInput.value = 'Invalid';
      renderList(null);
      return;
    }
    const base = toBase(val, toUnitSelect.value);
    fromValueInput.value = formatNumber(fromBase(base, fromUnitSelect.value));
    renderList(base);
  });

  categorySelect.addEventListener('change', function() {
    const keys = Object.keys(getCategory().units);
    populateUnitSelect(fromUnitSelect, keys[0]);
    populateUnitSelect(toUnitSelect, keys[1]);
    fromValueInput.value = '1';
    update();
  });

  swapBtn.addEventListener('click', function() {
    const unit = fromUnitSelect.value;
    fromUnitSelect.value = toUnitSelect.value;
    toUnitSelect.value = unit;
    const value = fromValueInput.value;
    fromValueInput.value = toValueInput.value;
    toValueInput.value = value;
    update();
  });

  copyBtn.addEventListener('click', function() {
    const text = toValueInput.value;
    if (!text || text === 'Invalid') return;
    navigator.clipboard.writeText(text).then(function() {
      copyFeedback.style.display = '';
      setTimeout(function() {
        copyFeedback.style.display = 'none';
      }, 2000);
    }).catch(function() {});
  });

  conversionList.addEventListener('click', function(e) {
    if (!e.target.classList.contains('conv-copy')) return;
    const row = e.target.closest('.conv-row');
    const value = row.querySelector('.conv-value').textContent;
    if (value === '-' || value === 'Invalid') return;
    navigator.clipboard.writeText(value).then(function() {
      e.target.textContent = 'Copied!';
      setTimeout(function() {
        e.target.textContent = 'Copy';
      }, 2000);
    }).catch(function() {});
  });

  populateUnitSelect(fromUnitSelect, 'm');
  populateUnitSelect(toUnitSelect, 'km');
  fromValueInput.value = '1';
  update();
})();
