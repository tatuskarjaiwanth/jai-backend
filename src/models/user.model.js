import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary url we will store here
      required: true,
    },
    coverImage: {
      type: String, //cloudinary url
    },
    watchHistory: [{type: Schema.Types.ObjectId, ref: "Video"}],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {timestamps: true}
);

userSchema.pre("save", async function (next) {
  //(just run this hook only when password is changed , so we go for if condition)
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//we can design our custom methods
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      //this is payload
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      //this is payload
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
export const User = mongoose.model("User", userSchema);

//bcrypt hashes the password
//jwt (for tokens) json web token
//payload is the data which gets protected
//hooks (ex: prehook -> execute one after other  (just before saving data we can run this hook by putting code like encrypting password))
//we can use this hook on validate save delete update etc

//jwt is a bearer token (i.e its a toekn who has this token we will give the data to them)

//REFRESH token has higher expiry than access token
//refresh token has lesser info than access
