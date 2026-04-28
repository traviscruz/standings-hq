const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const transporter = require('../config/mail');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// --- REGISTER ---
router.post('/register', async (req, res) => {
  const { email, username, fname, lname, role } = req.body;
  try {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('email, username')
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();

    if (existingProfile) {
      const isEmailMatch = existingProfile.email.toLowerCase() === email.toLowerCase();
      return res.status(400).json({ 
        error: isEmailMatch ? 'Email already registered.' : 'Username already taken.' 
      });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60000);

    await supabase.from('otp_codes').insert([{ email, code: otp, expires_at: expiresAt }]);

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: `Verify your account - StandingsHQ`,
      html: `
        <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e1e8f0;">
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: left;">
                      <div style="font-size: 24px; font-weight: 800; color: #0f172a;">Standings<span style="color: #3b82f6;">HQ</span></div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 40px 40px;">
                      <h2 style="font-size: 20px; font-weight: 700;">Confirm your registration</h2>
                      <p style="font-size: 15px; color: #475569;">To activate your account, please use the code below:</p>
                      <div style="background-color: #f8fafc; border-radius: 12px; padding: 32px; text-align: center; border: 1px solid #edf2f7;">
                        <div style="font-size: 36px; font-weight: 800; letter-spacing: 0.3em;">${otp}</div>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      `
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- VERIFY OTP ---
router.post('/verify-otp', async (req, res) => {
  const { email, code, password, username, fname, lname, role } = req.body;
  try {
    const { data: otpData } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!otpData) return res.status(400).json({ error: 'Invalid or expired code.' });

    let authUser;
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const existingAuthUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existingAuthUser) {
      authUser = existingAuthUser;
    } else {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { username, first_name: fname, last_name: lname, role }
      });
      if (authError) throw authError;
      authUser = authData.user;
    }

    await supabase.from('profiles').upsert([{ id: authUser.id, email, username, first_name: fname, last_name: lname, role }]);
    await supabase.from('otp_codes').delete().eq('email', email);

    res.status(200).json({ message: 'Success!', user: authUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  let targetEmail = email;
  try {
    if (!email.includes('@')) {
      const { data: profile } = await supabase.from('profiles').select('email').eq('username', email).maybeSingle();
      if (!profile) return res.status(401).json({ error: 'Username not found.' });
      targetEmail = profile.email;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: targetEmail, password });
    if (error) return res.status(401).json({ error: error.message });
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
    res.status(200).json({ session: data.session, user: data.user, profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- FORGOT PASSWORD ---
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!foundUser) return res.status(200).json({ message: 'If account exists, code sent.' });

    const otp = generateOTP();
    await supabase.from('otp_codes').insert([{ email, code: otp, expires_at: new Date(Date.now() + 10 * 60000) }]);

    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: `Reset your password - StandingsHQ`,
      html: `<div style="text-align:center;"><h2>Reset Code: ${otp}</h2></div>`
    });
    res.status(200).json({ message: 'Code sent.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- RESET PASSWORD ---
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  try {
    const { data: otpData } = await supabase.from('otp_codes').select('*').eq('email', email).eq('code', code).gt('expires_at', new Date().toISOString()).single();
    if (!otpData) return res.status(400).json({ error: 'Invalid code.' });

    const { data: { users } } = await supabase.auth.admin.listUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    await supabase.auth.admin.updateUserById(foundUser.id, { password: newPassword });
    await supabase.from('otp_codes').delete().eq('email', email);

    res.status(200).json({ message: 'Password updated.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- UPDATE PROFILE ---
router.post('/update-profile', async (req, res) => {
  const { userId, first_name, last_name, username, email } = req.body;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ first_name, last_name, username, email })
      .eq('id', userId);
    
    if (error) throw error;
    res.status(200).json({ message: 'Profile updated.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
