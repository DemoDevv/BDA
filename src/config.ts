const config = {
  TOKEN: Bun.env.TOKEN,
  CLIENT_ID: Bun.env.CLIENT_ID,
};

type Config = typeof config;

export type { config, Config };
