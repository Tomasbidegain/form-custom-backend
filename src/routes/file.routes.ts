import { Router } from "express";
import { FileController, upload } from "../controllers/file.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const fileController = new FileController();

router.post("/upload", authMiddleware, upload.single("file"), (req, res) =>
  fileController.uploadFile(req, res),
);

router.delete("/", authMiddleware, (req, res) =>
  fileController.deleteFile(req, res),
);

export default router;