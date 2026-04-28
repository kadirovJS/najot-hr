import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationCode = async (email: string, code: string) => {
  const mailOptions = {
    from: `"Najot HR" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Email tasdiqlash kodi',
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
        <h2 style="color: #00BA62;">Najot HR</h2>
        <p>Salom! Email manzilingizni tasdiqlash uchun quyidagi maxfiy koddan foydalaning:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 10px;">
          <h1 style="letter-spacing: 10px; margin: 0; color: #333;">${code}</h1>
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">Agar bu so'rovni siz yubormagan bo'lsangiz, ushbu xabarga e'tibor bermang.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
