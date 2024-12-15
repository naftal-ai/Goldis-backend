import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';

const UserSchema = new Schema({
  name: {
    type: String,
    required: true, 
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  address: {
    city: {type: String, required: true},
    street: {type: String, required: true},
    house: {type: String, required: true},
    comments: {type: String, required: false},
  }
  ,
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true, 
    enum: ['customer', 'admin'], 
    default: 'customer',   
  },
  avatar: {
    type: String, 
    default: null, // Avatar is optional, with a default of `null`
  },
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      unique: true,
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
