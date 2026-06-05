import { createServer } from "./utils/createServer.js";
import { env } from "./utils/env.js";

const app = createServer();

app.listen(env.port, () => {
  console.log(`Weatherboy API listening on http://127.0.0.1:${env.port}`);
});
