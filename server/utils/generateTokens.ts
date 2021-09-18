import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";

export function generateTokens(
  payload: object,
  secret: string,
  lifetime: number
) {
  const accessToken: string = jwt.sign(payload, secret, {
    expiresIn: lifetime,
  });
  const refreshToken: string = uuid();
  return { accessToken, refreshToken };
}
