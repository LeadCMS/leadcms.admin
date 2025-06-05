import { generateApi } from "swagger-typescript-api";
import path from "path";
import fs from "fs";
import { Command } from "commander";

const program = new Command();
program
  .name("generate-api")
  .description("Generate TypeScript API client from Swagger JSON")
  .argument("[baseUrl]", "Base API URL (e.g. http://localhost:45437)")
  .option(
    "-b, --base-url <url>",
    "Base API URL (e.g. http://localhost:45437)"
  );

program.parse(process.argv);

const options = program.opts();
const positionalBaseUrl = program.args[0];
const baseApiUrl = options.baseUrl || positionalBaseUrl || "http://localhost:45437";

async function main() {
  // No need to show help, always have a default
  const apiPath = `${baseApiUrl.replace(/\/$/, "")}/swagger/v1/swagger.json`;

  generateApi({
    url: apiPath,
    output: path.resolve(process.cwd(), "./src/lib/network"),
    fileName: "swagger-client.ts",
    httpClientType: "fetch",
  })
    .then(async () => {
      const res = await fetch(apiPath);
      const swaggerJson = await res.json();
      fs.writeFile(
        "./src/lib/network/swagger.json",
        JSON.stringify(swaggerJson),
        (err) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log("Swagger JSON file has been saved!");
        }
      );
    })
    .catch((err) => {
      console.error("Error generating API:", err);
    });
}

main();
