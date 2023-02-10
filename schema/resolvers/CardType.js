const { cardType } = require("../../libs");

module.exports = {
  Mutation: {
    createCardType: (_, args, context) =>
      new Promise((resolve) =>
        cardType
          .create(args.input, context)
          .then((response) => resolve(response))
      ),
    updateCardType: (_, args, context) =>
      new Promise((resolve) =>
        cardType
          .update(args.input, context)
          .then((response) => resolve(response))
      ),
    removeCardType: (_, args, context) =>
      new Promise((resolve) =>
        cardType
          .removedById(args?.input?._id, context)
          .then((response) => resolve(response))
      ),
  },
  Query: {
    cardTypeList: (_, args, context) =>
      new Promise((resolve) =>
        cardType
          .list(args?.input, context)
          .then((response) => resolve(response))
      ),
    findCardTypeById: (_, args, context) =>
      new Promise((resolve) =>
        cardType
          .findById(args?.input?._id, context)
          .then((response) => resolve(response))
      ),
    findAllCardTypes: (_, args, context) =>
      new Promise((resolve) =>
        cardType.findAll(args?.input?.status || '', context).then((response) => resolve(response))
      ),
  },
};
