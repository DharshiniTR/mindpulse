import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import checkinsRouter from "./checkins";
import insightsRouter from "./insights";
import resourcesRouter from "./resources";
import achievementsRouter from "./achievements";
import communityRouter from "./community";
import geminiRouter from "./gemini/index";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/checkins", checkinsRouter);
router.use("/insights", insightsRouter);
router.use("/resources", resourcesRouter);
router.use("/achievements", achievementsRouter);
router.use("/community", communityRouter);
router.use("/gemini", geminiRouter);

export default router;
