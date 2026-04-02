import { Router, type IRouter } from "express";
import { eq, count, sum, sql } from "drizzle-orm";
import { db, clientsTable, projectsTable, activityTable } from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetProjectsByMonthResponse,
  GetRecentActivityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [totalClients] = await db.select({ count: count() }).from(clientsTable);
  const [activeProjects] = await db
    .select({ count: count() })
    .from(projectsTable)
    .where(eq(projectsTable.status, "active"));
  const [completedProjects] = await db
    .select({ count: count() })
    .from(projectsTable)
    .where(eq(projectsTable.status, "completed"));
  const [revenueResult] = await db
    .select({ total: sum(projectsTable.estimatedRevenue) })
    .from(projectsTable);

  const summary = {
    totalClients: Number(totalClients?.count ?? 0),
    activeProjects: Number(activeProjects?.count ?? 0),
    completedProjects: Number(completedProjects?.count ?? 0),
    estimatedRevenue: parseFloat(revenueResult?.total ?? "0"),
  };

  res.json(GetDashboardSummaryResponse.parse(summary));
});

router.get("/dashboard/projects-by-month", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      month: sql<string>`TO_CHAR(${projectsTable.createdAt}, 'Mon')`.as("month"),
      monthNum: sql<number>`EXTRACT(MONTH FROM ${projectsTable.createdAt})`.as("month_num"),
      count: count(),
    })
    .from(projectsTable)
    .groupBy(
      sql`TO_CHAR(${projectsTable.createdAt}, 'Mon')`,
      sql`EXTRACT(MONTH FROM ${projectsTable.createdAt})`
    )
    .orderBy(sql`EXTRACT(MONTH FROM ${projectsTable.createdAt})`);

  const data = rows.map((r) => ({
    month: r.month,
    count: Number(r.count),
  }));

  res.json(GetProjectsByMonthResponse.parse(data));
});

router.get("/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const activities = await db
    .select()
    .from(activityTable)
    .orderBy(sql`${activityTable.createdAt} DESC`)
    .limit(10);

  res.json(GetRecentActivityResponse.parse(activities));
});

export default router;
