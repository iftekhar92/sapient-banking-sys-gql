const { mergeTypeDefs } = require("@graphql-tools/merge");

const Common = require("./Common");
const AccountType = require("./AccountType");
const Authentication = require("./Authentication");
const CardType = require("./CardType");
const Card = require("./Card");
const SavingsAccount = require("./SavingsAccount");
const Income = require("./Income");
const account = require("./Account");
const ProofType = require("./ProofType");
const User = require("./User");
const Dashboard = require("./Dashboard");

const types = [
  Common,
  account,
  AccountType,
  Authentication,
  CardType,
  Card,
  SavingsAccount,
  Income,
  ProofType,
  User,
  Dashboard
];

module.exports = mergeTypeDefs(types);
