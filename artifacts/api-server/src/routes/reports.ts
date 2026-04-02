import { Router, type IRouter } from "express";
import { count, sum, sql } from "drizzle-orm";
import { db, projectsTable } from "@workspace/db";
import {
  GetRevenueByMonthResponse,
  GetProjectsByStatusResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/reports/revenue-by-month", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      month: sql<string>`TO_CHAR(${projectsTable.createdAt}, 'Mon')`.as("month"),
      monthNum: sql<number>`EXTRACT(MONTH FROM ${projectsTable.createdAt})`.as("month_num"),
      revenue: sum(projectsTable.estimatedRevenue),
    })
    .from(projectsTable)
    .groupBy(
      sql`TO_CHAR(${projectsTable.createdAt}, 'Mon')`,
      sql`EXTRACT(MONTH FROM ${projectsTable.createdAt})`
    )
    .orderBy(sql`EXTRACT(MONTH FROM ${projectsTable.createdAt})`);

  const data = rows.map((r) => ({
    month: r.month,
    revenue: parseFloat(r.revenue ?? "0"),
  }));

  res.json(GetRevenueByMonthResponse.parse(data));
});

router.get("/reports/projects-by-status", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      status: projectsTable.status,
      count: count(),
    })
    .from(projectsTable)
    .groupBy(projectsTable.status);

  const data = rows.map((r) => ({
    status: r.status,
    count: Number(r.count),
  }));

  res.json(GetProjectsByStatusResponse.parse(data));
});

export default router;
