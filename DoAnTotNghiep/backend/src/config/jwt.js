import jwt from "jsonwebtoken";
import { env } from "./env.js";

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;

export function signAccessToken(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    ...options,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function decodeToken(token) {
  return jwt.decode(token);
}

export const jwtConfig = {
  secret: JWT_SECRET,
  expiresIn: JWT_EXPIRES_IN,
};