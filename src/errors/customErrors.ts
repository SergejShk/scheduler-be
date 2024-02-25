class IError extends Error {
	public constructor(message: string) {
		super(message);

		Object.setPrototypeOf(this, IError.prototype);
	}
}

class CustomError extends Error {
	status: number;

	constructor(message: string) {
		super(message);
		this.message = message;
		this.status = 400;
	}
}

class InvalidParameterError extends CustomError {
	status: number;

	constructor(message: string) {
		super(message);
		this.message = message;
		this.status = 422;
	}
}

class DuplicateUserError extends CustomError {
	status: number;

	constructor(message: string) {
		super(message);
		this.message = message;
		this.status = 409;
	}
}

class UnauthorizedError extends CustomError {
	status: number;

	constructor(message: string) {
		super(message);
		this.message = message;
		this.status = 401;
	}
}

class RefreshTokenError extends CustomError {
	status: number;

	constructor(message: string) {
		super(message);
		this.message = message;
		this.status = 403;
	}
}

export {
	IError,
	CustomError,
	InvalidParameterError,
	DuplicateUserError,
	UnauthorizedError,
	RefreshTokenError,
};
