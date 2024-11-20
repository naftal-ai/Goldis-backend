import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';

const UserSchema = new Schema({
  name: {
    type: String,
    required: true, // User's name is mandatory
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true, // Role (e.g., admin, user) is essential
    enum: ['user', 'admin'], // Limits possible values for role
    default: 'user',         // Defaults to 'user'
  },
  avatar: {
    type: String, 
    default: null, // Avatar is optional, with a default of `null`
  },
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
  ],
}, { timestamps: true });

// Pre-save middleware to hash the password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {

    return await bcrypt.compare(candidatePassword, this.password);
  
};

// Exclude password from responses
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', UserSchema);
