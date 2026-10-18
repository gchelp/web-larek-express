import { NextFunction, Request, Response } from 'express';

type HttpError = Error & { statusCode?: number };

const errorHandler = (
  err: HttpError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  const statusCode = err.statusCode ?? 500;
  const message = statusCode === 500 ? 'На сервере произошла ошибка' : err.message;

  res.status(statusCode).send({ message });
};

export default errorHandler;
