import { ValidationError } from "../errors/index.js";

function runValidator(validator, value, sourceName) {
  try {
    return validator(value);
  } catch (error) {
    if (error instanceof Error) {
      throw new ValidationError(error.message, {
        source: sourceName,
      });
    }

    throw new ValidationError("Dữ liệu không hợp lệ", {
      source: sourceName,
    });
  }
}

export function validateBody(validator) {
  return (req, res, next) => {
    try {
      req.validated ??= {};
      req.validated.body = runValidator(validator, req.body, "body");
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateQuery(validator) {
  return (req, res, next) => {
    try {
      req.validated ??= {};
      req.validated.query = runValidator(validator, req.query, "query");
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateParams(validator) {
  return (req, res, next) => {
    try {
      req.validated ??= {};
      req.validated.params = runValidator(validator, req.params, "params");
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateRequest({ body, query, params } = {}) {
  return (req, res, next) => {
    try {
      req.validated ??= {};

      if (body) {
        req.validated.body = runValidator(body, req.body, "body");
      }

      if (query) {
        req.validated.query = runValidator(query, req.query, "query");
      }

      if (params) {
        req.validated.params = runValidator(params, req.params, "params");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}