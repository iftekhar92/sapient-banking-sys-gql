const  Database = require('../db');

module.exports.connect = (dbURI = '') => {
  Database.connect(dbURI || process.env.DB_CONNECTION);
};
