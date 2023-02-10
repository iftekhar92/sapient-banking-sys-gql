const { authentication } = require('../../libs');

module.exports = {
  Query: {
    auth: (_, __, context) => Promise.resolve(authentication.auth(context))
  }
}
