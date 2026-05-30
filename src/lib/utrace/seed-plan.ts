import { generateId } from "@/lib/utils";

export type SeedPlan = {
  planId: string;
  version: string;
  seedReference: string;
  createdAt: Date;
};

export function createSeedPlan(): SeedPlan {
  return {
    planId: generateId("seedplan"),
    version: "1.0.0",
    seedReference: generateId("seedref"),
    createdAt: new Date(),
  };
}
