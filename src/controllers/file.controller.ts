import { Request, Response } from "express";
import { FileService } from "../services/file.services";
import { ERRORS } from "../utils/errors";
import multer from "multer";
import { allowedTypes } from "../utils/file";

const fileService = new FileService();

// Multer en memoria (no guarda en disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(ERRORS.INVALID_FILE_TYPE.code));
    }
  },
});

export class FileController {
  async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json(ERRORS.FILE_REQUIRED);
      }

      const url = await fileService.uploadFile(
        req.file.buffer,
        req.file.mimetype,
      );

      res.status(201).json({ url });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === ERRORS.INVALID_FILE_TYPE.code) {
          return res.status(400).json(ERRORS.INVALID_FILE_TYPE);
        }
        if (error.message === ERRORS.FILE_UPLOAD_FAILED.code) {
          return res.status(500).json(ERRORS.FILE_UPLOAD_FAILED);
        }
      }
      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteFile(req: Request, res: Response) {
    try {
      const { url } = req.body;
      await fileService.deleteFile(url);
      res.status(204).send();
    } catch (error) {
      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }
}

export { upload };