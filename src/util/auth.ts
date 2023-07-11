/**
 * Copyright Howest University College of Applied Computer Sciences
 *
 * Author: Robby Goetinck
 * Date: 2023/01/23
 *
 */

import { connect, enrollUser } from "./fabric";
import { Request, Response } from "express";

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import ContractRequest from "../interfaces/contractrequest";

dotenv.config();

function generateAccessToken(msp: string, username: string): string {
  return jwt.sign({ msp, username }, process.env.TOKEN_SECRET, {
    expiresIn: "1h",
  });
}

export default {
  /**
   * Authenticate user and their TLS credentials, enroll them and return a JWT
   * @param request HTTP request object
   * @param response HTTP response object
   */
  async login(request: Request, response: Response): Promise<void> {
    // User credentials need to be present
    if (!request.body.username || !request.body.password) {
      response.sendStatus(500);
    }

    // TLS credentials need to be present
    if (!request.body.tlsUsername || !request.body.tlsPassword) {
      response.sendStatus(500);
    }

    // Need an MSP to authenticate with
    if (!request.body.msp) {
      response.sendStatus(500);
    }

    try {
      await enrollUser(
        request.body.msp,
        request.body.username,
        request.body.password
      );

      await enrollUser(
        request.body.msp,
        request.body.tlsUsername,
        request.body.tlsPassword
      );

      const token = generateAccessToken(
        request.body.msp,
        request.body.username
      );

      response.json({ token: token });
    } catch (error) {
      console.error(`Error: ${error}`);
      response.sendStatus(401);
    }
  },

  verifyToken(
    request: ContractRequest,
    response: Response,
    next: CallableFunction
  ): Response | void {
    const authHeader = request.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) return response.sendStatus(401);

    jwt.verify(
      token,
      process.env.TOKEN_SECRET,
      async (error: any, options: any) => {
        if (error) return response.sendStatus(403);

        console.log(
          `**** INFO: using credentials for ${JSON.stringify(options)}`
        );

        const gateway = await connect(options.msp, options.username);
        const channel = await gateway.getNetwork(process.env.CHANNEL);
        request.contract = channel.getContract(process.env.CHAINCODE);

        next();
      }
    );
  },
};
