export function successResponse(
  res,
  data = null,
  message = "Success",
  status = 200,
  meta = null
) {
  const payload = {
    success: true,
    message,
    data,
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(status).json(payload);
}

export function createdResponse(
  res,
  data = null,
  message = "Created",
  meta = null
) {
  return successResponse(res, data, message, 201, meta);
}

export function errorResponse(
  res,
  message = "Error",
  status = 500,
  errors = null,
  code = null
) {
  const payload = {
    success: false,
    message,
    errors,
  };

  if (code) {
    payload.code = code;
  }

  return res.status(status).json(payload);
}