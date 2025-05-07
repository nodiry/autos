// ./config/config.ts
const environment =
  (process.env.NODE_ENV as "development" | "test" | "production") ||
  "development";

  const config = {
    development: {
      db: process.env.DB,
      logLevel: "debug",
      morgan: "dev",
      origin: ["http://localhost:5173", "http://localhost:5174"], // dev + admin dev
    },
    test: {
      db: "mongodb://localhost/test_db",
      logLevel: "warn",
      morgan: "combined",
      origin: ["http://localhost:5173", "http://localhost:5174"],
    },
    production: {
      db: process.env.DB,
      logLevel: "error",
      morgan: "tiny",
      origin: ["https://study.glasscube.io", "https://admin.glasscube.io"],
    },
  };
  

export default config[environment];
