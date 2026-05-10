const mongoose = require('mongoose');
const { Schema } = mongoose;

const lessonSchema = new Schema({
  title: String,
  contentHtml: String,
  videoUrl: String,
  duration: String,
  order: Number,
  isQuiz: { type: Boolean, default: false },
  quiz: {
    questions: [{
      question: String,
      options: [String],
      answer: Number  // index of correct option
    }]
  }
});

const courseSchema = new Schema({
  title: {type:String, required:true},
  slug: {type:String, index:true, unique:true},
  description: String,
  category: String,
  coverImage: String,
  price: {type:Number, default: 0}, // store in the base currency unit (e.g. KES)
  currency: {type:String, default:'KES'},
  isFree: {type:Boolean, default:false},
  lessons: [lessonSchema],
  createdBy: {type: Schema.Types.ObjectId, ref:'User'},
  createdAt: {type:Date, default: Date.now},
});

module.exports = mongoose.model('Course', courseSchema);
