import { Router } from "express";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import {
  uploadAvatarMiddleware,
  uploadDocumentsMiddleware,
  uploadFieldImagesMiddleware,
} from "./uploads.middleware.js";
import { uploadsController } from "./uploads.controller.js";

const router = Router();

router.use(requireAuth);

router.post(
  "/fields/images",
  uploadFieldImagesMiddleware,
  uploadsController.uploadFieldImages
);

router.post(
  "/avatar",
  uploadAvatarMiddleware,
  uploadsController.uploadAvatar
);

router.post(
  "/documents",
  uploadDocumentsMiddleware,
  uploadsController.uploadDocuments
);

export default router;