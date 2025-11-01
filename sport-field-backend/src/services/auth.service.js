import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./_prisma.js";
import { env } from "../config/env.js";

// 🔹 Tạo access & refresh token
function signToken(user) {
  const payload = { id: user.id, role: user.role };
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: "1h" });
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken, user: payload };
}

// // 🔹 Đăng ký
// export async function register({ email, password, name, role }) {
//   if (!email || !password) throw { status: 400, message: "Email và mật khẩu là bắt buộc" };

//   const exists = await prisma.users.findUnique({ where: { email } });
//   if (exists) throw { status: 409, message: "Email đã tồn tại" };

//   const hash = await bcrypt.hash(password, 10);
//   const user = await prisma.users.create({
//     data: {
//       email,
//       password_hash: hash,
//       name: name || "Người dùng mới",
//       role: role || "USER",
//       status: "active",
//     },
//   });

//   return signToken(user);
// }
// src/services/auth.service.js
// export async function register({ email, password, name, role, userType }) {
//   if (!email || !password) throw { status: 400, message: "Email và mật khẩu là bắt buộc" };

//   const exists = await prisma.users.findUnique({ where: { email } });
//   if (exists) throw { status: 409, message: "Email đã tồn tại" };

//   const hash = await bcrypt.hash(password, 10);

//   // ✅ Map userType từ FE sang role trong DB
//   let finalRole = "USER";
//   if (userType === "owner") finalRole = "OWNER";
//   else if (userType === "admin") finalRole = "ADMIN";

//   const user = await prisma.users.create({
//     data: {
//       email,
//       password_hash: hash,
//       name: name || "Người dùng mới",
//       role: finalRole,
//       status: "active",
//     },
//   });

//   return signToken(user);
// }
// src/services/auth.service.js
export async function register({ email, password, name, userType }) {
  if (!email || !password) throw { status: 400, message: "Email và mật khẩu là bắt buộc" };

  const exists = await prisma.users.findUnique({ where: { email } });
  if (exists) throw { status: 409, message: "Email đã tồn tại" };

  const hash = await bcrypt.hash(password, 10);

  // ✅ Mapping userType → role trong DB
  let finalRole = "USER";
  if (userType === "owner") finalRole = "OWNER";
  else if (userType === "admin") finalRole = "ADMIN";

  const user = await prisma.users.create({
    data: {
      email,
      password_hash: hash,
      name: name || "Người dùng mới",
      role: finalRole,
      status: "active",
    },
  });

  return signToken(user);
}

// 🔹 Đăng nhập
export async function login({ email, password }) {
  if (!email || !password) throw { status: 400, message: "Thiếu email hoặc mật khẩu" };

  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) throw { status: 401, message: "Sai thông tin đăng nhập" };

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw { status: 401, message: "Sai thông tin đăng nhập" };

  return signToken(user);
}

// 🔹 Refresh Token
export async function refresh(refreshToken) {
  try {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign(
      { id: payload.id, role: payload.role },
      env.JWT_ACCESS_SECRET,
      { expiresIn: "1h" }
    );
    return { accessToken };
  } catch {
    throw { status: 401, message: "Refresh token không hợp lệ" };
  }
}
