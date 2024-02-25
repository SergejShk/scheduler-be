import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { UsersDb } from "../database/usersDb";
import { TasksDb } from "../database/tasksDb";

import { DuplicateUserError, InvalidParameterError, RefreshTokenError } from "../errors/customErrors";

import { GeneratedAuthTokens, ISignUpBody, IUser, JwtData, Token } from "../interfaces/auth";

export class AuthService {
	private usersDb: UsersDb;
	private tsksDb: TasksDb;

	constructor(usersDb: UsersDb, tsksDb: TasksDb) {
		this.usersDb = usersDb;
		this.tsksDb = tsksDb;
	}

	getToken = (data: IUser, tokenType: Token) => {
		const payload = {
			id: data.id,
			email: data.email,
			tokenType,
		};

		return jwt.sign(payload, process.env.JWT_SECRET || "", {
			expiresIn: tokenType === Token.Refresh ? "24h" : "1h",
		});
	};

	signUp = async (body: ISignUpBody) => {
		const { email } = body;

		const user = await this.usersDb.getUserByEmail(email);

		if (user.length) {
			throw new DuplicateUserError("User already exists");
		}

		const hashedPassword = await bcrypt.hash(body.password, 10);

		const [response] = await this.usersDb.createUser({
			...body,
			password: hashedPassword,
		});

		await this.tsksDb.createTask({
			tasks: [],
			userId: response.id,
		});

		const payloadToken = {
			id: response.id,
			email: response.email,
		};

		const newUser = {
			...payloadToken,
		};

		const accessToken = this.getToken(payloadToken, Token.Access);
		const refreshToken = this.getToken(payloadToken, Token.Refresh);

		return { ...newUser, accessToken, refreshToken };
	};

	logIn = async (body: ISignUpBody) => {
		const { email, password: reqPassword } = body;

		const [user] = await this.usersDb.getUserByEmail(email);

		if (!user || !(await bcrypt.compare(reqPassword, user.password))) {
			throw new InvalidParameterError("Email or password is wrong");
		}

		const { password, ...response } = user;

		const payloadToken = {
			id: response.id,
			email: response.email,
		};

		const accessToken = this.getToken(payloadToken, Token.Access);
		const refreshToken = this.getToken(payloadToken, Token.Refresh);

		return { ...response, accessToken, refreshToken };
	};

	refreshTokens = async (token: string): Promise<GeneratedAuthTokens> => {
		const decodedToken = jwt.verify(token, process.env.JWT_SECRET || "") as JwtData;

		if (decodedToken.tokenType !== Token.Refresh) throw new RefreshTokenError("Refresh token error");

		const [user] = await this.usersDb.getUserById(decodedToken.id);

		if (!user) {
			throw new RefreshTokenError(`Can't find user by refresh token`);
		}

		const payloadToken = {
			id: user.id,
			email: user.email,
		};

		const accessToken = this.getToken(payloadToken, Token.Access);
		const refreshToken = this.getToken(payloadToken, Token.Refresh);

		return { accessToken, refreshToken };
	};
}
