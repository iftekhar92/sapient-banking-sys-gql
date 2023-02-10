const mongoose = require("mongoose");

class Database {
  connection = mongoose.connection;

  constructor() {
    try {
      this.connection
        .on("open", () => {
          console.info.bind(console, "Database connection: open");
          require("./models/AccountType");
          require("./models/Card");
          require("./models/CardType");
          require("./models/SavingsAccount");
          require("./models/Income");
          require("./models/ProofType");
          require("./models/User");
        })
        .on("close", console.info.bind(console, "Database connection: close"))
        .on(
          "disconnected",
          console.info.bind(console, "Database connection: disconnecting")
        )
        .on(
          "reconnected",
          console.info.bind(console, "Database connection: reconnected")
        )
        .on(
          "fullsetup",
          console.info.bind(console, "Database connection: fullsetup")
        )
        .on("all", console.info.bind(console, "Database connection: all"))
        .on("error", console.error.bind(console, "MongoDB connection: error:"));
    } catch (error) {
      console.error(error);
    }
  }

  connect(uri) {
    mongoose.connect(uri);
  }

  close() {
    try {
      this.connection.close();
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = new Database();
