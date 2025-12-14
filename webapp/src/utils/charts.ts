export const getLastSunday = (): Date => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day; // last Sunday
  const sunday = new Date(now.setDate(diff));
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

export const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const getSundaysBack = (intervalMonths: number): Date[] => {
  const lastSunday = getLastSunday();
  const sundays = [];

  const startDate = new Date(lastSunday);
  startDate.setMonth(startDate.getMonth() - intervalMonths);

  let current = new Date(lastSunday);
  while (current >= startDate) {
    sundays.push(current);
    current.setDate(current.getDate() - 7); // go back 1 week
  }

  // sort ascending (oldest first)
  return sundays.reverse();
}