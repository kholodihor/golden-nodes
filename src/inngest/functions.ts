import prisma from "@/lib/prisma";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "create-workflow" },
  { event: "test/create.workflow" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    await step.run('create-workflow', () => {
      return prisma.workflow.create({
        data: {
          name: event.data.name,
        },
      });
    })

  },
);