import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { createModelBridge } from './dataBridge.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    profile: {
      headline: { type: String, default: '' },
      bio: { type: String, default: '' },
      phone: { type: String, default: '' },
      education: [
        {
          school: String,
          degree: String,
          fieldOfStudy: String,
          startYear: String,
          endYear: String,
        },
      ],
      skills: {
        type: [String],
        default: [],
      },
      experience: [
        {
          title: String,
          company: String,
          location: String,
          startDate: String,
          endDate: String,
          current: { type: Boolean, default: false },
          description: String,
        },
      ],
      preferredLocation: { type: String, default: '' },
      preferredJobTypes: {
        type: [String],
        default: ['Full-time'],
      },
      expectedSalary: { type: Number, default: 0 },
      resumeUrl: { type: String, default: '' },
      resumeFileName: { type: String, default: '' },
      resumeParsedData: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);
export default createModelBridge('users', MongooseUser);
