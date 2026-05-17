const colors = {
  navy: '#0f172a',
  accent: '#3b82f6',
  bg: '#f4f7fa',
  surface: '#ffffff',
  text: '#475569',
  border: '#e1e8f0',
};

const baseTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.bg}; font-family: 'Inter', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: ${colors.surface}; border-radius: 24px; overflow: hidden; border: 1px solid ${colors.border}; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05); max-width: 600px; width: 100%;">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: left; border-bottom: 1px solid ${colors.border}; background-color: #fafafa;">
              <div style="font-size: 28px; font-weight: 900; color: ${colors.navy}; letter-spacing: -0.02em;">Standings<span style="color: ${colors.accent};">HQ</span></div>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid ${colors.border}; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">© ${new Date().getFullYear()} StandingsHQ. All rights reserved.</p>
              <p style="margin: 8px 0 0; font-size: 13px; color: #94a3b8;">If you did not request this email, you can safely ignore it.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

exports.getOTPTemplate = (otp, type = 'register') => {
  const title = type === 'register' ? 'Confirm your registration' : 'Reset your password';
  const subtitle = type === 'register' ? 'To activate your account, please use the code below:' : 'To reset your password, please use the secure code below:';
  
  const content = `
    <h2 style="font-size: 22px; font-weight: 800; color: ${colors.navy}; margin: 0 0 16px;">${title}</h2>
    <p style="font-size: 16px; color: ${colors.text}; margin: 0 0 32px; line-height: 1.6;">${subtitle}</p>
    <div style="background-color: #f8fafc; border-radius: 16px; padding: 32px; text-align: center; border: 2px dashed #cbd5e1;">
      <div style="font-size: 42px; font-weight: 900; letter-spacing: 0.3em; color: ${colors.navy};">${otp}</div>
    </div>
    <p style="font-size: 14px; color: #94a3b8; margin: 32px 0 0; text-align: center;">This code will expire in 10 minutes.</p>
  `;
  return baseTemplate(title, content);
};

exports.getSubscriptionSuccessTemplate = (planName, amount, endDate) => {
  const title = 'Payment Successful';
  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="background-color: #10b981; color: white; width: 64px; height: 64px; border-radius: 50%; display: inline-block; line-height: 64px; font-size: 32px; font-weight: bold; margin-bottom: 16px;">✓</div>
      <h2 style="font-size: 24px; font-weight: 800; color: ${colors.navy}; margin: 0 0 8px;">Subscription Confirmed</h2>
      <p style="font-size: 16px; color: ${colors.text}; margin: 0;">Welcome to StandingsHQ Pro Elite!</p>
    </div>
    <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
      <h3 style="font-size: 14px; text-transform: uppercase; color: #64748b; font-weight: 700; margin: 0 0 16px; letter-spacing: 0.05em;">Receipt Details</h3>
      <table width="100%" style="font-size: 16px; color: ${colors.navy};">
        <tr><td style="padding-bottom: 12px; color: ${colors.text};">Plan</td><td align="right" style="font-weight: 700;">${planName}</td></tr>
        <tr><td style="padding-bottom: 12px; color: ${colors.text};">Amount Paid</td><td align="right" style="font-weight: 700;">₱${parseFloat(amount).toLocaleString('en-PH', {minimumFractionDigits: 2})}</td></tr>
        <tr><td style="color: ${colors.text};">Valid Until</td><td align="right" style="font-weight: 700;">${new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
      </table>
    </div>
    <p style="font-size: 16px; color: ${colors.text}; line-height: 1.6; margin: 0;">Thank you for upgrading. You now have full access to all professional event management features.</p>
  `;
  return baseTemplate(title, content);
};

exports.getSubscriptionCancelledTemplate = (endDate) => {
  const title = 'Subscription Cancelled';
  const content = `
    <h2 style="font-size: 22px; font-weight: 800; color: ${colors.navy}; margin: 0 0 16px;">Subscription Cancelled</h2>
    <p style="font-size: 16px; color: ${colors.text}; margin: 0 0 24px; line-height: 1.6;">We've successfully processed your cancellation request. We're sorry to see you go!</p>
    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 0 12px 12px 0; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 15px; color: #b45309; font-weight: 600;">You still have access!</p>
      <p style="margin: 4px 0 0; font-size: 15px; color: #92400e;">You will continue to have full Pro Elite access until <strong>${new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.</p>
    </div>
    <p style="font-size: 16px; color: ${colors.text}; line-height: 1.6; margin: 0;">If you change your mind, you can easily renew your subscription from your profile settings at any time before it expires.</p>
  `;
  return baseTemplate(title, content);
};
