(function () {
  'use strict';

  var ZONES = [
    { id: 'UTC', label: 'UTC', region: 'UTC' },
    { id: 'America/Los_Angeles', label: 'Los Angeles', region: 'Americas' },
    { id: 'America/Denver', label: 'Denver', region: 'Americas' },
    { id: 'America/Chicago', label: 'Chicago', region: 'Americas' },
    { id: 'America/New_York', label: 'New York', region: 'Americas' },
    { id: 'America/Sao_Paulo', label: 'Sao Paulo', region: 'Americas' },
    { id: 'Europe/London', label: 'London', region: 'Europe' },
    { id: 'Europe/Paris', label: 'Paris', region: 'Europe' },
    { id: 'Europe/Berlin', label: 'Berlin', region: 'Europe' },
    { id: 'Europe/Moscow', label: 'Moscow', region: 'Europe' },
    { id: 'Africa/Cairo', label: 'Cairo', region: 'Africa' },
    { id: 'Africa/Johannesburg', label: 'Johannesburg', region: 'Africa' },
    { id: 'Asia/Dubai', label: 'Dubai', region: 'Asia' },
    { id: 'Asia/Kolkata', label: 'Mumbai / New Delhi', region: 'Asia' },
    { id: 'Asia/Singapore', label: 'Singapore', region: 'Asia' },
    { id: 'Asia/Shanghai', label: 'Shanghai', region: 'Asia' },
    { id: 'Asia/Tokyo', label: 'Tokyo', region: 'Asia' },
    { id: 'Australia/Sydney', label: 'Sydney', region: 'Oceania' },
    { id: 'Pacific/Auckland', label: 'Auckland', region: 'Oceania' }
  ];

  var FRIENDLY = {};
  ZONES.forEach(function (zone) {
    FRIENDLY[zone.id] = zone.label;
  });

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  var dateInput = document.getElementById('tz-date');
  var timeInput = document.getElementById('tz-time');
  var fromSelect = document.getElementById('tz-from');
  var toSelect = document.getElementById('tz-to');
  var nowButton = document.getElementById('tz-now');
  var message = document.getElementById('tz-message');
  var resultSection = document.getElementById('tz-result-section');
  var toName = document.getElementById('tz-to-name');
  var resultTime = document.getElementById('tz-result-time');
  var resultSub = document.getElementById('tz-result-sub');
  var tableBody = document.getElementById('tz-body');

  if (!dateInput || !timeInput || !fromSelect || !toSelect || !nowButton ||
      !message || !resultSection || !toName || !resultTime || !resultSub || !tableBody) {
    return;
  }

  var tableSection = tableBody.closest('section');
  var formatterCache = {};
  var localZone = detectLocalZone();
  var fromZone = localZone;
  var toZone = defaultToZone(localZone);
  var liveNow = true;

  function detectLocalZone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch (error) {
      return 'UTC';
    }
  }

  function defaultToZone(zone) {
    return zone === 'Europe/London' ? 'America/New_York' : 'Europe/London';
  }

  function zoneLabel(id) {
    return FRIENDLY[id] || id.replace(/_/g, ' ');
  }

  function pad(value) {
    return (value < 10 ? '0' : '') + value;
  }

  function utcMs(year, month, day, hour, minute) {
    var date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    date.setUTCHours(hour, minute, 0, 0);
    return date.getTime();
  }

  function getFormatter(timeZone) {
    if (!formatterCache[timeZone]) {
      formatterCache[timeZone] = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
    return formatterCache[timeZone];
  }

  function zoneParts(instant, timeZone) {
    var parts = getFormatter(timeZone).formatToParts(instant);
    var values = {};
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].type !== 'literal') values[parts[i].type] = parts[i].value;
    }
    var hour = parseInt(values.hour, 10);
    if (values.dayPeriod) {
      var isPm = /pm/i.test(values.dayPeriod);
      if (isPm && hour !== 12) hour += 12;
      if (!isPm && hour === 12) hour = 0;
    }
    if (hour === 24) hour = 0;
    return {
      year: parseInt(values.year, 10),
      month: parseInt(values.month, 10),
      day: parseInt(values.day, 10),
      hour: hour,
      minute: parseInt(values.minute, 10),
      second: parseInt(values.second, 10)
    };
  }

  function offsetMs(instant, timeZone) {
    var parts = zoneParts(instant, timeZone);
    var localAsUtc = utcMs(parts.year, parts.month, parts.day, parts.hour, parts.minute);
    localAsUtc += parts.second * 1000;
    var base = Math.floor(instant.getTime() / 1000) * 1000;
    return localAsUtc - base;
  }

  function zonedToInstant(year, month, day, hour, minute, timeZone) {
    var target = utcMs(year, month, day, hour, minute);
    var instant = target - offsetMs(new Date(target), timeZone);
    for (var i = 0; i < 2; i++) {
      var next = target - offsetMs(new Date(instant), timeZone);
      if (next === instant) break;
      instant = next;
    }
    return new Date(instant);
  }

  function weekdayIndex(parts) {
    return new Date(utcMs(parts.year, parts.month, parts.day, 0, 0)).getUTCDay();
  }

  function isBusinessHours(parts) {
    var day = weekdayIndex(parts);
    return day >= 1 && day <= 5 && parts.hour >= 9 && parts.hour < 17;
  }

  function formatTime(parts) {
    var hour = parts.hour % 12;
    if (hour === 0) hour = 12;
    return hour + ':' + pad(parts.minute) + ' ' + (parts.hour < 12 ? 'AM' : 'PM');
  }

  function formatDate(parts) {
    return WEEKDAYS[weekdayIndex(parts)] + ', ' + MONTHS[parts.month - 1] + ' ' +
      parts.day + ', ' + parts.year;
  }

  function formatTableDate(parts, baseYear) {
    var text = WEEKDAYS_SHORT[weekdayIndex(parts)] + ', ' +
      MONTHS[parts.month - 1] + ' ' + parts.day;
    if (parts.year !== baseYear) text += ', ' + parts.year;
    return text;
  }

  function formatOffset(instant, timeZone) {
    var total = Math.round(offsetMs(instant, timeZone) / 60000);
    var sign = total < 0 ? '-' : '+';
    total = Math.abs(total);
    var hours = Math.floor(total / 60);
    var minutes = total % 60;
    return 'UTC' + sign + hours + (minutes ? ':' + pad(minutes) : '');
  }

  function formatDifference(ms) {
    var total = Math.round(ms / 60000);
    if (total === 0) return 'the same time as';
    var ahead = total > 0;
    total = Math.abs(total);
    var hours = Math.floor(total / 60);
    var minutes = total % 60;
    var text = '';
    if (hours) text += hours + (hours === 1 ? ' hour' : ' hours');
    if (minutes) {
      if (text) text += ' ';
      text += minutes + (minutes === 1 ? ' minute' : ' minutes');
    }
    return text + (ahead ? ' ahead of ' : ' behind ');
  }

  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function buildZoneIds() {
    var ids = [];
    var seen = {};
    function add(id) {
      if (!id || seen[id]) return;
      seen[id] = true;
      ids.push(id);
    }
    add(localZone);
    ZONES.forEach(function (zone) {
      add(zone.id);
    });
    if (typeof Intl.supportedValuesOf === 'function') {
      try {
        Intl.supportedValuesOf('timeZone').forEach(add);
      } catch (error) {
        // Fall back to the curated list above.
      }
    }
    return ids;
  }

  function fillSelect(select, ids, selected) {
    select.textContent = '';
    ids.forEach(function (id) {
      var option = document.createElement('option');
      option.value = id;
      option.textContent = zoneLabel(id);
      select.appendChild(option);
    });
    select.value = selected;
  }

  function makeBadge(text) {
    var badge = document.createElement('span');
    badge.className = 'tz-badge';
    badge.textContent = text;
    return badge;
  }

  function getTableZones() {
    var list = [];
    var seen = {};
    function add(id, label, region) {
      if (!id || seen[id]) return;
      seen[id] = true;
      list.push({ id: id, label: label || zoneLabel(id), region: region || '' });
    }
    add(localZone, 'Your time zone', 'Local');
    if (fromZone !== localZone) add(fromZone, zoneLabel(fromZone), 'From');
    if (toZone !== localZone && toZone !== fromZone) add(toZone, zoneLabel(toZone), 'To');
    ZONES.forEach(function (zone) {
      add(zone.id, zone.label, zone.region);
    });
    return list;
  }

  function setNowInputs() {
    var parts = zoneParts(new Date(), fromZone);
    dateInput.value = parts.year + '-' + pad(parts.month) + '-' + pad(parts.day);
    timeInput.value = pad(parts.hour) + ':' + pad(parts.minute);
  }

  function renderTable(instant) {
    var baseParts = zoneParts(instant, fromZone);
    var baseSerial = utcMs(baseParts.year, baseParts.month, baseParts.day, 0, 0);
    var zones = getTableZones();
    tableBody.textContent = '';

    zones.forEach(function (zone) {
      var parts = zoneParts(instant, zone.id);
      var row = document.createElement('tr');
      if (isBusinessHours(parts)) row.classList.add('is-business');
      if (zone.id === fromZone) row.classList.add('is-from');
      if (zone.id === toZone) row.classList.add('is-to');

      var nameCell = document.createElement('td');
      var name = document.createElement('span');
      name.className = 'tz-name';
      name.textContent = zone.label;
      nameCell.appendChild(name);

      var meta = document.createElement('span');
      meta.className = 'tz-meta';
      var metaParts = [];
      if (zone.region) metaParts.push(zone.region);
      metaParts.push(formatOffset(instant, zone.id));
      meta.textContent = metaParts.join(' · ');
      nameCell.appendChild(meta);

      if (zone.id === fromZone) nameCell.appendChild(makeBadge('From'));
      if (zone.id === toZone) nameCell.appendChild(makeBadge('To'));

      var timeCell = document.createElement('td');
      timeCell.className = 'tz-time';
      timeCell.textContent = formatTime(parts);

      var dateCell = document.createElement('td');
      dateCell.textContent = formatTableDate(parts, baseParts.year);
      var serial = utcMs(parts.year, parts.month, parts.day, 0, 0);
      var dayDiff = Math.round((serial - baseSerial) / 86400000);
      if (dayDiff !== 0) {
        var marker = document.createElement('span');
        marker.className = 'tz-day';
        marker.textContent = dayDiff > 0 ? 'Next day' : 'Previous day';
        dateCell.appendChild(marker);
      }

      row.appendChild(nameCell);
      row.appendChild(timeCell);
      row.appendChild(dateCell);
      tableBody.appendChild(row);
    });
  }

  function showMessage(text) {
    message.textContent = text;
    message.hidden = false;
    resultSection.hidden = true;
    if (tableSection) tableSection.hidden = true;
  }

  function render() {
    if (!dateInput.value || !timeInput.value) {
      showMessage('Choose a date and time to see conversions.');
      return;
    }

    var dateParts = dateInput.value.split('-');
    var timeParts = timeInput.value.split(':');
    var year = parseInt(dateParts[0], 10);
    var month = parseInt(dateParts[1], 10);
    var day = parseInt(dateParts[2], 10);
    var hour = parseInt(timeParts[0], 10);
    var minute = parseInt(timeParts[1], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
      showMessage('Choose a valid date and time.');
      return;
    }

    message.hidden = true;
    message.textContent = '';
    resultSection.hidden = false;
    if (tableSection) tableSection.hidden = false;

    var instant = zonedToInstant(year, month, day, hour, minute, fromZone);
    var toParts = zoneParts(instant, toZone);

    toName.textContent = zoneLabel(toZone);
    resultTime.textContent = formatTime(toParts);

    var diff = offsetMs(instant, toZone) - offsetMs(instant, fromZone);
    var sub = formatDate(toParts) + ' (' + formatOffset(instant, toZone) + ').';
    if (fromZone !== toZone) {
      sub += ' ' + capitalize(formatDifference(diff)) + zoneLabel(fromZone) + '.';
    }
    resultSub.textContent = sub;

    renderTable(instant);
  }

  var zoneIds = buildZoneIds();
  fillSelect(fromSelect, zoneIds, fromZone);
  fillSelect(toSelect, zoneIds, toZone);

  setNowInputs();
  render();

  fromSelect.addEventListener('change', function () {
    fromZone = fromSelect.value;
    if (liveNow) setNowInputs();
    render();
  });

  toSelect.addEventListener('change', function () {
    toZone = toSelect.value;
    render();
  });

  dateInput.addEventListener('input', function () {
    liveNow = false;
    render();
  });

  timeInput.addEventListener('input', function () {
    liveNow = false;
    render();
  });

  nowButton.addEventListener('click', function () {
    liveNow = true;
    setNowInputs();
    render();
  });

  window.setInterval(function () {
    if (!liveNow || document.hidden) return;
    setNowInputs();
    render();
  }, 30000);
})();
