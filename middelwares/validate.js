import _ from "lodash";
import HttpError from "http-errors";

export default function validate(schema, path = 'body') {
  return async function (req, res, next) {
    try {
      const data = await schema.validateAsync(req[path], {
        abortEarly: false,
        dateFormat: 'iso',
      });
      req[path] = data;

      next();
    } catch (e) {
      const errors = {};
      e.details.forEach(d => {
        const textRemove = d.message.replace(`"${d.path}"`,'')
        _.set(errors, d.path, textRemove)
      });
      next(HttpError(422, { errors }));
    }
  }
}
