import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const userController = new UserController();

router.get("/me/responses", authMiddleware, (req, res) =>
  userController.getMyResponses(req, res),
);

export default router;
