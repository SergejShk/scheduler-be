import { RequestHandler, CookieOptions, Response } from "express";

import { Controller } from "./Controller";

import { signUpSchema } from "../dto/user";

import { AuthService } from "../services/authService";

import { AuthMiddlewares } from "../middlewares/authMiddlewares";

import { InvalidParameterError, RefreshTokenError } from "../errors/customErrors";

import { BaseResponse, okResponse } from "../api/baseResponses";

import { IUser } from "../interfaces/auth";

export class AuthController extends Controller {
	authService: AuthService;
	authMiddlewares: AuthMiddlewares;

	constructor(authService: AuthService, authMiddlewares: AuthMiddlewares) {
		super("/auth");

		this.authMiddlewares = authMiddlewares;
		this.authService = authService;

		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.post("/sign-up", this.link({ route: this.signUp }));
		this.router.post("/login", this.link({ route: this.logIn }));
		this.router.get("/me", this.authMiddlewares.isAuthorized, this.link({ route: this.getMe }));
		this.router.get("/refresh", this.link({ route: this.refreshAccessToken }));
		this.router.get("/logout", this.authMiddlewares.isAuthorized, this.link({ route: this.logOut }));
	}

	private signUp: RequestHandler<{}, BaseResponse<IUser>> = async (req, res) => {
		const validatedBody = signUpSchema.safeParse(req.body);

		if (!validatedBody.success) {
			throw new InvalidParameterError("Bad request");
		}

		const { accessToken, refreshToken, ...newUser } = await this.authService.signUp(req.body);

		this.setCookies({ res, accessToken, refreshToken });

		return res.status(201).json(okResponse(newUser));
	};

	private logIn: RequestHandler<{}, BaseResponse<IUser>> = async (req, res, next) => {
		try {
			const validatedBody = signUpSchema.safeParse(req.body);

			if (!validatedBody.success) {
				throw new InvalidParameterError("Bad request");
			}

			const { accessToken, refreshToken, ...user } = await this.authService.logIn(req.body);

			this.setCookies({ res, accessToken, refreshToken });

			return res.status(200).json(okResponse(user as IUser));
		} catch (e) {
			next(e);
		}
	};

	private getMe: RequestHandler<{}, BaseResponse<IUser>> = async (req, res, next) => {
		try {
			//@ts-ignore
			const user = req.user as IUser;

			return res.status(200).json(okResponse(user));
		} catch (e) {
			next(e);
		}
	};

	private refreshAccessToken: RequestHandler<{}, BaseResponse<{}>> = async (req, res, next) => {
		try {
			const reqRefreshToken = req.cookies["refreshToken"];
			if (!reqRefreshToken) throw new RefreshTokenError("Can't find refresh token");

			const { accessToken, refreshToken } = await this.authService.refreshTokens(reqRefreshToken);

			this.setCookies({ res, accessToken, refreshToken });

			return res.status(201).json(okResponse({ accessToken, refreshToken }));
		} catch (e) {
			next(e);
		}
	};

	private logOut: RequestHandler<{}, BaseResponse<{}>> = async (req, res, next) => {
		try {
			const response = this.clearCookies(res);

			return response.status(200).json(okResponse());
		} catch (e) {
			next(e);
		}
	};

	private setCookies = ({
		res,
		accessToken,
		refreshToken,
	}: {
		res: Response;
		accessToken: string;
		refreshToken: string;
	}): Response => {
		const expireAccessToken = new Date();
		expireAccessToken.setHours(expireAccessToken.getHours() + 1);

		const expireRefreshToken = new Date();
		expireRefreshToken.setHours(expireRefreshToken.getHours() + 7 * 24);

		const options: CookieOptions = {
			secure: true,
			httpOnly: false,
			sameSite: "none",
		};

		res.cookie("accessToken", accessToken, {
			...options,
			expires: expireAccessToken,
		});

		res.cookie("refreshToken", refreshToken, {
			...options,
			expires: expireRefreshToken,
		});

		return res;
	};

	private clearCookies = (res: Response): Response => {
		const options: CookieOptions = {
			secure: true,
			httpOnly: false,
			sameSite: "none",
		};

		res.clearCookie("accessToken", options);
		res.clearCookie("refreshToken", options);

		return res;
	};
}
