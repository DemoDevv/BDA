import fs from "node:fs";
import path from "node:path";

const config = {
  ENV: Bun.env.ENV,
  TOKEN: Bun.env.TOKEN,
  CLIENT_ID: Bun.env.CLIENT_ID,
  ID_CHANNEL_SCHEDULE: Bun.env.ID_CHANNEL_SCHEDULE,
  CHROME_BIN: Bun.env.CHROME_BIN,
  save: async () => {
    fs.writeFileSync(
      path.resolve("./.env"),
      Object.entries(config)
        .filter(([key]) => key !== "save")
        .map(([key, value]) => `${key}=${value}`)
        .join("\n"),
    );
  },
};

export default config;
