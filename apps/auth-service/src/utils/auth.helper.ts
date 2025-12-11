/**
 * OTP + Forgot password utilities
 * File này chứa toàn bộ logic xử lý:
 * - Validate dữ liệu đăng ký
 * - Kiểm soát spam OTP (cooldown, spam lock, failed attemps lock)
 * - Gửi OTP qua email
 * - Xác minh OTP
 * - Quy trình quên mật khẩu (forgot password)
 * 
 * Redis được sử dụng để:
 * - Lưu OTP tạm thời
 * - Track số lần yêu cầu OTP
 * - Track số lần nhập sai OTP
 * - Chặn spam OTP/brute force OTP
 */

import crypto from "crypto";
import { ValidationError } from "@packages/error-handler";
import { NextFunction, Request, Response } from "express";
import { sendEmail } from "./sendMail";
import redis from "@packages/libs/redis";
import prisma from "@packages/libs/prisma";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate dữ liệu đăng ký cho user hoặc seller
 * - User: chỉ yêu cầu name, email, password
 * - Seller: yêu cầu thêm phone_number, country
 */
export const validateRegistrationData = (
  data: any,
  userType: "user" | "seller"
) => {
  const { name, email, password, phone_number, country } = data;

  // Kiểm tra thiếu field bắt buộc
  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && (!phone_number || !country))
  ) {
    throw new ValidationError(`Missing required fields!`);
  }

  // Validate email format
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format!");
  }
};

/**
 * Kiểm tra các hạn chế liên quan đến OTP:
 * - otp_lock:<email> -> khóa 30p sau khi nhập sai 3 lần
 * - otp_spam_lock:<email> -> khóa 1h khi yêu cầu OTP quá nhiều lần
 * - otp_cooldown:<email> -> chờ 1p giữa 2 lần gửi OTP
 */
export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError(
        "Account locked due to multiple failed attempts! Try again after 30 minutes"
      )
    );
  }
  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(
      new ValidationError(
        "Too many OTP request! Please wait 1 hour before trying again."
      )
    );
  }
  if (await redis.get(`otp_cooldown:${email}`)) {
    return next(
      new ValidationError("Please wait 1 minute before trying again.")
    );
  }
};

/**
 * Track số lần yêu cầu OTP trong 1h:
 * - Nếu request >= 2 -> khóa 1h (otp_spam_lock)
 */
export const trackOtpRequests = async (email: string, next: NextFunction) => {
  //Tạo key để lưu số lần yêu cầu OTP của email trong Redis
  const otpRequestKey = `otp_request_count:${email}`;

  //Lấy số lần yêu cầu OTP từ Redis, nếu không có thì mặc định là 0
  let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");

  //Qúa giới hạn -> khóa 1h
  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600); //Lock for 1 hour
    return next(
      new ValidationError(
        "Too many OTP request! Please wait 1 hour before trying again."
      )
    );
  }

  //Tăng số đếm và lưu vào Redis
  await redis.set(otpRequestKey, otpRequests + 1, "EX", 3600); //Track request for 1 hour
};

/**
 * Gửi OTP qua email:
 * - Tạo OTP 4 số ngẫu nhiên
 * - Gửi email bằng template tương ứng
 * - Lưu OTP vào Redis (5p)
 * - Tạo cooldown 1p giữa các lần gửi OTP
 */
export const sendOtp = async (
  email: string,
  name: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();

  //Gửi email xác thực
  await sendEmail(email, "Verify your Email", template, { name, otp });

  //Lưu OTP trong 5p
  await redis.set(`otp:${email}`, otp, "EX", 300);

  //Cooldown -> chờ 60s mới gửi được OTP tiếp
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
};

/**
 * Xác minh OTP:
 * - Nếu OTP không tồn tại -> hết hạn hoặc chưa gửi
 * - Nếu nhập sai: 
 *  + Tăng số lần nhập sai (tối đa 3)
 *  + Sai 3 lần -> khóa 30p (otp_lock)
 * - Nếu đúng:
 *  + Xóa OTP và counter lỗi
 */
export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  const storedOtp = await redis.get(`otp:${email}`);
  if (!storedOtp) {
    throw new ValidationError("Invalid or expired OTP!");
  }

  const failedAttemptsKey = `otp_attempts:${email}`;
  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");

  //Sai OTP
  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      //Lock 30p nếu sai 3 lần
      await redis.set(`otp_lock:${email}`, "locked", "EX", 1800);
      await redis.del(`otp:${email}`, failedAttemptsKey);
      throw new ValidationError(
        "Too many failed attempts. Your account is locked for 30 minutes!"
      );
    }
    await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 300);
    throw new ValidationError(
      `Incorrect OTP. ${2 - failedAttempts} attempts left.`
    );
  }

  //OTP chính xác -> xóa dữ liệu lỗi & OTP
  await redis.del(`otp:${email}`, failedAttemptsKey);
};

/**
 * Quên mật khẩu
 * 1. Nhận email và kiểm tra tồn tại trong DB
 * 2. Kiểm tra hạn chế OTP (lock, spam, cooldown)
 * 3. Track số lần yêu cầu OTP
 * 4. Gửi OTP tương ứng user/seller
 */
export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType: "user" | "seller"
) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ValidationError("Email is required!");
    }

    //Tìm user/seller trong DB
    const user =
      userType === "user"
        ? await prisma.users.findUnique({ where: { email } })
        : await prisma.sellers.findUnique({ where: { email } });

    if (!user) {
      throw new ValidationError(`${userType} not found!`);
    }

    //Kiểm tra hạn chế OTP
    await checkOtpRestrictions(email, next);

    //Track số lần request OTP (chống spam)
    await trackOtpRequests(email, next);

    //Gửi OTP quên mật khẩu
    await sendOtp(
      email,
      user.name,
      userType === "user"
        ? "forgot-password-user-email"
        : "forgot-password-seller-email"
    );

    res
      .status(200)
      .json({ message: "OTP sent to email. Please verify your account." });
  } catch (error) {
    next(error);
  }
};

/**
 * Xác minh OTP cho bước quên mật khẩu:
 * - Kiểm tra email + OTP
 * - Gọi verifyOTP() để xử lý logic
 * - Nếu thành công -> client được phép đổi mật khẩu
 */
export const verifyForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      throw new ValidationError("Email and OTP are required!");
    }

    await verifyOtp(email, otp, next);

    res
      .status(200)
      .json({ message: "OTP verified. You can now reset your password." });
  } catch (error) {
    next(error);
  }
};
