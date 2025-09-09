const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  course: {type: Schema.Types.ObjectId, ref: 'Course', default: null},
  amount: Number,
  currency: String,
  provider: String, // 'paystack'
  reference: String,
  status: {type:String, enum:['pending','success','failed'], default:'pending'},
  metadata: Schema.Types.Mixed,
  createdAt: {type:Date, default: Date.now}
});

module.exports = mongoose.model('Payment', paymentSchema);
