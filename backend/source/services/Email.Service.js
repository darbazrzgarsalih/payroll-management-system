import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_PASSWORD,
  },
});

export async function sendPayslipApprovalEmail({ to, employeeName, payslip, pdfPath }) {
  if (!process.env.APP_PASSWORD) {
    console.warn('[Email.Service] APP_PASSWORD not set — skipping email send.');
    return;
  }

  const payDate = payslip.payDate
    ? new Date(payslip.payDate).toLocaleDateString('en-GB')
    : 'N/A';

  const fmt = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val ?? 0);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:0">
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.1)">
    <div style="background:#1a1a2e;padding:28px 36px">
      <h1 style="color:#fff;margin:0;font-size:22px">HIGH TECH</h1>
      <p style="color:#aaa;margin:4px 0 0;font-size:13px">Payroll Management System</p>
    </div>
    <div style="padding:32px 36px">
      <h2 style="color:#1a1a2e;margin-top:0">Your Payslip Has Been Approved</h2>
      <p style="color:#555">Dear <strong>${employeeName}</strong>,</p>
      <p style="color:#555">Your payslip for the pay date <strong>${payDate}</strong> has been approved.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <tr style="background:#f9f9f9">
          <td style="padding:10px 14px;color:#777;font-size:13px">Gross Pay</td>
          <td style="padding:10px 14px;font-weight:bold;text-align:right">${fmt(payslip.grossPay)}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;color:#777;font-size:13px">Total Deductions</td>
          <td style="padding:10px 14px;text-align:right;color:#c0392b">${fmt((payslip.grossPay ?? 0) - (payslip.netPay ?? 0))}</td>
        </tr>
        <tr style="background:#1a1a2e">
          <td style="padding:12px 14px;color:#fff;font-weight:bold">Net Pay</td>
          <td style="padding:12px 14px;color:#fff;font-weight:bold;text-align:right">${fmt(payslip.netPay)}</td>
        </tr>
      </table>
      <p style="color:#555;font-size:13px">Your payslip PDF is attached to this email for your records.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
      <p style="color:#aaa;font-size:12px">This is an automated message. Please do not reply.</p>
    </div>
  </div>
</body>
</html>`;

  const mailOptions = {
    from: `"High Tech Payroll" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your Payslip Has Been Approved — ${payDate}`,
    html,
    attachments: pdfPath
      ? [{ filename: 'payslip.pdf', path: pdfPath }]
      : [],
  };

  try {
    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error('[Email.Service] Failed to send email:', error.message);
  }
}

export async function sendPasswordResetEmail({ to, name, otp }) {
  if (!process.env.APP_PASSWORD) {
    console.error('[Email.Service] APP_PASSWORD not set — cannot send password reset email. OTP:', otp);
    throw new Error("SMTP application password is not configured on the server.");
  }

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:0">
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.1)">
    <div style="background:#1a1a2e;padding:28px 36px">
      <h1 style="color:#fff;margin:0;font-size:22px">HIGH TECH</h1>
      <p style="color:#aaa;margin:4px 0 0;font-size:13px">Payroll Management System</p>
    </div>
    <div style="padding:32px 36px">
      <h2 style="color:#1a1a2e;margin-top:0">Password Reset Verification</h2>
      <p style="color:#555">Hi <strong>${name}</strong>,</p>
      <p style="color:#555">We received a request to reset your password. Use the verification code below to proceed. This code expires in <strong>15 minutes</strong>.</p>
      <div style="text-align:center;margin:32px 0">
        <div style="background:#f9f9f9;border:1px dashed #ddd;padding:20px;display:inline-block;border-radius:8px">
          <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1a1a2e">${otp}</span>
        </div>
      </div>
      <p style="color:#999;font-size:13px">If you did not request this, ignore this email — your password will not change.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
      <p style="color:#aaa;font-size:12px">HIGH TECH · Payroll Management System</p>
    </div>
  </div>
</body>
</html>`;

  const mailOptions = {
    from: `"HIGH TECH Payroll" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Password Reset Request',
    html,
  };

  try {
    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error('[Email.Service] Failed to send password reset email:', error.message);
    throw error;
  }
}

