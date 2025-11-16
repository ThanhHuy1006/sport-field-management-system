// modules/admin/admin.service.js
import prisma from "../../core/prisma.js";

/**
 * GET /admin/owners/pending
 * List tất cả chủ sân ở trạng thái pending
 */
export async function listPendingOwners(req, res) {
  try {
    const owners = await prisma.owner_profiles.findMany({
      where: { status: "pending" },
      include: {
        users_owner_profiles_user_idTousers: true, // join user để lấy name + email + phone
      },
      orderBy: { user_id: "asc" },
    });

    const data = owners.map((o) => ({
      user_id: o.user_id,
      business_name: o.business_name,
      tax_code: o.tax_code,
      address: o.address,
      status: o.status,
      user: {
        id: o.users_owner_profiles_user_idTousers.id,
        name: o.users_owner_profiles_user_idTousers.name,
        email: o.users_owner_profiles_user_idTousers.email,
        phone: o.users_owner_profiles_user_idTousers.phone,
      },
    }));

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /admin/owners/:id
 * :id = user_id
 */
export async function getOwnerDetail(req, res) {
  try {
    const userId = Number(req.params.id);

    const profile = await prisma.owner_profiles.findUnique({
      where: { user_id: userId },
      include: {
        users_owner_profiles_user_idTousers: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ message: "Owner profile not found" });
    }

    const user = profile.users_owner_profiles_user_idTousers;

    return res.json({
      user_id: profile.user_id,
      business_name: profile.business_name,
      tax_code: profile.tax_code,
      address: profile.address,
      status: profile.status,
      reject_reason: profile.reject_reason,
      license_url: profile.license_url ?? null,   // nếu bạn có các field này trong schema
      id_front_url: profile.id_front_url ?? null,
      id_back_url: profile.id_back_url ?? null,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      approved_by: profile.approved_by,
      approved_at: profile.approved_at,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * POST /admin/owners/:id/approve
 */
export async function approveOwner(req, res) {
  try {
    const ownerUserId = Number(req.params.id);
    const adminId = req.user.id; // từ JWT

    // dùng transaction cho chắc
    const result = await prisma.$transaction(async (tx) => {
      // update owner profile
      const updated = await tx.owner_profiles.update({
        where: { user_id: ownerUserId },
        data: {
          status: "approved",
          reject_reason: null,
          approved_by: adminId,
          approved_at: new Date(),
        },
      });

      // ghi log admin action (nếu muốn)
      await tx.admin_actions.create({
        data: {
          admin_id: adminId,
          target_type: "OWNER_PROFILE",
          target_id: ownerUserId,
          action: "APPROVE",
          meta_json: null,
        },
      });

      return updated;
    });

    return res.json({ message: "Approved", owner: { user_id: result.user_id } });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Owner profile not found" });
    }
    return res.status(500).json({ message: err.message });
  }
}

/**
 * POST /admin/owners/:id/reject
 * body: { reason }
 */
export async function rejectOwner(req, res) {
  try {
    const ownerUserId = Number(req.params.id);
    const adminId = req.user.id;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res
        .status(400)
        .json({ message: "Lý do từ chối phải tối thiểu 5 ký tự" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.owner_profiles.update({
        where: { user_id: ownerUserId },
        data: {
          status: "rejected",
          reject_reason: reason,
          approved_by: adminId,
          approved_at: new Date(),
        },
      });

      await tx.admin_actions.create({
        data: {
          admin_id: adminId,
          target_type: "OWNER_PROFILE",
          target_id: ownerUserId,
          action: "REJECT",
          meta_json: JSON.stringify({ reason }),
        },
      });

      return updated;
    });

    return res.json({
      message: "Rejected",
      owner: { user_id: result.user_id, reject_reason: result.reject_reason },
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Owner profile not found" });
    }
    return res.status(500).json({ message: err.message });
  }
}
