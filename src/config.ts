import fs from "node:fs";
import path from "node:path";

const config = {
  ENV: Bun.env.ENV,
  TOKEN: Bun.env.TOKEN,
  DEV_TOKEN: Bun.env.DEV_TOKEN,
  CLIENT_ID: Bun.env.CLIENT_ID,
  CLIENT_ID_DEV: Bun.env.CLIENT_ID_DEV,
  ID_CHANNEL_SCHEDULE: Bun.env.ID_CHANNEL_SCHEDULE,
  ID_ROLE_FEUILLE: Bun.env.ID_ROLE_FEUILLE,
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
