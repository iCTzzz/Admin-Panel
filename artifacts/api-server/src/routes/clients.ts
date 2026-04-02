import { Router, type IRouter } from "express";
import { ilike, count, sql } from "drizzle-orm";
import { db, clientsTable, activityTable } from "@workspace/db";
import {
  CreateClientBody,
  GetClientParams,
  ListClientsQueryParams,
  ListClientsResponse,
  GetClientResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/clients", async (req, res): Promise<void> => {
  const query = ListClientsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { search, page = 1, pageSize = 10 } = query.data;

  let baseQuery = db.select().from(clientsTable);

  if (search) {
    baseQuery = baseQuery.where(
      sql`(${clientsTable.name} ILIKE ${"%" + search + "%"} OR ${clientsTable.email} ILIKE ${"%" + search + "%"} OR ${clientsTable.company} ILIKE ${"%" + search + "%"})`
    ) as typeof baseQuery;
  }

  const offset = (page - 1) * pageSize;
  const clients = await baseQuery.limit(pageSize).offset(offset).orderBy(clientsTable.createdAt);

  const totalQuery = db.select({ count: count() }).from(clientsTable);
  const [{ count: total }] = search
    ? await (db
        .select({ count: count() })
        .from(clientsTable)
        .where(
          sql`(${clientsTable.name} ILIKE ${"%" + search + "%"} OR ${clientsTable.email} ILIKE ${"%" + search + "%"} OR ${clientsTable.company} ILIKE ${"%" + search + "%"})`
        ) as typeof totalQuery)
    : await totalQuery;

  res.json(
    ListClientsResponse.parse({
      data: clients,
      total: Number(total),
      page,
      pageSize,
    })
  );
});

router.post("/clients", async (req, res): Promise<void> => {
  const parsed = CreateClientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [client] = await db.insert(clientsTable).values(parsed.data).returning();

  await db.insert(activityTable).values({
    type: "client_added",
    description: `New client added: ${client.name} from ${client.company}`,
  });

  res.status(201).json(GetClientResponse.parse(client));
});

router.get("/clients/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetClientParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { eq } = await import("drizzle-orm");
  const [client] = await db
    .select()
    .from(clientsTable)
    .where(eq(clientsTable.id, params.data.id));

  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  res.json(GetClientResponse.parse(client));
});

export default router;
