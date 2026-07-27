const UZ_MONTHS_SHORT = [
  'yan', 'fev', 'mar', 'apr', 'may', 'iyun',
  'iyul', 'avg', 'sen', 'okt', 'noy', 'dek',
];

const UZ_MONTHS_LONG = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
];

// Node'ning standart ICU to'plamida 'uz-UZ' lokali to'liq bo'lmagani uchun
// Intl.DateTimeFormat server va brauzerda har xil natija berishi mumkin
// (hydration mismatch). Shu sabab sana qo'lda formatlanadi.
export function formatUzDateShort(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${String(date.getDate()).padStart(2, '0')}-${UZ_MONTHS_SHORT[date.getMonth()]}, ${date.getFullYear()}`;
}

export function formatUzDateLong(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${String(date.getDate()).padStart(2, '0')}-${UZ_MONTHS_LONG[date.getMonth()]}, ${date.getFullYear()}`;
}
