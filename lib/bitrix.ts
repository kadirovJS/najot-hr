export function normalizeBitrixFormUrl(value: unknown, required = false) {
  if (typeof value !== 'string' || !value.trim()) {
    if (required) throw new Error('Bitrix24 ariza formasi havolasini kiriting');
    return '';
  }

  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new Error('Bitrix24 havolasi http yoki https bilan boshlanishi kerak');
    }
    return url.toString();
  } catch (error) {
    if (error instanceof Error && error.message.includes('http yoki https')) throw error;
    throw new Error('Bitrix24 formasi havolasi noto‘g‘ri');
  }
}
