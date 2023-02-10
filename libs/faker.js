const { faker } = require("@faker-js/faker");
const config = require("../config/constants");

module.exports = {
  accountNumber(length = config.account.accountNumberlength) {
    return faker.finance.account(length);
  },
  amount(
    min = config.account.amountLowerBound,
    max = config.account.amountUpperBound
  ) {
    return faker.finance.amount(min, max);
  },
  cardNumber(format = config.account.cardNumFormat) {
    return faker.finance.creditCardNumber(format);
  },
  cvvNumber() {
    return faker.finance.creditCardCVV();
  },
  getRandTxnType() {
    return [config.DEPOSIT, config.WITHDRAWAL][Math.floor(Math.random() * 2)];
  },
  text(max = 5) {
    return faker.lorem.text().substring(0, max);
  },
  numeric(length, options = { allowLeadingZeros: false }) {
    return faker.random.numeric(length, options);
  },
  dateBetween(start, end) {
    return faker.date.betweens(start, end);
  },
};
