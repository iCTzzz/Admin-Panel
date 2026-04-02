import { Router, type IRouter } from "express";
import { db, servicesTable, activityTable } from "@workspace/db";
import {
  CreateServiceBody,
  ListServicesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/services", async (_req, res): Promise<void> => {
  const services = await db
    .select()
    .from(servicesTable)
    .orderBy(servicesTable.createdAt);

  const mapped = services.map((s) => ({
    ...s,
    estimatedPrice: parseFloat(s.estimatedPrice),
  }));

  res.json(ListServicesResponse.parse(mapped));
});

router.post("/services", async (req, res): Promise<void> => {
  const parsed = CreateServiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [service] = await db
    .insert(servicesTable)
    .values({
      name: parsed.data.name,
      description: parsed.data.description,
      estimatedPrice: String(parsed.data.estimatedPrice),
    })
    .returning();

  await db.insert(activityTable).values({
    type: "service_added",
    description: `New service added: ${service.name}`,
  });

  res.status(201).json({
    ...service,
    estimatedPrice: parseFloat(service.estimatedPrice),
  });
});

export default router;
