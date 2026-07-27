document.addEventListener('DOMContentLoaded', () => {
  const startDate = document.getElementById('start-date');
  const endDate = document.getElementById('end-date');
  const includeEnd = document.getElementById('include-end');
  const calcBtn = document.getElementById('calc-btn');
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

  function setDefaultDates() {
    const now = new Date();
    const end = new Date(now);
    end.setDate(now.getDate() + 7);
    startDate.value = formatDateInput(now);
    endDate.value = formatDateInput(end);
  }

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

    let dayDiff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    if (includeEnd.checked) {
      dayDiff += 1;
    }

    const weeks = dayDiff / 7;
    const months = dayDiff / 30.436875;
    const years = dayDiff / 365.25;

    let yearsComponent = end.getFullYear() - start.getFullYear();
    let monthsComponent = end.getMonth() - start.getMonth();
    let daysComponent = end.getDate() - start.getDate();

    if (daysComponent < 0) {
      monthsComponent--;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      daysComponent += prevMonth.getDate();
    }
    if (monthsComponent < 0) {
      yearsComponent--;
      monthsComponent += 12;
    }

    resultDisplay.innerHTML = '<strong>' + dayDiff.toLocaleString() + ' days</strong>'
      + ' between ' + formatDateDisplay(start)
      + ' and ' + formatDateDisplay(end);

    totalDays.textContent = dayDiff.toLocaleString();
    totalWeeks.textContent = weeks.toFixed(1);
    totalMonths.textContent = months.toFixed(1);
    totalYears.textContent = years.toFixed(1);

    resultBlock.style.display = '';
  }

  calcBtn.addEventListener('click', calculateDuration);

  swapBtn.addEventListener('click', () => {
    const temp = startDate.value;
    startDate.value = endDate.value;
    endDate.value = temp;
    if (resultBlock.style.display !== 'none') {
      calculateDuration();
    }
  });

  clearBtn.addEventListener('click', () => {
    setDefaultDates();
    resultBlock.style.display = 'none';
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
});
