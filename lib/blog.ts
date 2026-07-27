const uzbekMonths = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
];

export function formatBlogDate(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return `${date.getFullYear()}-yil ${date.getDate()}-${uzbekMonths[date.getMonth()]}`;
}

export function formatViewCount(value: number) {
  return new Intl.NumberFormat('uz-UZ').format(value || 0);
}
