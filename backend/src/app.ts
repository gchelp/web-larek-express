import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import productRouter from './routes/product';
import orderRouter from './routes/order';

const { PORT = 3000, DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek' } = process.env;

const app = express();

mongoose.connect(DB_ADDRESS);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/product', productRouter);
app.use('/order', orderRouter);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`listening on port ${PORT}`);
});
