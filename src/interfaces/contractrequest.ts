import { Request } from "express";
import { Contract } from "fabric-network";

/**
 * This interface adds a Contract object to the standard ExpressJS request
 */
export default interface ContractRequest extends Request {
  contract: Contract;
}
