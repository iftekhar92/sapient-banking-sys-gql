const { savingsAccount } = require("../../libs");

module.exports = {
  Mutation: {
    createSavingsAccount: (_, args, context) =>
      new Promise((resolve) =>
        savingsAccount
          .create(args.input, context)
          .then((response) => resolve(response))
      ),
      updateSavingsAccount: (_, args, context) =>
      new Promise((resolve) =>
        savingsAccount
          .update(args.input, context)
          .then((response) => resolve(response))
      ),
      removeSavingsAccount: (_, args, context) =>
      new Promise((resolve) =>
        savingsAccount
          .removedById(args?.input?._id, context)
          .then((response) => resolve(response))
      ),
  },
  Query: {
    savingsAccountList: (_, args, context) =>
      new Promise((resolve) =>
        savingsAccount
          .list(args?.input, context)
          .then((response) => resolve(response))
      ),
      findSavingsAccountById: (_, args, context) =>
      new Promise((resolve) =>
        savingsAccount
          .findById(args?.input?._id, context)
          .then((response) => resolve(response))
      ),
      findAllSavingsAccount: (_, args) =>
      new Promise((resolve) =>
        savingsAccount.findAll(args?.input?.status || '').then((response) => resolve(response))
      ),
  },
};
