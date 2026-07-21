import { Router } from "express";
import { FormController } from "../controllers/form.controller";
import { FormResponseController } from "../controllers/form-response.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { responseRateLimiter } from "../middlewares/rate-limit";

const router = Router();
const formController = new FormController();
const formResponseController = new FormResponseController();

router.post("/", authMiddleware, (req, res) =>
  formController.createForm(req, res),
);
router.get("/", authMiddleware, (req, res) =>
  formController.getAllFormsByUser(req, res),
);
router.get("/:formId", authMiddleware, (req, res) =>
  formController.getFormById(req, res),
);
router.patch("/:formId/publish", authMiddleware, (req, res) =>
  formController.togglePublish(req, res),
);
router.patch("/:formId", authMiddleware, (req, res) =>
  formController.updateForm(req, res),
);
router.delete("/:formId", authMiddleware, (req, res) =>
  formController.deleteForm(req, res),
);
router.post("/:formId/fields", authMiddleware, (req, res) =>
  formController.addField(req, res),
);
router.patch("/:formId/fields/:fieldId", authMiddleware, (req, res) =>
  formController.updateField(req, res),
);
router.delete("/:formId/fields/:fieldId", authMiddleware, (req, res) =>
  formController.removeField(req, res),
);

// Responses (público - sin auth, con rate limiting)
router.post("/:formId/responses", responseRateLimiter, (req, res) =>
  formResponseController.submitResponse(req, res),
);

// Responses (auth)
router.get("/:formId/responses", authMiddleware, (req, res) =>
  formResponseController.getResponsesByForm(req, res),
);
router.get("/:formId/responses/export", authMiddleware, (req, res) =>
  formResponseController.exportResponses(req, res),
);
router.get("/:formId/responses/:responseId", authMiddleware, (req, res) =>
  formResponseController.getResponseById(req, res),
);
router.delete("/:formId/responses/:responseId", authMiddleware, (req, res) =>
  formResponseController.deleteResponse(req, res),
);

// Stats (auth)
router.get("/:formId/stats", authMiddleware, (req, res) =>
  formResponseController.getFormStats(req, res),
);

export default router;
