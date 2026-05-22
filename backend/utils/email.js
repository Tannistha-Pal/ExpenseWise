const nodemailer = require("nodemailer");

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendPasswordResetEmail = async ({ to, name, resetLink, expiresInMinutes }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn("Email credentials not configured. Password reset link:", resetLink);
    return { sent: false, preview: resetLink };
  }

  await transporter.sendMail({
    from: `"ExpenseWise" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your ExpenseWise password",
    text: [
      `Hi ${name || "there"},`,
      "",
      "We received a request to reset your ExpenseWise password.",
      `Reset your password using this link: ${resetLink}`,
      `This link expires in ${expiresInMinutes} minutes.`,
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>Reset your ExpenseWise password</h2>
        <p>Hi ${name || "there"},</p>
        <p>We received a request to reset your ExpenseWise password.</p>
        <p>
          <a href="${resetLink}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;">
            Reset password
          </a>
        </p>
        <p>This link expires in ${expiresInMinutes} minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });

  return { sent: true };
};

module.exports = { sendPasswordResetEmail };
