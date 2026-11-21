document.addEventListener('DOMContentLoaded', () => {
  const startDate = document.getElementById('start-date');
  const endDate = document.getElementById('end-date');
  const includeEnd = document.getElementById('include-end');
  const swapBtn = document.getElementById('swap-btn');
  const clearBtn = document.getElementById('clear-btn');
  const resultBlock = document.getElementById('result-block');
  const resultDisplay = document.getElementById('result-display');
  const totalDays = document.getElementById('total-days');
  const totalWeeks = document.getElementById('total-weeks');
  const totalMonths = document.getElementById('total-months');
  const totalYears = document.getElementById('total-years');
  const copyBtn = document.getElementById('copy-btn');
  const copyFeedback = document.getElementById('copy-feedback');

  function formatDateInput(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function formatDateDisplay(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
  }

  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function addMonths(date, months) {
    const total = date.getMonth() + months;
    const year = date.getFullYear() + Math.floor(total / 12);
    const month = ((total % 12) + 12) % 12;
    const day = Math.min(date.getDate(), daysInMonth(year, month));
    return new Date(year, month, day);
  }

  function addDays(date, days) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  }

  function utcDaysBetween(a, b) {
    const ms = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
             - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    return Math.round(ms / 86400000);
  }

  function decompose(start, end) {
    let years = end.getFullYear() - start.getFullYear();
    if (addMonths(start, years * 12) > end) {
      years--;
    }
    let months = 0;
    while (months < 12 && addMonths(start, years * 12 + months + 1) <= end) {
      months++;
    }
    const days = utcDaysBetween(addMonths(start, years * 12 + months), end);
    return { years, months, days };
  }

  function plural(value, unit) {
    return value + ' ' + unit + (value === 1 ? '' : 's');
  }

  function formatBreakdown(parts) {
    const units = [];
    if (parts.years) units.push(plural(parts.years, 'year'));
    if (parts.months) units.push(plural(parts.months, 'month'));
    if (parts.days) units.push(plural(parts.days, 'day'));
    if (units.length === 0) return '0 days';
    if (units.length === 1) return units[0];
    if (units.length === 2) return units[0] + ' and ' + units[1];
    return units[0] + ', ' + units[1] + ', and ' + units[2];
  }

  function setDefaultDates() {
    const now = new Date();
    const end = new Date(now);
    end.setDate(now.getDate() + 7);
    startDate.value = formatDateInput(now);
    endDate.value = formatDateInput(end);
  }

  function calculateDuration() {
    const startVal = startDate.value;
    const endVal = endDate.value;
    if (!startVal || !endVal) {
      resultBlock.style.display = 'none';
      return;
    }

    let start = new Date(startVal + 'T00:00:00');
    let end = new Date(endVal + 'T00:00:00');

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      resultBlock.style.display = 'none';
      return;
    }

    if (end < start) {
      const temp = start;
      start = end;
      end = temp;
    }

    const inclusive = includeEnd.checked;
    const spanEnd = inclusive ? addDays(end, 1) : end;
    const dayDiff = utcDaysBetween(start, spanEnd);
    const calendar = decompose(start, spanEnd);

    resultDisplay.innerHTML = '<strong>' + formatBreakdown(calendar) + '</strong> from '
      + formatDateDisplay(start) + ' to ' + formatDateDisplay(end)
      + (inclusive ? ' (end date included)' : '');

    totalDays.textContent = dayDiff.toLocaleString();
    totalWeeks.textContent = (dayDiff / 7).toFixed(1);
    totalMonths.textContent = (dayDiff / 30.436875).toFixed(1);
    totalYears.textContent = (dayDiff / 365.25).toFixed(1);

    resultBlock.style.display = '';
  }

  startDate.addEventListener('input', calculateDuration);
  startDate.addEventListener('change', calculateDuration);
  endDate.addEventListener('input', calculateDuration);
  endDate.addEventListener('change', calculateDuration);
  includeEnd.addEventListener('change', calculateDuration);

  swapBtn.addEventListener('click', () => {
    const temp = startDate.value;
    startDate.value = endDate.value;
    endDate.value = temp;
    calculateDuration();
  });

  clearBtn.addEventListener('click', () => {
    setDefaultDates();
    includeEnd.checked = false;
    calculateDuration();
  });

  copyBtn.addEventListener('click', () => {
    const text = resultDisplay.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      copyFeedback.style.display = '';
      setTimeout(() => { copyFeedback.style.display = 'none'; }, 2000);
    }).catch(() => {});
  });

  setDefaultDates();
  calculateDuration();
});
