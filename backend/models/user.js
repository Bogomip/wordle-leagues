const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userScehema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  joindate: { type: Number, required: true },
  leagues: { type: Array, required: false },
  results: { type: Array, required: false }
});

userScehema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userScehema);
