import Joi from 'joi';

export default {
    register: Joi.object({
        firstName: Joi.string().max(255).required(),
        lastName: Joi.string().max(255).required(),
        email: Joi.string().email().required(),
        password: Joi.string().required().min(8),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required().label('Confirm password')
            .messages({ 'any.only': '{{#label}} does not match the password' })
    }),
    login: Joi.object({
        email: Joi.string().trim().email().required(),
        password: Joi.string().min(8).required(),
    }),
    adminLogin: Joi.object({
        email: Joi.string().trim().email().required(),
        password: Joi.string().min(8).required(),
    }),
    password: Joi.object({
        password: Joi.string().min(8).required(),
    }),
    passwordUpdate: Joi.object({
        email: Joi.string().trim().email().required(),
        newPassword:Joi.string().min(8).required(),
    }),
    profileUpdate:Joi.object({
        firstName: Joi.string().max(255).required(),
        lastName: Joi.string().max(255).required(),
        email: Joi.string().required().email(),
        photo: Joi.string().allow(null, '').default(null)
    }),
    profileUpdatePrivacy:Joi.object({
        privacy: Joi.boolean().required(),
    }),
    profileUpdateNumber:Joi.object({
        number: Joi.string().required(),
    }),
    updatePassword: Joi.object({
        newPassword: Joi.string().required().trim().min(8),
        confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().label('confirmPassword')
            .messages({ 'any.only': '{{#label}} does not match the new password' })
    }),
}
