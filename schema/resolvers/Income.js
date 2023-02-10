const { income } = require("../../libs");

module.exports = {
  Mutation: {
    createIncome: (_, args, context) =>
      new Promise((resolve) =>
        income.create(args.input, context).then((response) => resolve(response))
      ),
    updateIncome: (_, args, context) =>
      new Promise((resolve) =>
        income.update(args.input, context).then((response) => resolve(response))
      ),
    removeIncome: (_, args, context) =>
      new Promise((resolve) =>
        income
          .removedById(args?.input?._id, context)
          .then((response) => resolve(response))
      ),
  },
  Query: {
    incomeList: (_, args, context) =>
      new Promise((resolve) =>
        income.list(args?.input, context).then((response) => resolve(response))
      ),
    findIncomeById: (_, args, context) =>
      new Promise((resolve) =>
        income
          .findById(args?.input?._id, context)
          .then((response) => resolve(response))
      ),
    findAllIncomes: (_, args) =>
      new Promise((resolve) =>
        income.findAll(args?.input?.status || '').then((response) => resolve(response))
      ),
  },
};
