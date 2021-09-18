import type { Response } from "express";

function errorHandler(error: Error, res?: Response) {
  console.log(error);
  if (res) {
    const statusCode =
      error instanceof BadRequestError
        ? 400
        : error instanceof AuthenticationError
        ? 401
        : error instanceof NotFoundError
        ? 404
        : error instanceof ConflictError
        ? 409
        : 500;
    res.status(statusCode).json({ message: error.message });
  }
}

class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export {
  BadRequestError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
  errorHandler,
};
