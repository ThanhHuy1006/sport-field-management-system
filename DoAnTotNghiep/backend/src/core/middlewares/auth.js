// import jwt from "jsonwebtoken";
// import prisma from "../prisma.js";

// // =====================
// // VERIFY TOKEN
// // =====================
// export function verifyToken(req, res, next) {
//   const header = req.headers.authorization;
//   if (!header) return res.status(401).json({ message: "No token" });

//   const token = header.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
//     req.user = decoded; // { id, email, role }
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// }

// // =====================
// // REQUIRE ROLE (OWNER / ADMIN / USER)
// // =====================
// export function requireRole(...roles) {
//   return (req, res, next) => {
//     if (!req.user)
//       return res.status(401).json({ message: "No user in request" });

//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ message: "Forbidden" });
//     }

//     next();
//   };
// }

// // =====================
// // REQUIRE OWNER APPROVED
// // =====================
// // Chỉ owner đã APPROVED mới được dùng API quản lý sân
// // Owner pending/rejected vẫn đăng nhập được → nhưng bị chặn API
// // Ngoại lệ: /owner/profile thì không dùng middleware này
// // =====================
// export async function requireOwnerApproved(req, res, next) {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ message: "No user in request" });
//     }

//     // Chỉ check với owner, admin không check
//     if (req.user.role !== "OWNER") {
//       return next();
//     }

//     const ownerId = req.user.id;

//     const profile = await prisma.owner_profiles.findUnique({
//       where: { user_id: ownerId },
//     });

//     if (!profile) {
//       return res.status(403).json({
//         message: "Hồ sơ chủ sân không tồn tại",
//       });
//     }

//     if (profile.status !== "approved") {
//       return res.status(403).json({
//         message: "Tài khoản chủ sân chưa được phê duyệt",
//         status: profile.status,
//         reason: profile.reject_reason || null,
//       });
//     }

//     next();
//   } catch (err) {
//     return res.status(500).json({ message: err.message });
//   }
// }
