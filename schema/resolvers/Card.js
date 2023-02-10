const { card } = require("../../libs");

module.exports = {
  Mutation: {
    createCard: (_, args, context) =>
      new Promise((resolve) =>
        card.create(args.input, context).then((response) => resolve(response))
      ),
    updateCard: (_, args, context) =>
      new Promise((resolve) =>
        card.update(args.input, context).then((response) => resolve(response))
      ),
    removeCard: (_, args, context) =>
      new Promise((resolve) =>
        card
          .removedById(args?.input?._id, context)
          .then((response) => resolve(response))
      ),
  },
  Query: {
    cardList: (_, args) =>
      new Promise((resolve) =>
        card.list(args?.input).then((response) => resolve(response))
      ),
    findCardById: (_, args) =>
      new Promise((resolve) =>
        card.findById(args?.input?._id).then((response) => resolve(response))
      ),
      findAvailableCards: (_, args, context) =>
      new Promise((resolve) =>
        card.availableCards(args?.input?.status || '', context).then((response) => resolve(response))
      ),
  },
};
