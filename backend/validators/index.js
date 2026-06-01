import Joi from 'joi';
import PasswordValidator from 'password-validator';

// Create a password schema
const passwordSchema = new PasswordValidator();
passwordSchema
  .min(8)
  .has().uppercase()
  .has().lowercase()
  .has().digits()
  .has().symbols();

// Auth Validators
export const registerValidator = Joi.object({
  name: Joi.string().min(2).max(50).required().trim(),
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!passwordSchema.validate(value)) {
        return helpers.error(
          'any.custom',
          'Password must contain: uppercase, lowercase, numbers, and symbols (min 8 chars)'
        );
      }
      return value;
    }),
}).unknown(false);

export const loginValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).unknown(false);

export const emailVerificationValidator = Joi.object({
  token: Joi.string().required(),
}).unknown(false);

// User Validators
export const updateProfileValidator = Joi.object({
  name: Joi.string().min(2).max(50).trim(),
  weight: Joi.number().positive().min(20).max(300),
  height: Joi.number().positive().min(50).max(300),
  bio: Joi.string().max(500).trim(),
}).unknown(false);

export const changePasswordValidator = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!passwordSchema.validate(value)) {
        return helpers.error('any.custom', 'Password does not meet requirements');
      }
      return value;
    }),
  confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')).messages({
    'any.only': 'Passwords must match',
  }),
}).unknown(false);

// Exercise Validators
export const exerciseValidator = Joi.object({
  name: Joi.string().required().trim(),
  muscleGroup: Joi.string().required().trim(),
  equipment: Joi.string().trim(),
  difficulty: Joi.string().valid('Beginner', 'Intermediate', 'Advanced').required(),
  caloriesPer10Min: Joi.number().positive().required(),
  description: Joi.string().max(1000).trim(),
}).unknown(false);

// Package Validators
export const packageValidator = Joi.object({
  name: Joi.string().required().trim(),
  price: Joi.number().positive().required(),
  duration: Joi.string().required().trim(),
  description: Joi.string().max(500).required().trim(),
  exercises: Joi.array().items(Joi.string()).default([]),
}).unknown(false);

// Workout Validators
export const workoutValidator = Joi.object({
  exerciseId: Joi.string().required(),
  duration: Joi.number().positive().required(),
  sets: Joi.number().positive(),
  reps: Joi.number().positive(),
  date: Joi.date().max('now').required(),
}).unknown(false);

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return res.status(400).json({
        message: 'Validation failed',
        errors,
      });
    }

    req.body = value;
    next();
  };
};
