document.addEventListener('DOMContentLoaded', () => {
  const amountInput = document.getElementById('loan-amount');
  const rateInput = document.getElementById('interest-rate');
  const yearsInput = document.getElementById('term-years');
  const monthsInput = document.getElementById('term-months');
  const extraInput = document.getElementById('extra-payment');
  const startInput = document.getElementById('start-month');

  const resultBlock = document.getElementById('result-block');
  const errorBox = document.getElementById('error-msg');
  const monthlyValue = document.getElementById('monthly-payment');
  const totalInterestValue = document.getElementById('total-interest');
  const totalPaidValue = document.getElementById('total-paid');
  const payoffTimeValue = document.getElementById('payoff-time');
  const payoffDateWrap = document.getElementById('payoff-date-wrap');
  const payoffDateValue = document.getElementById('payoff-date');
  const savingsNote = document.getElementById('savings-note');
  const scheduleBody = document.getElementById('schedule-body');
  const csvBtn = document.getElementById('csv-btn');
  const copyBtn = document.getElementById('copy-btn');
  const copyFeedback = document.getElementById('copy-feedback');

  const money = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  });
  const monthYear = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });

  let latest = null;
  let timer = null;

  function parseMoney(value) {
    if (typeof value !== 'string') return NaN;
    const cleaned = value.replace(/[$,%\s]/g, '');
    if (cleaned === '') return NaN;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
  }

  function parseInteger(value) {
    if (typeof value !== 'string') return NaN;
    const cleaned = value.replace(/[,%\s]/g, '');
    if (cleaned === '') return NaN;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
  }

  function amortize(principal, annualRatePct, termMonths, extra) {
    const monthlyRate = annualRatePct / 100 / 12;
    const payment = monthlyRate === 0
      ? principal / termMonths
      : principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -termMonths));

    let balance = principal;
    let totalInterest = 0;
    let totalPaid = 0;
    const rows = [];
    let month = 0;

    while (balance > 0.005 && month < 600) {
      month++;
      const interest = balance * monthlyRate;
      const scheduled = Math.min(payment, balance + interest);
      let principalPart = Math.max(0, scheduled - interest);
      if (principalPart > balance) principalPart = balance;
      const extraPart = Math.min(Math.max(0, extra), Math.max(0, balance - principalPart));
      balance = Math.max(0, balance - principalPart - extraPart);
      totalInterest += interest;
      totalPaid += principalPart + interest + extraPart;
      rows.push({
        month,
        payment: principalPart + interest,
        principal: principalPart,
        interest,
        extra: extraPart,
        balance
      });
    }

    return {
      payment,
      rows,
      totalInterest,
      totalPaid,
      months: rows.length
    };
  }

  function formatDuration(months) {
    const years = Math.floor(months / 12);
    const rest = months % 12;
    if (years === 0) return rest === 1 ? '1 month' : rest + ' months';
    if (rest === 0) return years === 1 ? '1 year' : years + ' years';
    return years + (years === 1 ? ' year' : ' years') + ', ' + rest + (rest === 1 ? ' month' : ' months');
  }

  function formatPayoffDate(startValue, months) {
    const match = /^(\d{4})-(\d{2})$/.exec(startValue || '');
    if (!match) return null;
    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    if (monthIndex < 0 || monthIndex > 11) return null;
    const date = new Date(Date.UTC(year, monthIndex + months - 1, 1));
    return monthYear.format(date);
  }

  function currentMonthValue() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return now.getFullYear() + '-' + month;
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.style.display = 'block';
    resultBlock.style.display = 'none';
    latest = null;
  }

  function renderSchedule(rows) {
    scheduleBody.innerHTML = '';
    const frag = document.createDocumentFragment();
    rows.forEach(row => {
      const tr = document.createElement('tr');
      const cells = [
        String(row.month),
        money.format(row.payment),
        money.format(row.principal),
        money.format(row.interest),
        row.extra > 0 ? money.format(row.extra) : '-',
        money.format(row.balance)
      ];
      cells.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      frag.appendChild(tr);
    });
    scheduleBody.appendChild(frag);
  }

  function compute() {
    const principal = parseMoney(amountInput.value);
    const annualRate = parseMoney(rateInput.value);
    const years = parseInteger(yearsInput.value);
    const months = parseInteger(monthsInput.value);
    const extra = parseMoney(extraInput.value);

    if (!Number.isFinite(principal) || principal <= 0) {
      showError('Enter a loan amount greater than 0.');
      return;
    }
    if (!Number.isFinite(annualRate) || annualRate < 0 || annualRate > 100) {
      showError('Enter an interest rate between 0 and 100.');
      return;
    }
    const safeYears = Number.isFinite(years) ? years : 0;
    const safeMonths = Number.isFinite(months) ? months : 0;
    if (safeYears < 0 || safeMonths < 0 || (safeYears === 0 && safeMonths === 0)) {
      showError('Enter a loan term of at least 1 month.');
      return;
    }
    const termMonths = Math.round(safeYears * 12 + safeMonths);
    if (termMonths > 600) {
      showError('Enter a loan term of 50 years or less.');
      return;
    }
    if (!Number.isFinite(extra) || extra < 0) {
      showError('Enter an extra payment of 0 or more.');
      return;
    }
    const baseline = amortize(principal, annualRate, termMonths, 0);
    const actual = amortize(principal, annualRate, termMonths, extra);

    errorBox.style.display = 'none';
    resultBlock.style.display = 'block';

    monthlyValue.textContent = money.format(actual.payment);
    totalInterestValue.textContent = money.format(actual.totalInterest);
    totalPaidValue.textContent = money.format(actual.totalPaid);
    payoffTimeValue.textContent = formatDuration(actual.months);

    const payoffDate = formatPayoffDate(startInput.value, actual.months);
    if (payoffDate) {
      payoffDateWrap.style.display = '';
      payoffDateValue.textContent = payoffDate;
    } else {
      payoffDateWrap.style.display = 'none';
    }

    if (extra > 0) {
      const interestSaved = Math.max(0, baseline.totalInterest - actual.totalInterest);
      const monthsSaved = Math.max(0, baseline.months - actual.months);
      if (interestSaved > 0.005 && monthsSaved > 0) {
        savingsNote.style.display = 'block';
        savingsNote.textContent = 'Extra payments save ' + money.format(interestSaved) +
          ' in interest and pay the loan off ' + formatDuration(monthsSaved) + ' earlier.';
      } else if (interestSaved > 0.005) {
        savingsNote.style.display = 'block';
        savingsNote.textContent = 'Extra payments save ' + money.format(interestSaved) + ' in interest.';
      } else {
        savingsNote.style.display = 'none';
      }
    } else {
      savingsNote.style.display = 'none';
    }

    renderSchedule(actual.rows);

    latest = {
      principal,
      annualRate,
      termMonths,
      extra,
      baseline,
      actual,
      payoffDate
    };
  }

  function scheduleCompute() {
    clearTimeout(timer);
    timer = setTimeout(compute, 120);
  }

  function buildCsv() {
    if (!latest) return '';
    const lines = [
      'Month,Payment,Principal,Interest,Extra,Balance'
    ];
    latest.actual.rows.forEach(row => {
      lines.push([
        row.month,
        row.payment.toFixed(2),
        row.principal.toFixed(2),
        row.interest.toFixed(2),
        row.extra.toFixed(2),
        row.balance.toFixed(2)
      ].join(','));
    });
    return lines.join('\n');
  }

  function buildSummary() {
    if (!latest) return '';
    const lines = [
      'Loan amount: ' + money.format(latest.principal),
      'Interest rate: ' + latest.annualRate + '%',
      'Term: ' + formatDuration(latest.termMonths),
      'Monthly payment: ' + money.format(latest.actual.payment),
      'Total interest: ' + money.format(latest.actual.totalInterest),
      'Total paid: ' + money.format(latest.actual.totalPaid),
      'Payoff time: ' + formatDuration(latest.actual.months)
    ];
    if (latest.payoffDate) lines.push('Estimated payoff: ' + latest.payoffDate);
    if (latest.extra > 0) {
      const saved = Math.max(0, latest.baseline.totalInterest - latest.actual.totalInterest);
      lines.push('Extra payment: ' + money.format(latest.extra) + ' per month');
      lines.push('Interest saved: ' + money.format(saved));
    }
    return lines.join('\n');
  }

  csvBtn.addEventListener('click', () => {
    if (!latest) return;
    const blob = new Blob([buildCsv()], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'loan-amortization-schedule.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  copyBtn.addEventListener('click', () => {
    if (!latest) return;
    navigator.clipboard.writeText(buildSummary()).then(() => {
      copyFeedback.style.display = 'inline';
      setTimeout(() => { copyFeedback.style.display = 'none'; }, 1500);
    }).catch(() => {});
  });

  [amountInput, rateInput, yearsInput, monthsInput, extraInput, startInput].forEach(input => {
    input.addEventListener('input', scheduleCompute);
    input.addEventListener('change', scheduleCompute);
  });

  if (!startInput.value) startInput.value = currentMonthValue();
  compute();
});
