const ApiError = require('../utils/ApiError');

/**
 * Validate request body/query/params against a Joi schema
 * @param {object} schema - Joi schema object with optional body, query, params keys
 */
const validate = (schema) => {
  return (req, res, next) => {
    const validationErrors = [];

    ['body', 'query', 'params'].forEach((key) => {
      if (schema[key]) {
        const { error, value } = schema[key].validate(req[key], {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error) {
          const errors = error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, ''),
          }));
          validationErrors.push(...errors);
        } else {
          req[key] = value; // Replace with sanitized values
        }
      }
    });

    if (validationErrors.length > 0) {
      return next(ApiError.badRequest('Validation failed', validationErrors));
    }

    next();
  };
};

module.exports = validate;
