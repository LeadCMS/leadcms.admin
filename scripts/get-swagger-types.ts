import { generateApi } from "swagger-typescript-api";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const apiPath = process.env.CORE_API_SWAGGER;
if (!apiPath) throw new Error("CORE_API_SWAGGER env isn't set");

generateApi({
  url: apiPath,
  output: path.resolve(process.cwd(), "./src/lib/network"),
  name: "swagger-client.ts",
  httpClientType: "fetch",
})
  .then(async () => {
    const res = await fetch(apiPath);
    const swaggerJson = await res.json();
    fs.writeFile("./src/lib/network/swagger.json", JSON.stringify(swaggerJson), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Swagger JSON file has been saved!");
    });
  })
  .catch((err) => {
    console.error("Error generating API:", err);
  });
