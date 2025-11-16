import * as FieldService from "./owner.field.service.js";

/* ============================================================
   1) CREATE FIELD
============================================================ */
export const createField = async (req, res) => {
  try {
    const ownerId = req.user.id; // from token
    const data = req.body;
    const images = req.files; // Multer files

    const field = await FieldService.createField(ownerId, data, images);

    return res.status(201).json({
      message: "Field created successfully",
      data: field,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/* ============================================================
   2) GET ALL FIELDS OF OWNER
============================================================ */
export const getMyFields = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const fields = await FieldService.getMyFields(ownerId);

    return res.json({ data: fields });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/* ============================================================
   3) GET FIELD DETAIL
============================================================ */
export const getFieldDetail = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const field = await FieldService.getFieldDetail(id);

    return res.json({ data: field });
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
};

/* ============================================================
   4) UPDATE FIELD
============================================================ */
export const updateField = async (req, res) => {
  try {
    const fieldId = parseInt(req.params.id);
    const ownerId = req.user.id;
    const data = req.body;
    const images = req.files;

    const updated = await FieldService.updateField(
      fieldId,
      ownerId,
      data,
      images
    );

    return res.json({
      message: "Field updated successfully",
      data: updated,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/* ============================================================
   5) DELETE FIELD
============================================================ */
export const deleteField = async (req, res) => {
  try {
    const fieldId = parseInt(req.params.id);
    const ownerId = req.user.id;

    await FieldService.deleteField(fieldId, ownerId);

    return res.json({
      message: "Field deleted successfully",
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
