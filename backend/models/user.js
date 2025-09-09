const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {type:String, required:true},
  email: {type:String, required:true, unique:true, lowercase:true},
  passwordHash: {type:String, required:true},
  role: {type:String, enum:['farmer','admin','instructor'], default:'farmer'},
  phone: {type:String},
  farmLocation: {type:String},
  avatarUrl: {type:String},
  vipExpires: {type: Date, default: null}, // VIP access expiration
  createdAt: {type:Date, default: Date.now},
  refreshTokens: [{ token: String, createdAt: Date }] // optional
});

module.exports = mongoose.model('User', userSchema);
