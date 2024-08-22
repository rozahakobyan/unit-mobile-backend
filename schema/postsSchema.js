import Joi from 'joi';

export default {
    add: Joi.object({
        photos: Joi.array().items(Joi.string().max(255)),
    }),
}
