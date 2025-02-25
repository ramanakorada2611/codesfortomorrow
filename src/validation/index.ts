import Joi from 'joi';

export const validateLogin = (req:any, res:any, next:any) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ status:'fail',statusCode:400,message: error.details[0].message,error:error });
  }
  next();
};

export const validateSignUp = (req: any, res: any, next: any) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      confirmPassword: Joi.ref('password'),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ status:'fail',statusCode:400,message: error.details[0].message,error:error });
    }
    next();
  };
