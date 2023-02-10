const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const { ApolloServer } = require("apollo-server-express");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require("apollo-server-core");

require("./models").connect();
const schema = require("./schema");
const { tokenValidator, tokenExtract } = require("./libs/encryption");

const prodObj = {};
if (process.env.NODE_ENV !== "development") {
  prodObj.introspection = true;
}
let endpoint = "/graphql";
if (process.env.NODE_ENV === "stage") {
  endpoint = "/banking-sys/graphql";
}

const app = express();
app.use(cors());
const apolloSetup = new ApolloServer({
  ...prodObj,
  schema,
  context: async ({ req }) => {
    const token = req.headers.authorization || "";
    let user = null;
    if (token) {
      const { status } = tokenValidator(token);
      if (status) {
        const { response } = await tokenExtract(token);
        user = response;
      }
    }
    return { user };
  },
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground({
      settings: {
        "editor.theme": "dark", // light
      },
      tabs: [
        {
          endpoint,
        },
      ],
    }),
  ],
});
app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use("/images", express.static(path.join(__dirname, "public/images")));
(async () => {
  await apolloSetup.start();
  apolloSetup.applyMiddleware({ app });
  app.listen(process.env.PORT, process.env.HOST, () =>
    console.log(
      `🚀 Server ready at http://${process.env.HOST}:${process.env.PORT}/${endpoint}`
    )
  );
})();
