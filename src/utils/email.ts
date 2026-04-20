import nodemailer from "nodemailer";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(payload: EmailPayload): Promise<void> {
  await transporter.sendMail({
    from: `"SLREPMS Traffic System" <${process.env.EMAIL_USER}>`,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });
}