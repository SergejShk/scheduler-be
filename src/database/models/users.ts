import { pgTable, serial, varchar, jsonb } from "drizzle-orm/pg-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";

import { ITask } from "@/interfaces/tasks";

const users = pgTable("users", {
	id: serial("id").primaryKey().notNull(),
	email: varchar("email").notNull(),
	password: varchar("password").notNull(),
});

export default users;

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
