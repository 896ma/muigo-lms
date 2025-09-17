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

  // convert price to smallest unit e.g. *100
  const amountInKobo = Math.round(course.price * 100);

  const payload = {
    email: user.email,
    amount: amountInKobo,
    callback_url: process.env.PAYSTACK_CALLBACK_URL,
    metadata: { userId: user.id.toString(), courseId: course._id.toString() }
  };

  try {
    console.log('Paystack API Key:', process.env.PAYSTACK_SECRET_KEY ? 'Set' : 'Not set');
    console.log('Payment payload:', payload);
    
    const resp = await axios.post('https://api.paystack.co/transaction/initialize', payload, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    
    console.log('Paystack response:', resp.data);
    
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
    console.error('Paystack API Error:', err.response?.data || err.message);
    console.error('Error details:', err.response?.status, err.response?.statusText);
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

// 3) Verify via reference - GET endpoint for redirects
router.get('/verify/:reference', async (req, res) => {
  const ref = req.params.reference;
  try {
    const resp = await axios.get(`https://api.paystack.co/transaction/verify/${ref}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    const data = resp.data.data;
    if(data.status === 'success') {
      // Mark payment/enroll if not already done
      const payment = await Payment.findOne({ reference: ref });
      if(payment && payment.status !== 'success') {
         payment.status = 'success';
         await payment.save();
         await Enrollment.create({ user: payment.user, course: payment.course });
      }
      return res.json({ success: true, message: 'Payment verified' });
    }
    res.status(400).json({ success:false, message:'Payment not successful' });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed' });
  }
});

// 4) Initiate M-Pesa transaction through Paystack
router.post('/initiate-mpesa', requireAuth, async (req, res) => {
  const { courseId, phoneNumber } = req.body;
  const userId = req.user.id;
  
  console.log('📱 M-Pesa payment request received:');
  console.log('  User ID:', userId);
  console.log('  Course ID:', courseId);
  console.log('  Phone Number:', phoneNumber);

  // Fetch user details
  const user = await User.findById(userId);
  if(!user) return res.status(404).json({ message: 'User not found' });

  const course = await Course.findById(courseId);
  if(!course) return res.status(404).json({ message: 'Course not found' });

  // convert price to smallest unit e.g. *100
  const amountInKobo = Math.round(course.price * 100);

  const payload = {
    email: user.email,
    amount: amountInKobo,
    callback_url: process.env.PAYSTACK_CALLBACK_URL,
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
    console.log('Paystack M-Pesa API Key:', process.env.PAYSTACK_SECRET_KEY ? 'Set' : 'Not set');
    console.log('M-Pesa payment payload:', payload);
    
    const resp = await axios.post('https://api.paystack.co/transaction/initialize', payload, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    
    console.log('Paystack M-Pesa response:', resp.data);
    
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
    console.error('Paystack M-Pesa API Error:', err.response?.data || err.message);
    console.error('Error details:', err.response?.status, err.response?.statusText);
    res.status(500).json({ 
      message: 'M-Pesa payment initialization failed', 
      error: err.response?.data?.message || err.message 
    });
  }
});


module.exports = router;
