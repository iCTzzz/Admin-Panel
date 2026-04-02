import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clientsRouter from "./clients";
import projectsRouter from "./projects";
import servicesRouter from "./services";
import dashboardRouter from "./dashboard";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(clientsRouter);
router.use(projectsRouter);
router.use(servicesRouter);
router.use(dashboardRouter);
router.use(reportsRouter);

export default router;
