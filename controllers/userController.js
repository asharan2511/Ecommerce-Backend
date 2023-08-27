import ErrorHandler from "../utils/errorHandler.js";
import asyncHandler from "express-async-handler";
import User from "../models/user.js";
import sendToken from "../utils/jwtToken.js";
import expressAsyncHandler from "express-async-handler";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

//POST  Register user
export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = await req.body;

  //const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    avatar: {
      public_id: "this is a sample id",
      url: "profilepic url",
    },
    password,
  });
  sendToken(user, 201, res);
});

//POST Login users
export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  //checking if passsword and email is provied
  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email and Password", 404));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(
      new ErrorHandler(
        "The Entered Email/Password is Wrong.Please try again.",
        401
      )
    );
  }
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(
      new ErrorHandler(
        "The Entered Email/Password is Wrong.Please try again.",
        401
      )
    );
  }

  sendToken(user, 200, res);
});

//GET Logout

export const logoutUser = expressAsyncHandler(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged Out" });
});

export const forgotPassword = expressAsyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  //Get ressetPassword Token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your Password Reset Token is :- \n\n  ${resetPasswordUrl} \n\n If you have not requested  this email then, please Ignore it`;
  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

//POST reset Password
export const resetPassword = expressAsyncHandler(async (req, res, next) => {
  //creatin token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password != req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, res);
});

//GET User Detail
export const getUserDetails = expressAsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, user });
});

//PUT Update User password
export const updatePassword = expressAsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old Password is incorrect", 400));
  }

  if (req.body.newPassword != req.body.confirmPassword) {
    return next(new ErrorHandler("Password doesnt match", 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});

//PUT Update User Profile
export const updateProfile = expressAsyncHandler(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true });
});

//GET All users - Admin
export const getAllUsers = expressAsyncHandler(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({ success: true, users });
});

//GET single users - Admin
export const getSingleUser = expressAsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exists with ${req.params.id``}`)
    );
  }

  res.status(200).json({ success: true, user });
});

//PUT Update user Role - Admin
export const updateRole = expressAsyncHandler(async (req, res, next) => {
  const newUserData = {
    role: req.body.role,
  };
  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  if (!user) {
    return next(
      new ErrorHandler(`The user doesnot exists with Id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, user });
});

//DELETE user - Admin
export const deleteUser = expressAsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  //we will remove cloudinary later

  if (!user) {
    return next(
      new ErrorHandler(`The user is not found byt the id ${req.params.id}`)
    );
  }
  await user.deleteOne();

  res.status(200).json({ success: true, message: "user Deleted SuccessFully" });
});
