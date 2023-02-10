const { account } = require("../../libs");

module.exports = {
  Mutation: {
    openAccount: (_, args, context) =>
      new Promise((resolve) =>
        account
          .openAccount(args?.input, context)
          .then((response) => resolve(response))
      ),
    makeTransaction: (_, args, context) =>
      new Promise((resolve) =>
        account
          .makeTransaction(args?.input, context)
          .then((response) => resolve(response))
      ),
    removeSavingsAccount: (_, args, context) =>
      new Promise((resolve) =>
        account
          .removeSavingsAccount(args?.input?._id, context)
          .then((response) => resolve(response))
      ),
    removeAccountAndPaymentHistory: (_, __, context) =>
      new Promise((resolve) =>
        account
          .removeAccountAndPaymentHistory(context)
          .then((response) => resolve(response))
      ),
    fakeTransaction: (_, args, context) =>
      new Promise((resolve) =>
        account
          .fakeTransaction(args?.input, context)
          .then((response) => resolve(response))
      ),
  },
  Query: {
    savingsAccount: (_, args, context) =>
      new Promise((resolve) =>
        account
          .savingsAccount(args?.input, context)
          .then((response) => resolve(response))
      ),
    creditCardsAccount: (_, args, context) =>
      new Promise((resolve) =>
        account
          .creditCardsAccount(args?.input, context)
          .then((response) => resolve(response))
      ),
    fetchAccountDetails: (_, __, context) =>
      new Promise((resolve) =>
        account
          .fetchAccountDetails(context)
          .then((response) => resolve(response))
      ),
    transactionHistory: (_, args, context) =>
      new Promise((resolve) =>
        account
          .transactionHistory(args?.input, context)
          .then((response) => resolve(response))
      )
  },
};
