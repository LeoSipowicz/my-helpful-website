document.addEventListener('DOMContentLoaded', () => {
  const birthDate = document.getElementById('birth-date');
  const ageOnDate = document.getElementById('age-on-date');
  const todayBtn = document.getElementById('today-btn');
  const copyBtn = document.getElementById('copy-btn');
  const copyFeedback = document.getElementById('copy-feedback');
  const errorMsg = document.getElementById('error-msg');
  const resultBlock = document.getElementById('result-block');
  const resultDisplay = document.getElementById('result-display');
  const totalYears = document.getElementById('total-years');
  const totalMonths = document.getElementById('total-months');
  const totalWeeks = document.getElementById('total-weeks');
  const totalDays = document.getElementById('total-days');
  const nextBirthday = document.getElementById('next-birthday');

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

  function isLeapYear(y) {
    return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  }

  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function utcDaysBetween(a, b) {
    const ms = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
             - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    return Math.floor(ms / 86400000);
  }

  function addMonths(date, months) {
    const total = date.getMonth() + months;
    const year = date.getFullYear() + Math.floor(total / 12);
    const month = ((total % 12) + 12) % 12;
    const day = Math.min(date.getDate(), daysInMonth(year, month));
    return new Date(year, month, day);
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

  function nextBirthdayDate(birth, from) {
    let year = from.getFullYear();
    let month = birth.getMonth();
    let day = birth.getDate();
    if (month === 1 && day === 29 && !isLeapYear(year)) {
      day = 28;
    }
    let bday = new Date(year, month, day);
    if (bday <= from) {
      year++;
      if (month === 1 && day === 29 && !isLeapYear(year)) {
        day = 28;
      }
      bday = new Date(year, month, day);
    }
    return bday;
  }

  function setDefaults() {
    const now = new Date();
    const birth = new Date(now.getFullYear() - 30, now.getMonth(), now.getDate());
    birthDate.value = formatDateInput(birth);
    ageOnDate.value = formatDateInput(now);
  }

  function calculate() {
    errorMsg.style.display = 'none';
    const birthVal = birthDate.value;
    const ageOnVal = ageOnDate.value;
    if (!birthVal || !ageOnVal) {
      resultBlock.style.display = 'none';
      return;
    }

    const birth = new Date(birthVal + 'T00:00:00');
    const ageOn = new Date(ageOnVal + 'T00:00:00');
    if (isNaN(birth.getTime()) || isNaN(ageOn.getTime())) {
      resultBlock.style.display = 'none';
      return;
    }

    if (birth > ageOn) {
      errorMsg.textContent = 'Date of birth must be on or before the age-on date.';
      errorMsg.style.display = '';
      resultBlock.style.display = 'none';
      return;
    }

    const age = decompose(birth, ageOn);
    const totalDaysVal = utcDaysBetween(birth, ageOn);
    const totalMonthsVal = Math.floor(totalDaysVal / 30.436875);
    const totalWeeksVal = totalDaysVal / 7;
    const nb = nextBirthdayDate(birth, ageOn);
    const daysToNext = utcDaysBetween(ageOn, nb);

    const yLabel = age.years === 1 ? 'year' : 'years';
    const mLabel = age.months === 1 ? 'month' : 'months';
    const dLabel = age.days === 1 ? 'day' : 'days';

    resultDisplay.innerHTML = '<strong>' + age.years + '</strong> ' + yLabel
      + ', <strong>' + age.months + '</strong> ' + mLabel
      + ', and <strong>' + age.days + '</strong> ' + dLabel
      + ' old on ' + formatDateDisplay(ageOn);

    totalYears.textContent = age.years.toLocaleString();
    totalMonths.textContent = totalMonthsVal.toLocaleString();
    totalWeeks.textContent = totalWeeksVal.toFixed(1);
    totalDays.textContent = totalDaysVal.toLocaleString();

    const nbText = daysToNext === 0
      ? 'Today'
      : (daysToNext === 1 ? 'Tomorrow' : 'in ' + daysToNext.toLocaleString() + ' days');
    nextBirthday.textContent = formatDateDisplay(nb) + ' (' + nbText + ')';

    resultBlock.style.display = '';
  }

  birthDate.addEventListener('change', calculate);
  ageOnDate.addEventListener('input', calculate);
  ageOnDate.addEventListener('change', calculate);

  todayBtn.addEventListener('click', () => {
    ageOnDate.value = formatDateInput(new Date());
    calculate();
  });

  copyBtn.addEventListener('click', () => {
    const text = resultDisplay.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      copyFeedback.style.display = '';
      setTimeout(() => { copyFeedback.style.display = 'none'; }, 2000);
    }).catch(() => {});
  });

  setDefaults();
  calculate();
});
