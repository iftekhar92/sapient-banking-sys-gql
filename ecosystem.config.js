module.exports = {
  apps: [
    {
      name: "bankingSys",
      script: "./server.js",
      env_development: {
        NODE_ENV: "development",
        HOST: "localhost",
        PORT: 4001,
        IMAGE_PATH: "http://localhost:4001/images/",
        // DB_CONNECTION: "mongodb://localhost:27017/devBankingSys",
        DB_CONNECTION: "mongodb+srv://iphtekhar:iphtekhar321@cluster0.qcujyoi.mongodb.net/?retryWrites=true&w=majority",
        SECERET_KEY: "anyrandomstring",
        TOKEN_EXPIRE_IN: "30d",
      },
      env_stage: {
        NODE_ENV: "stage",
        HOST: "localhost",
        PORT: 3700,
        IMAGE_PATH: "http://ak.wpdeals.me/banking-sys/graphql/images/",
        DB_CONNECTION: "mongodb+srv://iphtekhar:iphtekhar321@cluster0.qcujyoi.mongodb.net/?retryWrites=true&w=majority",
        SECERET_KEY: "anyrandomstring",
        TOKEN_EXPIRE_IN: "30d",
      },
      env_production: {
        NODE_ENV: "production",
        HOST: "localhost",
        PORT: 4003,
        IMAGE_PATH: "http://localhost:4003/images/",
        DB_CONNECTION: "mongodb://localhost:27017/prodBankingSys",
        SECERET_KEY: "anyrandomstring",
        TOKEN_EXPIRE_IN: "30d",
      },
    },
  ],
};
