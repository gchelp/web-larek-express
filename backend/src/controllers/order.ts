import { NextFunction, Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { total, items } = req.body;

    const uniqueIds = [...new Set<string>(items)];
    const products = await Product.find({ _id: { $in: uniqueIds } });

    if (products.length !== uniqueIds.length) {
      return next(new BadRequestError('Один из товаров не найден'));
    }
    if (products.some((product) => product.price === null)) {
      return next(new BadRequestError('Один из товаров не продаётся'));
    }

    const priceById = new Map(
      products.map((product) => [String(product._id), product.price as number]),
    );
    const sum = items.reduce((acc: number, id: string) => acc + (priceById.get(id) ?? 0), 0);

    if (sum !== total) {
      return next(new BadRequestError('Сумма заказа не совпадает со стоимостью товаров'));
    }

    return res.status(200).send({ id: faker.string.uuid(), total });
  } catch (err) {
    return next(err);
  }
};

export default createOrder;
