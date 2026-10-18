import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { errors } from 'celebrate';
import { PORT, DB_ADDRESS } from './config';
import NotFoundError from './errors/not-found-error';
import errorHandler from './middlewares/error-handler';
import productRouter from './routes/product';
import orderRouter from './routes/order';
import { requestLogger, errorLogger } from './middlewares/logger';

const app = express();

mongoose.connect(DB_ADDRESS);

app.use(cors());
app.use(express.json());

app.use(requestLogger);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/product', productRouter);
app.use('/order', orderRouter);

app.use((_req, _res, next) => next(new NotFoundError('Маршрут не найден')));

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`listening on port ${PORT}`);
});
