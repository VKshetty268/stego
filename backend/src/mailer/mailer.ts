import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT || 25),
  secure: false,
  auth: (process.env.SMTP_USER && process.env.SMTP_PASS) ? {
    user: process.env.SMTP_USER, pass: process.env.SMTP_PASS
  } : undefined
});

export async function sendVerifyEmail(email: string, token: string) {
  const verifyUrl = `${process.env.BASE_URL}/verify?token=${encodeURIComponent(token)}`;
  await transporter.sendMail({
    from: process.env.MAIL_FROM!,
    to: email,
    subject: "Verify your Stego Trial account",
    text: `Please verify your account: ${verifyUrl}`,
    html: `Please verify your account: <a href="${verifyUrl}">${verifyUrl}</a>`
  });
}
