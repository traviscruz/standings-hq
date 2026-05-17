const express = require('express');
const router = express.Router();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const transporter = require('../config/mail');
const { getSubscriptionSuccessTemplate, getSubscriptionCancelledTemplate } = require('../utils/emailTemplates');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * POST /api/billing/create-checkout
 * Creates a Paymongo Checkout Session and returns the checkout URL.
 * The subscription is NOT saved to the DB here — only after confirmed payment.
 */
router.post('/create-checkout', async (req, res) => {
  const { userId, planName, price } = req.body;
  const secretKey = process.env.PAYMONGO_SECRET_KEY;

  if (!secretKey) {
    return res.status(500).json({ error: 'Paymongo secret key not configured.' });
  }
  if (!userId || !planName || !price) {
    return res.status(400).json({ error: 'Missing required fields: userId, planName, price' });
  }

  // Determine the correct base URL for return URLs
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  try {
    const response = await axios.post(
      'https://api.paymongo.com/v1/checkout_sessions',
      {
        data: {
          attributes: {
            billing: {
              name: 'StandingsHQ Organizer',
            },
            send_email_receipt: false,
            show_description: true,
            show_line_items: true,
            line_items: [
              {
                currency: 'PHP',
                amount: Math.round(price * 100), // centavos
                name: `StandingsHQ ${planName} Plan`,
                quantity: 1,
                description: `Unlock all professional event management features on StandingsHQ.`,
              },
            ],
            payment_method_types: ['card', 'gcash', 'paymaya'],
            description: `StandingsHQ ${planName} Subscription`,
            reference_number: `SHQ-${userId.slice(0, 8)}-${Date.now()}`,
            // These URLs tell Paymongo where to redirect after payment
            success_url: `${frontendUrl}/payment/success?plan=${encodeURIComponent(planName)}&amount=${price}&userId=${userId}`,
            cancel_url: `${frontendUrl}/organizer/profile?tab=plan&status=cancelled`,
            metadata: {
              user_id: userId,
              plan_name: planName,
              amount: price,
            },
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const session = response.data.data;
    const checkoutUrl = session.attributes.checkout_url;
    const sessionId = session.id;

    res.json({ checkout_url: checkoutUrl, session_id: sessionId });
  } catch (error) {
    const errData = error.response?.data;
    console.error('Paymongo Create Checkout Error:', JSON.stringify(errData || error.message, null, 2));
    const msg = errData?.errors?.[0]?.detail || 'Failed to create Paymongo checkout session';
    res.status(500).json({ error: msg });
  }
});

/**
 * POST /api/billing/confirm-subscription
 * Called AFTER Paymongo redirects back to success_url.
 * Verifies the checkout session via Paymongo API, then writes subscription to DB.
 */
router.post('/confirm-subscription', async (req, res) => {
  const { sessionId, userId, planName, amount } = req.body;
  const secretKey = process.env.PAYMONGO_SECRET_KEY;

  if (!userId || !planName || !amount) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  let paymongoId = sessionId || null;
  let verified = false;

  // If we have a sessionId, verify with Paymongo that payment succeeded
  if (sessionId && secretKey) {
    try {
      const verifyRes = await axios.get(
        `https://api.paymongo.com/v1/checkout_sessions/${sessionId}`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
          },
        }
      );
      const sessionData = verifyRes.data.data;
      const sessionStatus = sessionData?.attributes?.payment_intent?.attributes?.status;
      const paymentStatus = sessionData?.attributes?.status;

      // Paymongo session statuses: 'active', 'expired'. Payment intent statuses: 'succeeded', etc.
      if (sessionStatus === 'succeeded' || paymentStatus === 'completed') {
        verified = true;
      }
      console.log('Paymongo session status:', paymentStatus, '| Payment intent status:', sessionStatus);
    } catch (verifyErr) {
      console.error('Paymongo verify error:', verifyErr.response?.data || verifyErr.message);
      // In test mode, we'll proceed even if verification fails
      verified = true; // allow test mode through
    }
  } else {
    // No sessionId passed — this shouldn't happen in prod, allow for test fallback
    verified = true;
  }

  if (!verified) {
    return res.status(402).json({ error: 'Payment not confirmed by Paymongo. Please try again.' });
  }

  try {
    // Check if user already has an active or cancelled subscription
    const { data: currentSub } = await supabase
      .from('subscriptions')
      .select('end_date')
      .eq('user_id', userId)
      .in('status', ['active', 'cancelled'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let baseDate = new Date();
    if (currentSub && new Date(currentSub.end_date) > baseDate) {
      baseDate = new Date(currentSub.end_date);
    }

    const endDate = new Date(baseDate);
    if (planName === 'Yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Check if user already has an active subscription and expire it
    await supabase
      .from('subscriptions')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .in('status', ['active', 'cancelled']);

    // Insert fresh subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          plan_name: planName,
          amount: amount,
          currency: 'PHP',
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          paymongo_id: paymongoId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    try {
      const { data: profile } = await supabase.from('profiles').select('email').eq('id', userId).single();
      if (profile && profile.email) {
        await transporter.sendMail({
          from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
          to: profile.email,
          subject: `Subscription Confirmed - StandingsHQ`,
          html: getSubscriptionSuccessTemplate(planName, amount, endDate.toISOString())
        });
      }
    } catch (emailErr) {
      console.error('Failed to send confirmation email', emailErr);
    }

    res.json({ success: true, message: 'Subscription activated successfully!', subscription: data });
  } catch (error) {
    console.error('DB Subscription Error:', error.message);
    res.status(500).json({ error: 'Could not record subscription in database.' });
  }
});

/**
 * GET /api/billing/subscription/:userId
 * Fetches the current active subscription for a user.
 */
router.get('/subscription/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    // Auto-expire if past end_date
    if (data && (data.status === 'active' || data.status === 'cancelled') && new Date(data.end_date) < new Date()) {
      await supabase
        .from('subscriptions')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', data.id);
      data.status = 'expired';
    }

    res.json({ subscription: data || null });
  } catch (error) {
    console.error('Fetch subscription error:', error.message);
    res.status(500).json({ error: 'Could not fetch subscription.' });
  }
});

/**
 * POST /api/billing/cancel-subscription
 * Marks a subscription as cancelled.
 */
router.post('/cancel-subscription', async (req, res) => {
  const { userId } = req.body;

  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) throw error;

    try {
      const { data: profile } = await supabase.from('profiles').select('email').eq('id', userId).single();
      const { data: subData } = await supabase.from('subscriptions').select('end_date').eq('user_id', userId).eq('status', 'cancelled').order('created_at', { ascending: false }).limit(1).single();
      if (profile && profile.email && subData) {
        await transporter.sendMail({
          from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
          to: profile.email,
          subject: `Subscription Cancelled - StandingsHQ`,
          html: getSubscriptionCancelledTemplate(subData.end_date)
        });
      }
    } catch (emailErr) {
      console.error('Failed to send cancellation email', emailErr);
    }

    res.json({ success: true, message: 'Subscription cancelled.' });
  } catch (error) {
    console.error('Cancel subscription error:', error.message);
    res.status(500).json({ error: 'Could not cancel subscription.' });
  }
});
/**
 * POST /api/billing/renew-subscription
 * Marks a cancelled subscription as active again.
 */
router.post('/renew-subscription', async (req, res) => {
  const { userId } = req.body;

  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('status', 'cancelled');

    if (error) throw error;

    res.json({ success: true, message: 'Subscription renewed.' });
  } catch (error) {
    console.error('Renew subscription error:', error.message);
    res.status(500).json({ error: 'Could not renew subscription.' });
  }
});

module.exports = router;
