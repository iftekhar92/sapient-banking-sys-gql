const { dashboard } = require("../../libs");

module.exports = {
  Query: {
    accountSummary: (_, __, context) =>
      new Promise((resolve) =>
        dashboard.accountSummary(context).then((response) => resolve(response))
      ),
  },
};
