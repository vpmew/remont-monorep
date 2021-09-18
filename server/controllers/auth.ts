import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import axios from "axios";

import type { Response, Request } from "express";

import mysqlConnection from "mysql/connection";
import {
  getUserData,
  addRefreshToken,
  deleteRefreshToken,
  getRefreshToken,
  createSocialNetworkUser,
  getSocialNetworkUserData,
} from "mysql/queries";

import { generateTokens } from "utils/generateTokens";
import { NotFoundError, errorHandler } from "utils/errors";
import getDateString from "utils/getDateString";
import { isRowDataPacket } from "utils/typeGuards";

const { JWT_KEY, JWT_LIFETIME, REFRESH_TOKEN_LIFETIME } = process.env;

export async function login(req: Request, res: Response) {
  try {
    if (!(JWT_KEY && JWT_LIFETIME && REFRESH_TOKEN_LIFETIME)) {
      throw new Error("[Login]: Env. variables haven't been loaded.");
    }
    const { email: inputEmail, password: inputPass } = req.body;
    const [DBQueryResult] = await mysqlConnection.query(
      getUserData(inputEmail)
    );
    if (!isRowDataPacket(DBQueryResult)) {
      throw new Error("[Login]: Unexpected DB response.");
    }
    if (DBQueryResult.length === 0) {
      throw new NotFoundError("[Login]: Wrong email or pass.");
    }
    const { pass, email, credentials, ...other } = DBQueryResult[0];
    const match = await bcrypt.compare(inputPass, pass);
    if (!match) {
      throw new NotFoundError("[Login]: Wrong email or pass.");
    }
    const dateOfCreating = getDateString();
    const { accessToken, refreshToken } = generateTokens(
      {
        userId: email,
        network: false,
        credentials,
      },
      JWT_KEY,
      parseInt(JWT_LIFETIME, 10)
    );
    await mysqlConnection.query(
      addRefreshToken(refreshToken, email, dateOfCreating)
    );
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: parseInt(REFRESH_TOKEN_LIFETIME, 10) * 1000,
      })
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "lax",
      })
      .status(200)
      .json({ userId: email, credentials, network: false, email, ...other });
  } catch (error) {
    errorHandler(error as Error, res);
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie("accessToken").clearCookie("refreshToken").sendStatus(200);
  try {
    const { refreshToken, accessToken } = req.cookies;
    if (!(refreshToken && accessToken)) {
      throw new Error("[Logout]: Failed to get refresh or access token.");
    }
    const decoded = jwt.decode(accessToken);
    if (!decoded || typeof decoded === "string") {
      throw new Error("[Logout]: Unexpected jwt payload.");
    }
    const { userId } = decoded;
    const [DBQueryResult] = await mysqlConnection.query(
      getRefreshToken(refreshToken)
    );
    if (!isRowDataPacket(DBQueryResult)) {
      throw new Error("[Logout]: Unexpected DB response.");
    }
    if (DBQueryResult.length === 0) {
      throw new Error("[Logout]: Refresh token haven't found.");
    }
    if (DBQueryResult[0].userId !== userId) {
      throw new Error("[Logout]: Refresh token's user doesn't match.");
    }
    await mysqlConnection.query(deleteRefreshToken(refreshToken));
  } catch (error) {
    errorHandler(error as Error, res);
  }
}

export function viaSocialNetwork(req: Request, res: Response) {
  try {
    const hash = req.body.hash;
    const matches = /authVia.+?(&|$)/i.exec(hash);
    if (!matches) {
      throw new Error(
        "[Login via social network]: Invalid auth fragment in URI."
      );
    }
    const network = matches[0]
      .replace(/authVia/i, "")
      .replace(/&/, "")
      .toLowerCase();
    switch (network) {
      case "vk":
        vk(hash, res);
        break;
      default:
        throw new NotFoundError(
          "[Login via social network]: Couldn't recognize a social network."
        );
    }
  } catch (error) {
    errorHandler(error as Error, res);
  }
}

async function vk(hash: string, res: Response) {
  try {
    if (!(JWT_KEY && JWT_LIFETIME && REFRESH_TOKEN_LIFETIME)) {
      throw new Error("[VK]: Env. variables haven't been loaded.");
    }
    const matches = /&user_id=.+?(&|$)/.exec(hash);
    if (!matches) {
      throw new Error("[VK]: Couldn't recognize user.");
    }
    const userId = matches[0].replace(/&user_id=/, "").replace(/&/, "");
    let userData;
    let [DBQueryResult] = await mysqlConnection.query(
      getSocialNetworkUserData(userId)
    );
    if (!isRowDataPacket(DBQueryResult)) {
      throw new Error("[VK]: Unexpected DB response.");
    }
    if (DBQueryResult.length === 0) {
      userData = await createVkUser(hash);
      await mysqlConnection.query(createSocialNetworkUser(userData));
    } else {
      userData = DBQueryResult[0];
    }
    const dateOfCreating = getDateString();
    const { accessToken, refreshToken } = generateTokens(
      {
        userId,
        network: true,
        credentials: userData.credentials,
      },
      JWT_KEY,
      parseInt(JWT_LIFETIME, 10)
    );
    await mysqlConnection.query(
      addRefreshToken(refreshToken, userId, dateOfCreating)
    );
    res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: parseInt(REFRESH_TOKEN_LIFETIME, 10) * 1000,
      })
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "lax",
      })
      .json(userData);
  } catch (error) {
    errorHandler(error as Error, res);
  }
}

async function createVkUser(hash: string) {
  try {
    const network = "vk";

    const userIdMatches = /&user_id=.+?(&|$)/.exec(hash);
    if (!userIdMatches) {
      throw new Error("[Creating VK user]: couldn't get user's id.");
    }
    const userId = userIdMatches[0].replace(/&user_id=/, "").replace(/&/, "");

    const vkAccessTokenMatches = /access_token=.+?(&|$)/.exec(hash);
    if (!vkAccessTokenMatches) {
      throw new Error("[Creating VK user]: couldn't get VK access token.");
    }
    const vkAccessToken = vkAccessTokenMatches[0]
      .replace(/access_token=/, "")
      .replace(/&/, "");

    const emailMatches = /&email=.+?(&|$)/.exec(hash);
    const email = emailMatches
      ? emailMatches[0].replace(/&email=/, "").replace(/&/, "")
      : emailMatches;

    const {
      data: {
        response: [user],
      },
    } = await axios.get(
      `https://api.vk.com/method/users.get?user_ids=${userId}&fields=photo_200&access_token=${vkAccessToken}&v=5.130`
    );
    if (!user) {
      throw new Error("[Creating VK user]: couldn't get user data from VK.");
    }

    const avatar = user.photo_200;
    const userName = user.first_name + " " + user.last_name;
    const phone = null;
    const credentials = 1;
    const regDate = getDateString();

    const newUser = {
      userId,
      userName,
      email,
      phone,
      credentials,
      avatar,
      regDate,
      network,
    };

    return newUser;
  } catch (error) {
    errorHandler(error as Error);
  }
}
