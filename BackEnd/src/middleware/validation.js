const Joi = require('joi');
const { errorResponse } = require('../utils/responses');

const contentSchema = Joi.object({
  platform: Joi.string().required(),
  title: Joi.string().min(1).max(200).required(),
  selfDeclaredGenre: Joi.string().allow(''),
  assignedGenre: Joi.string().valid('Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Documentary', 'Animation', 'Crime', 'Other'),
  primaryLanguage: Joi.string().required(),
  selfDeclaredFormat: Joi.string().allow(''),
  assignedFormat: Joi.string().valid('Movie', 'TV Series', 'Documentary', 'Mini Series', 'Web Series', 'Stand-up Comedy', 'Series', 'Other'),
  year: Joi.number().min(1900).max(2030).required(),
  releaseDate: Joi.date().allow(''),
  seasons: Joi.number().min(0).default(1),
  episodes: Joi.number().min(0).allow(''),
  durationHours: Joi.number().min(0).allow(''),
  source: Joi.string().valid('In-House', 'Commissioned', 'Co-Production', 'NA', 'TBD').default('TBD'),
  dubbing: Joi.object({
    tamil: Joi.boolean().default(false),
    telugu: Joi.boolean().default(false),
    kannada: Joi.boolean().default(false),
    malayalam: Joi.boolean().default(false),
    hindi: Joi.boolean().default(false),
    punjabi: Joi.boolean().default(false),
    bengali: Joi.boolean().default(false),
    marathi: Joi.boolean().default(false),
    bhojpuri: Joi.boolean().default(false),
    gujarati: Joi.boolean().default(false),
    english: Joi.boolean().default(false),
    haryanvi: Joi.boolean().default(false),
    rajasthani: Joi.boolean().default(false),
    deccani: Joi.boolean().default(false),
    arabic: Joi.boolean().default(false)
  }).default({}),
  ageRating: Joi.string().valid('U', 'U/A 7+', 'U/A 13+', 'U/A 16+', 'A', 'NA','Not Rated').default('Not Rated')
});

const userRegistrationSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'admin').default('user')
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const validateContent = (req, res, next) => {
  const { error, value } = contentSchema.validate(req.body, { allowUnknown: true });
  
  if (error) {
    return errorResponse(res, 'Validation error', error.details, 400);
  }
  
  req.body = value;
  next();
};

const validateUserRegistration = (req, res, next) => {
  const { error, value } = userRegistrationSchema.validate(req.body);
  
  if (error) {
    return errorResponse(res, 'Validation error', error.details, 400);
  }
  
  req.body = value;
  next();
};

const validateUserLogin = (req, res, next) => {
  const { error, value } = userLoginSchema.validate(req.body);
  
  if (error) {
    return errorResponse(res, 'Validation error', error.details, 400);
  }
  
  req.body = value;
  next();
};

module.exports = { 
  validateContent, 
  validateUserRegistration, 
  validateUserLogin 
};
