import { NextResponse } from 'next/server';

const BOT_TOKEN = '8784718481:AAFE3ufl3cmCH-ckGKLOrkfMfwnnIcjtPl4';
// Men bu yerga chat ID larni massiv ko'rinishida qo'shib borishim mumkin
const CHAT_IDS = ['7469835342', '1298764274']; // Ikkala chat ID ham qo'shildi

const gptAnalysisPrompts = {
  DISC: 'Quyidagi DISC test javoblarini tahlil qiling. Nomzodning D, I, S va C profili, kuchli tomonlari, ehtimoliy xavflari hamda mos ish muhiti haqida qisqa va xolis xulosa bering.',
  PAEI: 'Quyidagi PAEI test javoblarini tahlil qiling. Nomzodning Producer, Administrator, Entrepreneur va Integrator jihatlari, kuchli tomonlari, rivojlanish nuqtalari va mos roli haqida qisqa, xolis xulosa bering.',
} as const;

export async function POST(req: Request) {
  try {
    const data = await req.json() as Record<string, unknown>;
    const firstName = typeof data.firstName === 'string' ? data.firstName.trim() : '';
    const lastName = typeof data.lastName === 'string' ? data.lastName.trim() : '';
    const testType = data.testType === 'DISC' || data.testType === 'PAEI' ? data.testType : '';
    const timeSpent = Number.isFinite(Number(data.timeSpent)) ? Math.max(1, Math.floor(Number(data.timeSpent))) : 1;
    const responses = Array.isArray(data.detailedResponses) ? data.detailedResponses.flatMap((response) => {
      if (!response || typeof response !== 'object') return [];
      const item = response as Record<string, unknown>;
      const question = typeof item.question === 'string' ? item.question.trim() : '';
      const answer = typeof item.answer === 'string' ? item.answer.trim() : '';
      return question && answer ? [{ question, answer }] : [];
    }) : [];

    if (!firstName || !lastName || !testType || !responses.length) {
      return NextResponse.json({ success: false, error: 'Test javoblari noto‘g‘ri' }, { status: 400 });
    }

    const sendMessage = async (chatId: string, payload: Record<string, unknown>) => {
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, ...payload }),
      });
      if (!response.ok) throw new Error('Telegram xabari yuborilmadi');
    };

    const summary = `🎯 Yangi profil javoblari\n\n👤 Candidat: ${firstName} ${lastName}\n📝 Test turi: ${testType}\n⏱ Sarflangan vaqt: ${timeSpent} daqiqa\n📊 Savollar: ${responses.length} ta\n📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;
    const answersMessage = responses.map((response, index) => `${index + 1}. Savol: ${response.question}\nJavob: ${response.answer}`).join('\n\n');
    const message = `${summary}\n\n📝 Javoblar\n\n${answersMessage}`;
    const copyText = gptAnalysisPrompts[testType];

    await Promise.all(CHAT_IDS.map((chatId) => sendMessage(chatId, {
      text: message,
      reply_markup: {
        inline_keyboard: [[{
          text: 'GPT tahlil promptini nusxalash',
          copy_text: { text: copyText },
        }]],
      },
    })));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Telegram error:', error);
    return NextResponse.json({ success: false, error: 'Xabar yuborishda xatolik' }, { status: 500 });
  }
}
