import { z } from "zod";

export const tasksSchema = z
	.object({
		id: z.number().optional(),
		userId: z.number(),
		tasks: z
			.object({
				id: z.string(),
				date: z.string(),
				description: z.string(),
				labels: z.string().array(),
			})
			.strict()
			.array(),
	})
	.strict();
