import { pgTable, serial, varchar, jsonb, integer } from "drizzle-orm/pg-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";

import users from "./users";

const tasks = pgTable("tasks", {
	id: serial("id").primaryKey().notNull(),
	date: varchar("date").notNull(),
	description: varchar("description").notNull(),
	labels: jsonb("labels").$type<number[]>(),
	userId: integer("user_id")
		.references(() => users.id)
		.notNull(),
});

export default tasks;

export type Task = InferSelectModel<typeof tasks>;
export type NewTask = InferInsertModel<typeof tasks>;
