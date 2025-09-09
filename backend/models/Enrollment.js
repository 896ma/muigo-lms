const mongoose = require('mongoose');
const { Schema } = mongoose;

const enrollmentSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  course: {type: Schema.Types.ObjectId, ref: 'Course', required: true},
  progress: [{ lessonId: Schema.Types.ObjectId, completedAt: Date }],
  status: {type:String, enum:['active','completed','cancelled'], default:'active'},
  startedAt: {type:Date, default: Date.now},
  vip: {type:Boolean, default:false}, // optional flag for VIP access
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
