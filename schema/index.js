const { makeExecutableSchema } = require("@graphql-tools/schema");
const resolvers = require("./resolvers");
const typeDefs = require("./types");

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers,
});
