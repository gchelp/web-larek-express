import { NextFunction, Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import validator from 'validator';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const PAYMENT_TYPES = ['card', 'online'];

const isNonEmptyString = (value: unknown): value is string => (
  typeof value === 'string' && value.trim().length > 0
);

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      payment, email, phone, address, total, items,
    } = req.body;

    if (!PAYMENT_TYPES.includes(payment)) {
      return next(new BadRequestError('Неверный способ оплаты'));
    }
    if (!isNonEmptyString(email) || !validator.isEmail(email)) {
      return next(new BadRequestError('Неверный email'));
    }
    if (!isNonEmptyString(phone)) {
      return next(new BadRequestError('Не указан телефон'));
    }
    if (!isNonEmptyString(address)) {
      return next(new BadRequestError('Не указан адрес'));
    }
    if (typeof total !== 'number' || Number.isNaN(total)) {
      return next(new BadRequestError('Неверная сумма заказа'));
    }
    if (!Array.isArray(items) || items.length === 0) {
      return next(new BadRequestError('Список товаров пуст'));
    }
    if (!items.every((id) => typeof id === 'string' && isValidObjectId(id))) {
      return next(new BadRequestError('Неверный идентификатор товара'));
    }

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

    return res.status(201).send({ id: faker.string.uuid(), total });
  } catch (err) {
    return next(err);
  }
};

export default createOrder;
