import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import passport from "passport";
import { generateToken } from "../utils/jwt";

const router = Router();
const authController = new AuthController();

router.post("/login", (req, res) => authController.login(req, res));
router.post("/register", (req, res) => authController.register(req, res));

router.post("/verify-email", (req, res) =>
  authController.verifyEmail(req, res),
);
router.post("/forgot-password", (req, res) =>
  authController.forgotPassword(req, res),
);
router.post("/reset-password", (req, res) =>
  authController.resetPassword(req, res),
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user as any;
    const token = generateToken(user.id);

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  },
);

router.get("/me", authMiddleware, (req, res) => authController.getMe(req, res));

export default router;
