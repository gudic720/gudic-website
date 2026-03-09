// lib/mailer.ts
import nodemailer from "nodemailer";

type SendVerificationEmailOpts = {
  to: string;
  verifyUrl: string;
  locale?: string;
};

export function getTransporter() {
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS
    auth: { user, pass },
  });
}

export async function sendVerificationEmail(opts: SendVerificationEmailOpts) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;

  const t =
    opts.locale === "ar"
      ? {
          subject: "تفعيل البريد الإلكتروني - GUDIC",
          hello: "مرحبًا،",
          msg: "اضغط الرابط التالي لتفعيل بريدك الإلكتروني:",
          btn: "تفعيل البريد",
          ignore: "إذا لم تقم بإنشاء هذا الحساب، تجاهل الرسالة.",
        }
      : {
          subject: "Verify your email - GUDIC",
          hello: "Hello,",
          msg: "Click the link below to verify your email:",
          btn: "Verify Email",
          ignore: "If you did not create this account, you can ignore this email.",
        };

  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6">
      <p>${t.hello}</p>
      <p>${t.msg}</p>
      <p>
        <a href="${opts.verifyUrl}"
           style="display:inline-block;padding:10px 14px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px">
          ${t.btn}
        </a>
      </p>
      <p style="color:#64748b;font-size:12px">${t.ignore}</p>
      <p style="color:#64748b;font-size:12px">${opts.verifyUrl}</p>
    </div>
  `;

  const transporter = getTransporter();

  
  await transporter.verify();

  const info = await transporter.sendMail({
    from,
    to: opts.to,
    subject: t.subject,
    html,
  });

  console.log("✅ Verification email sent:", {
    to: opts.to,
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  });
}
