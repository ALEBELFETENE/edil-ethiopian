const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['seeker', 'employer', 'admin'],
      default: 'seeker',
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationTokenHash: {
      type: String,
      select: false,
    },
    verificationExpiresAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
