import multer from "multer"
import path from "path"

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/fields") // thư mục lưu ảnh
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  },
})

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error("Chỉ cho phép ảnh JPG, PNG, WEBP"))
    }
  },
})
