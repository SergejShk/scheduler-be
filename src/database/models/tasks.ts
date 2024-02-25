import { pgTable, serial, varchar, jsonb, integer } from "drizzle-orm/pg-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";

import users from "./users";

import { ITask } from "@/interfaces/tasks";

const tasks = pgTable("tasks", {
	id: serial("id").primaryKey().notNull(),
	tasks: jsonb("tasks").$type<ITask[]>().notNull(),
	userId: integer("user_id")
		.references(() => users.id)
		.notNull(),
});

export default tasks;

export type Task = InferSelectModel<typeof tasks>;
export type NewTask = InferInsertModel<typeof tasks>;
