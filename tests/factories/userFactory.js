const mongoose = require('mongoose');
const User = require('../../models/User');

module.exports = () => {
  return new User({}).save();
}