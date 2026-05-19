const toTwoDigits = (value: number): string =>
  value.toString().padStart(2, '0');

export const formatDateOnly = (date: Date): string =>
  `${date.getFullYear()}-${toTwoDigits(date.getMonth() + 1)}-${toTwoDigits(date.getDate())}`;

export const formatDateTime = (date: Date): string => date.toISOString();

export const parseDateOnly = (value: string): Date =>
  new Date(`${value}T00:00:00.000Z`);

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

export const diffDaysInclusive = (
  startDate: string,
  endDate: string,
): number => {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000)) + 1;
};

export const minDate = (left: string, right: string): string =>
  left <= right ? left : right;

export const getWeekStartDate = (dateInput: string | Date): string => {
  const date =
    typeof dateInput === 'string'
      ? parseDateOnly(dateInput)
      : new Date(dateInput);
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  return formatDateOnly(addDays(date, diff));
};

export const getWeekEndDate = (weekStartDate: string): string =>
  formatDateOnly(addDays(parseDateOnly(weekStartDate), 6));

export const getTodayDate = (): string => formatDateOnly(new Date());
