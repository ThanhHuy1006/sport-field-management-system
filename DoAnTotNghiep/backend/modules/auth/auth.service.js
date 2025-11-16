import prisma from "../../core/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// =====================
// CUSTOMER REGISTER
// =====================
export async function registerCustomer(req, res) {
  try {
    const { name, email, phone, password } = req.body;

    const exists = await prisma.users.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ message: "Email đã tồn tại" });

    const hashed = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: {
        name,
        email,
        phone,
        password_hash: hashed,
        role: "USER",
      },
    });

    return res.json({ message: "Customer registered" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// =====================
// OWNER STEP 1
// =====================
export async function registerOwnerStep1(req, res) {
  try {
    const { name, email, phone, password } = req.body;

    const exists = await prisma.users.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ message: "Email đã tồn tại" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        name,
        email,
        phone,
        password_hash: hashed,
        role: "OWNER",
      },
    });

    return res.json({ userId: user.id, message: "Step 1 OK" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// =====================
// OWNER STEP 2  (fixed: dùng upsert)
// =====================
export async function registerOwnerStep2(req, res) {
  try {
    const { userId, business_name, tax_code, address } = req.body;

    await prisma.owner_profiles.upsert({
      where: { user_id: Number(userId) },
      update: {
        business_name,
        tax_code,
        address,
      },
      create: {
        user_id: Number(userId),
        business_name,
        tax_code,
        address,
        status: "pending",
      },
    });

    return res.json({ message: "Step 2 OK" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// =====================
// OWNER STEP 3 — UPLOAD DOCUMENTS (FIXED)
// =====================
export async function registerOwnerStep3(req, res) {
  try {
    // console.log("REQ BODY:", req.body);
    // console.log("REQ FILES:", req.files);

    const userId =
      req.body.userId || req.body.userid || req.body.UserId || req.body.USERID;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/documents`;

    const license = req.files?.license?.[0]?.filename;
    const id_front = req.files?.id_front?.[0]?.filename;
    const id_back = req.files?.id_back?.[0]?.filename;

    await prisma.owner_profiles.update({
      where: { user_id: Number(userId) },
      data: {
        license_url: license ? `${baseUrl}/${license}` : undefined,
        id_front_url: id_front ? `${baseUrl}/${id_front}` : undefined,
        id_back_url: id_back ? `${baseUrl}/${id_back}` : undefined,
      },
    });

    return res.json({
      message: "Đăng ký chủ sân hoàn tất",
      files: {
        license: license && `${baseUrl}/${license}`,
        id_front: id_front && `${baseUrl}/${id_front}`,
        id_back: id_back && `${baseUrl}/${id_back}`,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// =====================
// LOGIN
// =====================
export async function login(req, res) {
  try {
    const { email, password, role } = req.body;

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Email không tồn tại" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(400).json({ message: "Sai mật khẩu" });

    if (role && user.role !== role)
      return res.status(400).json({ message: "Sai phân quyền" });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "3d" }
    );

    return res.json({
      message: "Login OK",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// =====================
// GET CURRENT USER
// =====================
export async function me(req, res) {
  return res.json({ user: req.user });
}
