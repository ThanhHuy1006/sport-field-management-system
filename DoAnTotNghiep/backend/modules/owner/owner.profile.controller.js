// import * as ProfileService from "./owner.profile.service.js";

// export const getMyProfile = async (req, res) => {
//   try {
//     const ownerId = req.user.id;

//     const profile = await ProfileService.getMyProfile(ownerId);

//     return res.json({ data: profile });
//   } catch (err) {
//     return res.status(400).json({ error: err.message });
//   }
// };

// export const updateProfile = async (req, res) => {
//   try {
//     const ownerId = req.user.id;

//     const updated = await ProfileService.updateProfile(ownerId, req.body);

//     return res.json({
//       message: "Cập nhật hồ sơ thành công. Hồ sơ sẽ được xét duyệt lại.",
//       data: updated,
//     });
//   } catch (err) {
//     return res.status(400).json({ error: err.message });
//   }
// };
import * as ProfileService from "./owner.profile.service.js";

export const getMyProfile = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const profile = await ProfileService.getMyProfile(ownerId);

    return res.json({ data: profile });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // 🔥 FIX QUAN TRỌNG — truyền cả files vào service
    const updated = await ProfileService.updateProfile(
      ownerId,
      req.body,
      req.files
    );

    return res.json({
      message: "Cập nhật hồ sơ thành công. Hồ sơ sẽ được xét duyệt lại.",
      data: updated,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
