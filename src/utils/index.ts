import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "~/utils/db";

export const checkEmailorUsername = async (identifier: string) => {
  if (/\S+@\S+\.\S+/.test(identifier)) {
    // Identifier is an email
    return await db.user.findUnique({
      where: {
        email: identifier,
      },
    });
  } else {
    // Identifier is a username
    return await db.user.findUnique({
      where: {
        username: identifier,
      },
    });
  }
};

export const createJwtToken = (
  payload: object,
  secret: string,
  expiresIn: string
) => {
  return jwt.sign(payload, secret, {
    expiresIn,
    notBefore: "-1m",
  }); // nbf -1 minute to allow for time skew
};

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
) => {
  return await bcrypt.compare(password, hashedPassword);
};
