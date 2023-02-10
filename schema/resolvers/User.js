const { user } = require("../../libs");

module.exports = {
  Mutation: {
    dummyUser: (_, args) =>
      new Promise((resolve) =>
        user.dummyUser(args?.input).then((response) => resolve(response))
      ),
    signup: (_, args) =>
      new Promise((resolve) =>
        user.signup(args?.input).then((response) => resolve(response))
      ),
    setPassword: (_, args) =>
      new Promise((resolve) =>
        user.setPassword(args?.input).then((response) => resolve(response))
      ),
    changePassword: (_, args, context) =>
      new Promise((resolve) =>
        user
          .changePassword(args?.input, context)
          .then((response) => resolve(response))
      ),
      updateProfile: (_, args, context) =>
      new Promise((resolve) =>
        user
          .updateProfile(args?.input, context)
          .then((response) => resolve(response))
      ),
  },
  Query: {
    getTokenToSetPassword: (_, args) =>
      new Promise((resolve) =>
        user
          .getTokenToSetPassword(args?.input)
          .then((response) => resolve(response))
      ),
    login: (_, args) =>
      new Promise((resolve) =>
        user.login(args?.input).then((response) => resolve(response))
      ),
      findDetail: (_, __, context) =>
      new Promise((resolve) =>
        user.findDetail(context).then((response) => resolve(response))
      ),
  },
};
