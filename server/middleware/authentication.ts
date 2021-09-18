import jwt from "jsonwebtoken";

import type { Request, Response, NextFunction } from "express";
import type { VerifyErrors, JwtPayload } from "jsonwebtoken";

import { errorHandler, AuthenticationError } from "utils/errors";
import { isRowDataPacket } from "utils/typeGuards";
import { generateTokens } from "utils/generateTokens";
import getDateString from "utils/getDateString";

import mysqlConnection from "mysql/connection";
import {
  getRefreshToken,
  addRefreshToken,
  deleteRefreshToken,
} from "mysql/queries";

const { JWT_KEY, JWT_LIFETIME, REFRESH_TOKEN_LIFETIME } = process.env;

function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const { accessToken, refreshToken } = req.cookies;
    if (!(JWT_KEY && JWT_LIFETIME && REFRESH_TOKEN_LIFETIME)) {
      throw new AuthenticationError("Env. variables haven't been loaded.");
    }
    if (!(accessToken && refreshToken)) {
      throw new AuthenticationError("Access or refresh token wasn't provided.");
    }

    jwt.verify(
      accessToken,
      JWT_KEY,
      async function (
        err: VerifyErrors | null,
        decoded: JwtPayload | undefined
      ) {
        if (err) {
          if (err.name === "TokenExpiredError") {
            const [DBQueryResult] = await mysqlConnection.query(
              getRefreshToken(refreshToken)
            );
            if (!isRowDataPacket(DBQueryResult)) {
              throw new AuthenticationError(
                "[Refresh]: Unexpected DB response."
              );
            }
            if (DBQueryResult.length === 0) {
              throw new AuthenticationError(
                "[Refresh]: Invalid refresh token was provided."
              );
            }
            jwt.verify(
              accessToken,
              JWT_KEY,
              { ignoreExpiration: true },
              async function (err, decoded) {
                if (err) {
                  throw new AuthenticationError(
                    "[Refresh]: Verification failed."
                  );
                }
                if (decoded) {
                  const { iat, exp, ...payload } = decoded;
                  const dateOfCreating = getDateString();
                  const {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                  } = generateTokens(
                    payload,
                    JWT_KEY,
                    parseInt(JWT_LIFETIME, 10)
                  );
                  await mysqlConnection.query(
                    addRefreshToken(
                      newRefreshToken,
                      payload.userId,
                      dateOfCreating
                    )
                  );
                  if (DBQueryResult[0].userId === payload.userId) {
                    await mysqlConnection.query(
                      deleteRefreshToken(refreshToken)
                    );
                  }
                  req.user = { ...payload };
                  res
                    .cookie("refreshToken", newRefreshToken, {
                      httpOnly: true,
                      sameSite: "lax",
                      maxAge: parseInt(REFRESH_TOKEN_LIFETIME, 10) * 1000,
                    })
                    .cookie("accessToken", newAccessToken, {
                      httpOnly: true,
                      sameSite: "lax",
                    });
                  return next();
                }
              }
            );
          } else {
            throw new AuthenticationError("Failed to verify access token.");
          }
        }
        if (decoded) {
          const { userId, network, credentials } = decoded;
          req.user = { userId, network, credentials };
          return next();
        }
      }
    );
  } catch (error) {
    errorHandler(error as Error, res);
  }
}

export default authenticate;
