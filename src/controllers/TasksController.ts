import { RequestHandler } from "express";

import { Controller } from "./Controller";

import { tasksSchema } from "../dto/tasks";

import { TasksService } from "../services/tasksService";

import { Task } from "../database/models/tasks";

import { AuthMiddlewares } from "../middlewares/authMiddlewares";

import { InvalidParameterError } from "../errors/customErrors";

import { BaseResponse, okResponse } from "../api/baseResponses";

import { IUser } from "../interfaces/auth";

export class TasksController extends Controller {
	tasksService: TasksService;
	authMiddlewares: AuthMiddlewares;

	constructor(tasksService: TasksService, authMiddlewares: AuthMiddlewares) {
		super("/tasks");

		this.authMiddlewares = authMiddlewares;
		this.tasksService = tasksService;

		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.post("/all", this.authMiddlewares.isAuthorized, this.link({ route: this.getTasks }));
		this.router.put("/update", this.authMiddlewares.isAuthorized, this.link({ route: this.updateTasks }));
	}

	private getTasks: RequestHandler<{}, BaseResponse<Task>> = async (req, res) => {
		//@ts-ignore
		const user = req.user as IUser;

		const [updatedTasks] = await this.tasksService.getTasks(user.id);

		return res.status(201).json(okResponse(updatedTasks));
	};

	private updateTasks: RequestHandler<{}, BaseResponse<Task>> = async (req, res) => {
		const validatedBody = tasksSchema.safeParse(req.body);

		if (!validatedBody.success) {
			throw new InvalidParameterError("Bad request");
		}

		const [updatedTasks] = await this.tasksService.updateTasks(req.body);

		return res.status(201).json(okResponse(updatedTasks));
	};
}
