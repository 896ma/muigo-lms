const mongoose = require('mongoose');
const { Schema } = mongoose;

const enrollmentSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  course: {type: Schema.Types.ObjectId, ref: 'Course', required: true},
  progress: {type: Number, default: 0, min: 0, max: 100}, // Progress percentage
  completedLessons: [{type: Schema.Types.ObjectId}], // Array of completed lesson IDs
  status: {type:String, enum:['active','completed','cancelled'], default:'active'},
  enrolledAt: {type:Date, default: Date.now},
  completedAt: {type:Date, default: null},
  completed: {type: Boolean, default: false},
  vip: {type:Boolean, default:false}, // optional flag for VIP access
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
