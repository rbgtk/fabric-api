import dotenv from "dotenv";
import express from "express";
import router from "./router";

dotenv.config();

async function main(): Promise<void> {
  // Build application
  const app: express.Application = express();

  // Basic configuration
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Run application on port 3000
  app.listen(parseInt(process.env.PORT), process.env.HOST, (): void => {
    console.log(
      `**** INFO: server is listening on port ${process.env.HOST}:${process.env.PORT}`
    );
  });

  // Handle requests
  app.use(router);
}

main().catch(console.error);
