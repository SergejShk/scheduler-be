import { NewTask } from "../database/models/tasks";

import { TasksDb } from "../database/tasksDb";

export class TasksService {
	private tsksDb: TasksDb;

	constructor(tsksDb: TasksDb) {
		this.tsksDb = tsksDb;
	}

	getTasks = (userId: number) => {
		return this.tsksDb.getTasks(userId);
	};

	updateTasks = (updTasks: NewTask) => {
		return this.tsksDb.updateTasks(updTasks);
	};
}
