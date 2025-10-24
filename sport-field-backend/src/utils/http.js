
export const ok = (res, data = {}, meta = {}) => res.json({ data, meta });
export const created = (res, data = {}) => res.status(201).json({ data });
export const badRequest = (res, message = 'Bad Request') => res.status(400).json({ message });
