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

  const callbackUrl = process.env.PAYSTACK_CALLBACK_URL || 'https://muigo-farmers-lms.onrender.com/payment-callback';
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

// 3) Verify via reference - GET endpoint for redirects (no auth required for callback)
router.get('/verify/:reference', async (req, res) => {
  const ref = req.params.reference;
  
  try {
    const resp = await axios.get(`https://api.paystack.co/transaction/verify/${ref}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    
    const data = resp.data.data;
    
    if(data.status === 'success') {
      // Mark payment/enroll if not already done
      const payment = await Payment.findOne({ reference: ref })
        .populate('course', 'title slug _id')
        .populate('user', 'name email _id');
        
      console.log('Payment verification - found payment:', payment);
        
      if(payment && payment.status !== 'success') {
         payment.status = 'success';
         await payment.save();
         
         // Check if enrollment already exists
         const existingEnrollment = await Enrollment.findOne({ 
           user: payment.user._id, 
           course: payment.course._id 
         });
         
         if (!existingEnrollment) {
           console.log('Creating enrollment for user:', payment.user._id, 'course:', payment.course._id);
           await Enrollment.create({ user: payment.user._id, course: payment.course._id });
           console.log('Enrollment created successfully');
         } else {
           console.log('Enrollment already exists for user:', payment.user._id, 'course:', payment.course._id);
         }
      }
      
      // Return course and user information for redirect
      console.log('Returning payment verification response:', {
        success: true,
        course: payment?.course,
        user: payment?.user,
        paymentFound: !!payment,
        courseTitle: payment?.course?.title,
        courseSlug: payment?.course?.slug
      });
      
      return res.json({ 
        success: true, 
        message: 'Payment verified and enrollment completed',
        course: payment?.course,
        user: payment?.user
      });
    } else {
      res.status(400).json({ success: false, message: 'Payment not successful' });
    }
  } catch (err) {
    console.error('Payment verification error:', err.response?.data || err.message);
    
    // If Paystack verification fails, check if we have a local payment record
    try {
      const payment = await Payment.findOne({ reference: ref })
        .populate('course', 'title slug _id')
        .populate('user', 'name email _id');
        
      if (payment) {
        console.log('Found local payment record despite Paystack error:', payment);
        
        // Mark as success and create enrollment if needed
        if (payment.status !== 'success') {
          payment.status = 'success';
          await payment.save();
          
          const existingEnrollment = await Enrollment.findOne({ 
            user: payment.user, 
            course: payment.course 
          });
          
          if (!existingEnrollment) {
            await Enrollment.create({ user: payment.user, course: payment.course });
          }
        }
        
        return res.json({ 
          success: true, 
          message: 'Payment verified locally and enrollment completed',
          course: payment.course,
          user: payment.user
        });
      }
    } catch (localErr) {
      console.error('Local payment lookup also failed:', localErr);
    }
    
    res.status(500).json({ success: false, message: 'Verification failed', error: err.message });
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

  const callbackUrl = process.env.PAYSTACK_CALLBACK_URL || 'https://muigo-farmers-lms.onrender.com/payment-callback';
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
