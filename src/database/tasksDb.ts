import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";

import tasks, { NewTask } from "./models/tasks";

export class TasksDb {
	constructor(private db: NodePgDatabase) {}

	public createTask = async (newTask: NewTask) =>
		this.db
			.insert(tasks)
			.values(newTask)
			.returning()
			.then((res) => res[0]);

	public getTasks = async (userId: number) => this.db.select().from(tasks).where(eq(tasks.userId, userId));

	public updateTasks = async (updTasks: NewTask) =>
		this.db.update(tasks).set(updTasks).where(eq(tasks.userId, updTasks.userId)).returning();
}
