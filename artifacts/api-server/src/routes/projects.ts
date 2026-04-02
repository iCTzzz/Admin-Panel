import { Router, type IRouter } from "express";
import { eq, count, sql } from "drizzle-orm";
import { db, projectsTable, clientsTable, activityTable } from "@workspace/db";
import {
  CreateProjectBody,
  GetProjectParams,
  ListProjectsQueryParams,
  ListProjectsResponse,
  GetProjectResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/projects", async (req, res): Promise<void> => {
  const query = ListProjectsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { search, status, page = 1, pageSize = 10 } = query.data;
  const offset = (page - 1) * pageSize;

  const conditions: ReturnType<typeof sql>[] = [];

  if (search) {
    conditions.push(sql`${projectsTable.name} ILIKE ${"%" + search + "%"}`);
  }
  if (status) {
    conditions.push(sql`${projectsTable.status} = ${status}`);
  }

  const whereClause = conditions.length > 0 ? sql`WHERE ${sql.join(conditions, sql` AND `)}` : sql``;

  const rows = await db
    .select({
      id: projectsTable.id,
      name: projectsTable.name,
      clientId: projectsTable.clientId,
      clientName: clientsTable.name,
      status: projectsTable.status,
      startDate: projectsTable.startDate,
      estimatedRevenue: projectsTable.estimatedRevenue,
      createdAt: projectsTable.createdAt,
    })
    .from(projectsTable)
    .leftJoin(clientsTable, eq(projectsTable.clientId, clientsTable.id))
    .$dynamic()
    .where(
      conditions.length > 0
        ? conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`)
        : sql`1=1`
    )
    .limit(pageSize)
    .offset(offset)
    .orderBy(projectsTable.createdAt);

  const totalRows = await db
    .select({ count: count() })
    .from(projectsTable)
    .where(
      conditions.length > 0
        ? conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`)
        : sql`1=1`
    );

  const total = Number(totalRows[0]?.count ?? 0);

  const projects = rows.map((r) => ({
    ...r,
    clientName: r.clientName ?? "Unknown",
    estimatedRevenue: parseFloat(r.estimatedRevenue ?? "0"),
  }));

  res.json(
    ListProjectsResponse.parse({
      data: projects,
      total,
      page,
      pageSize,
    })
  );
});

router.post("/projects", async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [project] = await db
    .insert(projectsTable)
    .values({
      name: parsed.data.name,
      clientId: parsed.data.clientId,
      status: parsed.data.status,
      startDate: parsed.data.startDate,
      estimatedRevenue: String(parsed.data.estimatedRevenue),
    })
    .returning();

  const [client] = await db
    .select({ name: clientsTable.name })
    .from(clientsTable)
    .where(eq(clientsTable.id, project.clientId));

  await db.insert(activityTable).values({
    type: "project_created",
    description: `New project created: ${project.name} for ${client?.name ?? "unknown client"}`,
  });

  const projectWithClient = {
    ...project,
    clientName: client?.name ?? "Unknown",
    estimatedRevenue: parseFloat(project.estimatedRevenue),
  };

  res.status(201).json(GetProjectResponse.parse(projectWithClient));
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetProjectParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db
    .select({
      id: projectsTable.id,
      name: projectsTable.name,
      clientId: projectsTable.clientId,
      clientName: clientsTable.name,
      status: projectsTable.status,
      startDate: projectsTable.startDate,
      estimatedRevenue: projectsTable.estimatedRevenue,
      createdAt: projectsTable.createdAt,
    })
    .from(projectsTable)
    .leftJoin(clientsTable, eq(projectsTable.clientId, clientsTable.id))
    .where(eq(projectsTable.id, params.data.id));

  if (!rows[0]) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const project = {
    ...rows[0],
    clientName: rows[0].clientName ?? "Unknown",
    estimatedRevenue: parseFloat(rows[0].estimatedRevenue ?? "0"),
  };

  res.json(GetProjectResponse.parse(project));
});

export default router;
