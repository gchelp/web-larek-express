import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import validator from 'validator';
import { faker } from '@faker-js/faker';
import Product from '../models/product';

const PAYMENT_TYPES = ['card', 'online'];

const isNonEmptyString = (value: unknown): value is string => (
  typeof value === 'string' && value.trim().length > 0
);

const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      payment, email, phone, address, total, items,
    } = req.body;

    if (!PAYMENT_TYPES.includes(payment)) {
      return res.status(400).send({ message: 'Неверный способ оплаты' });
    }
    if (!isNonEmptyString(email) || !validator.isEmail(email)) {
      return res.status(400).send({ message: 'Неверный email' });
    }
    if (!isNonEmptyString(phone)) {
      return res.status(400).send({ message: 'Не указан телефон' });
    }
    if (!isNonEmptyString(address)) {
      return res.status(400).send({ message: 'Не указан адрес' });
    }
    if (typeof total !== 'number' || Number.isNaN(total)) {
      return res.status(400).send({ message: 'Неверная сумма заказа' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).send({ message: 'Список товаров пуст' });
    }
    if (!items.every((id) => typeof id === 'string' && isValidObjectId(id))) {
      return res.status(400).send({ message: 'Неверный идентификатор товара' });
    }

    const uniqueIds = [...new Set<string>(items)];
    const products = await Product.find({ _id: { $in: uniqueIds } });

    if (products.length !== uniqueIds.length) {
      return res.status(400).send({ message: 'Один из товаров не найден' });
    }
    if (products.some((product) => product.price === null)) {
      return res.status(400).send({ message: 'Один из товаров не продаётся' });
    }

    const priceById = new Map(
      products.map((product) => [String(product._id), product.price as number]),
    );
    const sum = items.reduce((acc: number, id: string) => acc + (priceById.get(id) ?? 0), 0);

    if (sum !== total) {
      return res.status(400).send({ message: 'Сумма заказа не совпадает со стоимостью товаров' });
    }

    return res.status(200).send({ id: faker.string.uuid(), total });
  } catch (err) {
    return res.status(500).send({ message: 'Произошла ошибка на сервере' });
  }
};

export default createOrder;
