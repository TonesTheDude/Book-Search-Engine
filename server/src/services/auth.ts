import type { Request} from 'express';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string,
}

export const authenticateToken = ({req}: {req:Request}) => {
  let token = req.body.token || req.query.token || req.headers.authorization;
  if (req.headers.authorization) {
    token = token.split(' ').pop().trim();
  }
  if (!token) {
    return req; // Unauthorized
  }
  

  try {
    const secretKey = process.env.JWT_SECRET_KEY || '';
    console.log(secretKey);
    const data = jwt.verify(token, secretKey, {maxAge: "1hr"}) as JwtPayload ;
        req.user = data;
  } catch (error) {
    console.log(error);
  }
  return req;
};

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};
