import { Response, Router } from "express";
import auth from "./util/auth";
import Request from "./interfaces/contractrequest";

// Router object
const router = Router();

// Handle authentication
router.post("/auth/login", auth.login);
router.use("/assets", auth.verifyToken);

/**
 * Create or update an asset
 */
router.post(
  "/assets/:type/:id",
  async (request: Request, response: Response) => {
    await request.contract
      .submitTransaction(
        "writeAsset",
        request.params.type,
        request.params.id,
        JSON.stringify(request.body)
      )
      .then((result) => response.json(JSON.parse(result.toString())))
      .catch((error) => response.status(500).json(error));
  }
);

/**
 * Get a specific asset
 */
router.get(
  "/assets/:type/:id",
  async (request: Request, response: Response) => {
    await request.contract
      .evaluateTransaction("getAsset", request.params.type, request.params.id)
      .then((result) => response.json(JSON.parse(result.toString())))
      .catch((error) => response.status(500).json(error));
  }
);

/**
 * Get the history from a specific asset
 */
router.get(
  "/assets/:type/:id/history",
  async (request: Request, response: Response) => {
    await request.contract
      .evaluateTransaction(
        "getAssetHistory",
        request.params.type,
        request.params.id
      )
      .then((result) => response.json(JSON.parse(result.toString())))
      .catch((error) => response.status(500).json(error));
  }
);

/**
 * Queries all assets with a couchDB query object
 */
router.get("/assets", async (request: Request, response: Response) => {
  await request.contract
    .evaluateTransaction("queryAssets", JSON.stringify(request.body))
    .then((result) => response.json(JSON.parse(result.toString())))
    .catch((error) => response.status(500).json(error));
});

export default router;
