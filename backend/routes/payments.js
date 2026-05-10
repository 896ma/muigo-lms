const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const Payment = require('../models/payment');
const User = require('../models/user');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/course');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// 1) Initiate transaction
router.post('/initiate', requireAuth, async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id; // attach auth middleware on route

  // Fetch user details
  const user = await User.findById(userId);
  if(!user) return res.status(404).json({ message: 'User not found' });

  const course = await Course.findById(courseId);
  if(!course) return res.status(404).json({ message: 'Course not found' });

  // Check if user is already enrolled in this course
  const existingEnrollment = await Enrollment.findOne({ 
    user: userId, 
    course: courseId 
  });
  
  if (existingEnrollment) {
    return res.status(400).json({ 
      message: 'You are already enrolled in this course',
      alreadyEnrolled: true 
    });
  }

  // Check if there's already a successful payment for this course
  const existingPayment = await Payment.findOne({ 
    user: userId, 
    course: courseId, 
    status: 'success' 
  });
  
  if (existingPayment) {
    return res.status(400).json({ 
      message: 'You have already paid for this course',
      alreadyPaid: true 
    });
  }

  // convert price to smallest unit e.g. *100
  const amountInKobo = Math.round(course.price * 100);

  const callbackUrl = `${process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`}/payment-callback`;
  console.log('Using callback URL:', callbackUrl);

  const payload = {
    email: user.email,
    amount: amountInKobo,
    callback_url: callbackUrl,
    metadata: { userId: user.id.toString(), courseId: course._id.toString() }
  };

  try {
    const resp = await axios.post('https://api.paystack.co/transaction/initialize', payload, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    
    // store a pending Payment record with reference
    const { authorization_url, reference } = resp.data.data;
    await Payment.create({
      user: user._id,
      course: course._id,
      amount: course.price,
      currency: course.currency,
      provider: 'paystack',
      reference,
      status: 'pending'
    });
    res.json({ authorization_url, reference });
  } catch(err) {
    console.error('Payment initiation failed:', err.response?.data?.message || err.message);
    res.status(500).json({ 
      message: 'Payment initiation failed', 
      error: err.response?.data?.message || err.message 
    });
  }
});

// 2) Webhook endpoint (Paystack)
router.post('/webhook', express.json({ type: '*/*' }), async (req, res) => {
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');
  const signature = req.headers['x-paystack-signature'];
  if(hash !== signature) return res.status(400).end();

  const event = req.body;
  if(event.event === 'charge.success') {
    const ref = event.data.reference;
    const payment = await Payment.findOne({ reference: ref });
    if(payment && payment.status !== 'success') {
      payment.status = 'success';
      await payment.save();
      // create enrollment
      await Enrollment.create({ user: payment.user, course: payment.course, vip: false });
      // optionally, send notification/email to user
    }
  }
  res.json({ status: 'ok' });
});

async function ensureEnrollmentForPayment(paymentDoc) {
  if (!paymentDoc || !paymentDoc.user || !paymentDoc.course) return;
  const userId = paymentDoc.user._id || paymentDoc.user;
  const courseId = paymentDoc.course._id || paymentDoc.course;
  const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
  if (!existingEnrollment) {
    await Enrollment.create({ user: userId, course: courseId, vip: false });
    console.log('Enrollment created for user:', userId, 'course:', courseId);
  }
}

/** Paystack can still return pending/processing when the browser hits the callback (esp. mobile money). */
function isPaystackPending(data) {
  if (!data) return true;
  const s = (data.status || '').toLowerCase();
  return s === 'pending' || s === 'ongoing' || s === 'processing' || s === 'send_otp' || s === 'pay_offline';
}

function isPaystackFailed(data) {
  if (!data) return false;
  const s = (data.status || '').toLowerCase();
  return s === 'failed' || s === 'abandoned' || s === 'reversed' || s === 'timeout';
}

// 3) Verify via reference - GET endpoint for redirects (no auth required for callback)
router.get('/verify/:reference', async (req, res) => {
  const ref = String(req.params.reference || '').trim();
  if (!ref) {
    return res.status(400).json({ success: false, message: 'Missing payment reference' });
  }

  // 1) Webhook / prior verify may already have marked success — respond fast without Paystack
  try {
    let payment = await Payment.findOne({ reference: ref })
      .populate('course', 'title slug _id')
      .populate('user', 'name email _id');

    if (payment?.status === 'success') {
      await ensureEnrollmentForPayment(payment);
      payment = await Payment.findOne({ reference: ref })
        .populate('course', 'title slug _id')
        .populate('user', 'name email _id');
      return res.json({
        success: true,
        message: 'Payment already confirmed. You are enrolled.',
        course: payment?.course,
        user: payment?.user
      });
    }

    // 2) Ask Paystack (single round-trip; client polls to avoid Render HTTP timeouts)
    let paystackData;
    try {
      const resp = await axios.get(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`,
        {
          headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
          timeout: 25000
        }
      );
      paystackData = resp.data?.data;
    } catch (paystackErr) {
      console.error('Paystack verify HTTP error:', paystackErr.response?.data || paystackErr.message);
      // Paystack down or slow — if we already have a pending local row, tell client to retry
      if (payment) {
        return res.status(200).json({
          success: false,
          pending: true,
          message: 'Could not reach Paystack yet. Please wait — we will keep checking.'
        });
      }
      throw paystackErr;
    }

    if (isPaystackPending(paystackData)) {
      return res.status(200).json({
        success: false,
        pending: true,
        paystackStatus: paystackData?.status,
        message: 'Payment is still being confirmed by your provider. This page will keep checking.'
      });
    }

    if (isPaystackFailed(paystackData)) {
      return res.status(400).json({
        success: false,
        message: paystackData?.gateway_response || 'Payment was not completed'
      });
    }

    if (paystackData?.status !== 'success') {
      return res.status(200).json({
        success: false,
        pending: true,
        paystackStatus: paystackData?.status,
        message: 'Waiting for payment confirmation...'
      });
    }

    // 3) Success — resolve or create payment row, then enroll
    payment = await Payment.findOne({ reference: ref })
      .populate('course', 'title slug _id')
      .populate('user', 'name email _id');

    let meta = paystackData.metadata || {};
    if (typeof meta === 'string') {
      try {
        meta = JSON.parse(meta);
      } catch {
        meta = {};
      }
    }
    const metaUserId = meta.userId || meta.user_id;
    const metaCourseId = meta.courseId || meta.course_id;

    if (!payment && metaUserId && metaCourseId) {
      try {
        payment = await Payment.create({
          user: metaUserId,
          course: metaCourseId,
          amount: (paystackData.amount || 0) / 100,
          currency: paystackData.currency || 'KES',
          provider: paystackData.channel || 'paystack',
          reference: ref,
          status: 'success',
          metadata: meta
        });
        payment = await Payment.findOne({ reference: ref })
          .populate('course', 'title slug _id')
          .populate('user', 'name email _id');
      } catch (createErr) {
        console.error('Could not create payment from Paystack metadata:', createErr);
      }
    }

    if (payment) {
      if (payment.status !== 'success') {
        payment.status = 'success';
        await payment.save();
      }
      await ensureEnrollmentForPayment(payment);
      payment = await Payment.findOne({ reference: ref })
        .populate('course', 'title slug _id')
        .populate('user', 'name email _id');
    }

    let courseOut = payment?.course;
    let userOut = payment?.user;
    if ((!courseOut || !userOut) && metaUserId && metaCourseId) {
      try {
        courseOut = courseOut || (await Course.findById(metaCourseId).select('title slug _id'));
        userOut = userOut || (await User.findById(metaUserId).select('name email _id'));
        if (courseOut && userOut) {
          await ensureEnrollmentForPayment({ user: userOut, course: courseOut });
        }
      } catch (e) {
        console.error('Metadata fallback enrollment:', e.message);
      }
    }

    return res.json({
      success: true,
      message: 'Payment verified and enrollment completed',
      course: courseOut,
      user: userOut
    });
  } catch (err) {
    console.error('Payment verification error:', err.response?.data || err.message);

    try {
      const payment = await Payment.findOne({ reference: ref })
        .populate('course', 'title slug _id')
        .populate('user', 'name email _id');

      if (payment?.status === 'success') {
        await ensureEnrollmentForPayment(payment);
        return res.json({
          success: true,
          message: 'Payment verified locally and enrollment completed',
          course: payment.course,
          user: payment.user
        });
      }
      if (payment) {
        return res.status(200).json({
          success: false,
          pending: true,
          message: 'Temporary verification issue. Retrying usually fixes this.'
        });
      }
    } catch (localErr) {
      console.error('Local payment lookup failed:', localErr);
    }

    return res.status(500).json({ success: false, message: 'Verification failed', error: err.message });
  }
});

// 4) Initiate M-Pesa transaction through Paystack
router.post('/initiate-mpesa', requireAuth, async (req, res) => {
  const { courseId, phoneNumber } = req.body;
  const userId = req.user.id;
  
  console.log('M-Pesa payment request:', { courseId, phoneNumber, userId });

  // Fetch user details
  const user = await User.findById(userId);
  if(!user) return res.status(404).json({ message: 'User not found' });

  const course = await Course.findById(courseId);
  if(!course) return res.status(404).json({ message: 'Course not found' });

  // Check if user is already enrolled in this course
  const existingEnrollment = await Enrollment.findOne({ 
    user: userId, 
    course: courseId 
  });
  
  if (existingEnrollment) {
    return res.status(400).json({ 
      message: 'You are already enrolled in this course',
      alreadyEnrolled: true 
    });
  }

  // Check if there's already a successful payment for this course
  const existingPayment = await Payment.findOne({ 
    user: userId, 
    course: courseId, 
    status: 'success' 
  });
  
  if (existingPayment) {
    return res.status(400).json({ 
      message: 'You have already paid for this course',
      alreadyPaid: true 
    });
  }

  // convert price to smallest unit e.g. *100
  const amountInKobo = Math.round(course.price * 100);

  const callbackUrl = `${process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`}/payment-callback`;
  console.log('Using M-Pesa callback URL:', callbackUrl);

  const payload = {
    email: user.email,
    amount: amountInKobo,
    callback_url: callbackUrl,
    metadata: { 
      userId: user.id.toString(), 
      courseId: course._id.toString(),
      phoneNumber: phoneNumber,
      paymentMethod: 'mpesa'
    },
    channels: ['mobile_money'], // Restrict to mobile money channels
    mobile_money: {
      phone: phoneNumber
    }
  };

  try {
    const resp = await axios.post('https://api.paystack.co/transaction/initialize', payload, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    
    // store a pending Payment record with reference
    const { authorization_url, reference } = resp.data.data;
    await Payment.create({
      user: user._id,
      course: course._id,
      amount: course.price,
      currency: course.currency,
      provider: 'paystack-mpesa',
      reference,
      status: 'pending',
      metadata: { phoneNumber, paymentMethod: 'mpesa' }
    });
    res.json({ authorization_url, reference });
  } catch(err) {
    console.error('M-Pesa payment initialization failed:', err.response?.data?.message || err.message);
    res.status(500).json({ 
      message: 'M-Pesa payment initialization failed', 
      error: err.response?.data?.message || err.message 
    });
  }
});


module.exports = router;
