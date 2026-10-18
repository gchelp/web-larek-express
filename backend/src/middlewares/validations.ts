import { celebrate, Joi, Segments } from 'celebrate';

export const validateProductBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().min(2).max(30).required()
      .messages({
        'string.min': 'Минимальная длина поля "title" - 2',
        'string.max': 'Максимальная длина поля "title" - 30',
        'any.required': 'Поле "title" должно быть заполнено',
      }),
    image: Joi.object().keys({
      fileName: Joi.string().required(),
      originalName: Joi.string().required(),
    }).required(),
    category: Joi.string().required().messages({
      'any.required': 'Поле "category" должно быть заполнено',
    }),
    description: Joi.string(),
    price: Joi.number().allow(null),
  }),
});

export const validateOrderBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    payment: Joi.string().valid('card', 'online').required().messages({
      'any.only': 'Допустимые способы оплаты: card или online',
      'any.required': 'Не указан способ оплаты',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Неверный email',
      'any.required': 'Не указан email',
    }),
    phone: Joi.string().required().messages({
      'any.required': 'Не указан телефон',
    }),
    address: Joi.string().required().messages({
      'any.required': 'Не указан адрес',
    }),
    total: Joi.number().required().messages({
      'any.required': 'Не указана сумма заказа',
    }),
    items: Joi.array().items(Joi.string().hex().length(24)).min(1).required()
      .messages({
        'array.min': 'Список товаров пуст',
        'any.required': 'Не указан список товаров',
      }),
  }),
});
