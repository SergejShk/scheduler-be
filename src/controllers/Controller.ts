import { RequestHandler, Router } from "express";
import "dotenv/config";

import { errorResponse } from "../api/baseResponses";

import { CustomError, IError } from "../errors/customErrors";

export abstract class Controller {
	public readonly router: Router;

	constructor(public path: string) {
		this.router = Router();
	}

	public link = ({ route }: { route: any }): RequestHandler => {
		return async (req, res, next) => {
			try {
				await route(req, res, next);
			} catch (error: any) {
				if (error instanceof IError) {
					return res.status(400).json(errorResponse({ code: "400", message: error.message }));
				}
				if (error instanceof CustomError) {
					return res.status(error.status).json(error.message);
				}
				return res.status(500).json(errorResponse({ code: "500", message: "Internal server error" }));
			}
		};
	};
}
