const { error } = require('../utils/response');

const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
      const parsed = await schema.parseAsync(data);
      if (source === 'body') req.body = parsed;
      if (source === 'query') req.query = parsed;
      if (source === 'params') req.params = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return error(res, 'Validation failed', 400, formattedErrors);
      }
      return error(res, 'Invalid request data', 400, err.message);
    }
  };
};

module.exports = validate;
