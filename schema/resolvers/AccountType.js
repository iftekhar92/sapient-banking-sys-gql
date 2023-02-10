const { accountType } = require("../../libs");

module.exports = {
  Mutation: {
    createAccountType: (_, args, context) =>
      new Promise((resolve) =>
        accountType
          .create(args.input, context)
          .then((response) => resolve(response))
      ),
      updateAccountType: (_, args, context) =>
      new Promise((resolve) =>
        accountType
          .update(args.input, context)
          .then((response) => resolve(response))
      ),
      removeAccountType: (_, args, context) =>
      new Promise((resolve) =>
        accountType
          .removedById(args?.input?._id, context)
          .then((response) => resolve(response))
      ),
  },
  Query: {
    accountTypeList: (_, args, context) =>
      new Promise((resolve) =>
        accountType
          .list(args?.input, context)
          .then((response) => resolve(response))
      ),
      findAccountTypeById: (_, args, context) =>
      new Promise((resolve) =>
        accountType
          .findById(args?.input?._id, context)
          .then((response) => resolve(response))
      ),
      findAllAccounts: (_, args, context) =>
      new Promise((resolve) =>
        accountType.findAll(args?.input?.status || '', context).then((response) => resolve(response))
      ),
  },
};
