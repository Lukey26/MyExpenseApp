const LOCALE = 'en-US';
const DEFAULT_CURRENCY = 'USD'; // change to 'TTD' if you want

export const formatCurrency = (n: number, currency = DEFAULT_CURRENCY) =>
  new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format(n);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(LOCALE);

export const getMonthKey = (isoDate: string) => isoDate.slice(0, 7); // 'YYYY-MM'