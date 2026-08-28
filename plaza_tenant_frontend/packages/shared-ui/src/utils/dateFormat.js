/**
 * Formats date and ISO timestamps into localized Indonesian date & time with auto-detected device timezone (WIB/WITA/WIT).
 * 
 * Examples:
 * - "2026-08-28T06:30:00.000000Z" -> { date: "28 Agu 2026", time: "14:30", tz: "WITA", formatted: "28 Agu 2026 • 14:30 WITA" }
 * - "2026-08-28 14:30:00" -> { date: "28 Agu 2026", time: "14:30", tz: "WITA", formatted: "28 Agu 2026 • 14:30 WITA" }
 * - "2026-08-28" -> { date: "28 Agu 2026", time: "", tz: "", formatted: "28 Agu 2026" }
 */

export function getUserTimezoneAbbr(date = new Date()) {
  try {
    const offsetMinutes = date.getTimezoneOffset(); // -480 for UTC+8 (WITA), -420 for UTC+7 (WIB), -540 for UTC+9 (WIT)
    const offsetHours = -offsetMinutes / 60;

    if (offsetHours === 7) return 'WIB';
    if (offsetHours === 8) return 'WITA';
    if (offsetHours === 9) return 'WIT';

    const dtf = new Intl.DateTimeFormat('id-ID', { timeZoneName: 'short' });
    const parts = dtf.formatToParts(date);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    if (tzPart && tzPart.value) {
      if (tzPart.value.includes('WIB') || tzPart.value.includes('GMT+7')) return 'WIB';
      if (tzPart.value.includes('WITA') || tzPart.value.includes('GMT+8')) return 'WITA';
      if (tzPart.value.includes('WIT') || tzPart.value.includes('GMT+9')) return 'WIT';
      return tzPart.value;
    }

    const sign = offsetHours >= 0 ? '+' : '';
    return `UTC${sign}${offsetHours}`;
  } catch (_) {
    return 'WITA';
  }
}

export function formatDateTimeLocal(rawDate) {
  if (!rawDate || rawDate === '-' || rawDate === '—') {
    return { date: '-', time: '', tz: '', formatted: '-', fullTitle: '-' };
  }

  if (typeof rawDate !== 'string' && !(rawDate instanceof Date)) {
    return { date: String(rawDate), time: '', tz: '', formatted: String(rawDate), fullTitle: String(rawDate) };
  }

  const str = String(rawDate).trim();
  const isPureDate = /^\d{4}-\d{2}-\d{2}$/.test(str);

  let dateObj;
  if (isPureDate) {
    const [y, m, d] = str.split('-').map(Number);
    dateObj = new Date(y, m - 1, d);
  } else {
    const mysqlPattern = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):?(\d{2})?$/;
    const match = str.match(mysqlPattern);
    if (match) {
      const [, y, m, d, hh, mm, ss] = match;
      dateObj = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss || 0));
    } else {
      dateObj = new Date(str);
    }
  }

  if (isNaN(dateObj.getTime())) {
    return { date: str, time: '', tz: '', formatted: str, fullTitle: str };
  }

  const dateFormatted = dateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const tz = getUserTimezoneAbbr(dateObj);

  if (isPureDate) {
    // If it's pure date, we format as day month year
    return {
      date: dateFormatted,
      time: '',
      tz: '',
      formatted: dateFormatted,
      fullTitle: `${dateFormatted} (Waktu Kalender)`
    };
  }

  const timeFormatted = dateObj.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace('.', ':');

  const formattedWithTime = `${dateFormatted} • ${timeFormatted} ${tz}`;
  const fullTitle = `Waktu perangkat lokal: ${dateFormatted}, ${timeFormatted} (${tz})`;

  return {
    date: dateFormatted,
    time: timeFormatted,
    tz,
    formatted: formattedWithTime,
    fullTitle
  };
}
