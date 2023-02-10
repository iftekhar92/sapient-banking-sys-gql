const { mergeResolvers } = require("@graphql-tools/merge");

const account = require("./Account");
const accountType = require("./AccountType");
const authentication = require("./Authentication");
const card = require("./Card");
const cardType = require("./CardType");
const savingsAccount = require("./SavingsAccount");
const income = require("./Income");
const proofType = require("./ProofType");
const user = require("./User");
const dashboard = require("./Dashboard");

const resolvers = [
  account,
  accountType,
  authentication,
  card,
  cardType,
  savingsAccount,
  income,
  proofType,
  user,
  dashboard
];

module.exports = mergeResolvers(resolvers);
