import { NextResponse } from 'next/server';

const BOT_TOKEN = '8784718481:AAFE3ufl3cmCH-ckGKLOrkfMfwnnIcjtPl4';
// Men bu yerga chat ID larni massiv ko'rinishida qo'shib borishim mumkin
const CHAT_IDS = ['7469835342', '1298764274']; // Ikkala chat ID ham qo'shildi

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { firstName, lastName, testType, timeSpent, correctAnswers, totalQuestions, detailedResults } = data;

    let detailedMessage = '';
    if (detailedResults && Array.isArray(detailedResults)) {
      detailedMessage = '\n📝 *Batafsil javoblar:*\n';
      detailedResults.forEach((res: any, index: number) => {
        const icon = res.isCorrect ? '✅' : '❌';
        detailedMessage += `\n${index + 1}. ${res.question}\n↳ *Javob:* ${res.answer} ${icon}\n`;
      });
    }

    const message = `
🎯 *Yangi Test Natijasi*

👤 *Candidat:* ${firstName} ${lastName}
📝 *Test turi:* ${testType}
⏱ *Sarflangan vaqt:* ${timeSpent} daqiqa
✅ *To'g'ri javoblar:* ${correctAnswers} ta
❌ *Xato javoblar:* ${totalQuestions - correctAnswers} ta
📊 *Umumiy savollar:* ${totalQuestions} ta
${detailedMessage}
📅 Sana: ${new Date().toLocaleString('uz-UZ')}
    `;

    // Har bir chat ID ga xabar yuborish
    const sendPromises = CHAT_IDS.map(chatId => 
      fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      })
    );

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Telegram error:', error);
    return NextResponse.json({ success: false, error: 'Xabar yuborishda xatolik' }, { status: 500 });
  }
}
