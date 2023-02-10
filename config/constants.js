module.exports = {
  gmail: {
    SERVICE_NAME: "gmail",
    SERVICE_HOST: "smtp.google.com",
    SERVICE_SECURE: false,
    SERVICE_PORT: 587,
    USER_NAME: "allservices0025@gmail.com",
    USER_PASSWORD: "hhdelftnjchlgosh",
  },
  // Email Configuration
  FROM: "Banking System <allservices0025@gmail.com>",
  SET_PASSWORD_SUBJECT:
    "Your account has been created successfully. Now, set your password.",
  SITE_URL: "http://localhost:4000/",
  COMPANY: "Banking System",
  // File upload convention
  filenameConvention: {
    length: 4,
    charset: "alphabetic",
    capitalization: "lowercase",
  },
  CREDIT_CARD: "Credit Card",
  DEBIT_CARD: "Debit Card",
  SAVINGS: "Savings",
  DEPOSIT: "Deposit",
  WITHDRAWAL: "Withdrawal",
  account: {
    accountNumberlength: 8,
    cardNumFormat: "63[7-9]#-####-####-###L",
    amountLowerBound: 10000,
    amountUpperBound: 20000,
    txnId: {
      length: 10,
      charset: "alphanumeric",
      capitalization: "lowercase",
    },
  },
};
