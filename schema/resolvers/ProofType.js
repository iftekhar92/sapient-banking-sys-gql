const { proofType } = require("../../libs");

module.exports = {
  Mutation: {
    createProofType: (_, args) =>
      new Promise((resolve) =>
        proofType
          .create(args.input)
          .then((response) => resolve(response))
      ),
    updateProofType: (_, args, context) =>
      new Promise((resolve) =>
        proofType
          .update(args.input, context)
          .then((response) => resolve(response))
      ),
    removeProofType: (_, args, context) =>
      new Promise((resolve) =>
        proofType
          .removedById(args?.input?._id, context)
          .then((response) => resolve(response))
      ),
  },
  Query: {
    proofTypeList: (_, args, context) =>
      new Promise((resolve) =>
        proofType
          .list(args?.input, context)
          .then((response) => resolve(response))
      ),
    findProofTypeById: (_, args, context) =>
      new Promise((resolve) =>
        proofType
          .findById(args?.input?._id, context)
          .then((response) => resolve(response))
      ),
    findAllProofTypes: (_, args) =>
      new Promise((resolve) =>
        proofType
          .findAll(args?.input?.status || '')
          .then((response) => resolve(response))
      ),
  },
};
