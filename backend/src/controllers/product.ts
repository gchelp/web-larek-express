import { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import Product from '../models/product';

export const getProducts = async (_req: Request, res: Response) => {
  try {
    const items = await Product.find({});
    return res.send({ items, total: items.length });
  } catch (err) {
    return res.status(500).send({ message: 'Произошла ошибка на сервере' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      title, image, category, description, price,
    } = req.body;

    const product = await Product.create({
      title,
      image,
      category,
      description,
      price,
    });
    return res.status(201).send(product);
  } catch (err) {
    if (err instanceof MongooseError.ValidationError) {
      return res.status(400).send({ message: err.message });
    }
    if (err instanceof Error && err.message.includes('E11000')) {
      return res
        .status(409)
        .send({ message: 'Товар с таким названием уже существует' });
    }
    return res.status(500).send({ message: 'Произошла ошибка на сервере' });
  }
};
