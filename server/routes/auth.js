const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const transporter = require('../config/mail');
const { getOTPTemplate } = require('../utils/emailTemplates');

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
      html: getOTPTemplate(otp, 'register')
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
    const { data: otpCodes, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString());

    if (otpError) throw otpError;
    const otpData = otpCodes && otpCodes[0];
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
    const { data: profilesData, error: profileError } = await supabase.from('profiles').select('*').eq('id', data.user.id);
    if (profileError) throw profileError;
    const profile = profilesData && profilesData[0];
    if (!profile) return res.status(401).json({ error: 'Profile not found.' });
    
    // FETCH SUBSCRIPTION
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('end_date')
      .eq('user_id', data.user.id)
      .in('status', ['active', 'cancelled'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let isSubscribed = false;
    if (subData && new Date(subData.end_date) > new Date()) {
      isSubscribed = true;
    }

    res.status(200).json({ session: data.session, user: data.user, profile, isSubscribed });
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
      html: getOTPTemplate(otp, 'reset')
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
    const { data: otpCodes, error: otpError } = await supabase.from('otp_codes').select('*').eq('email', email).eq('code', code).gt('expires_at', new Date().toISOString());
    if (otpError) throw otpError;
    const otpData = otpCodes && otpCodes[0];
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
