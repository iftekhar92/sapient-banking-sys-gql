const mongoose = require("mongoose");
const moment = require("moment");
const randomstring = require("randomstring");
const asyncLoop = require("node-async-loop");
const diffDate = require("date-fns");

const User = require("../models/User");
const Card = require("../models/Card");
const AccountType = require("../models/AccountType");
const SavingsAccount = require("../models/SavingsAccount");
const auth = require("./authentication");
const joi = require("../validation/account");
const commonFunc = require("./common");
const config = require("../config/constants");
const faker = require("./faker");

module.exports = {
  txnHistory(input) {
    try {
      const {
        txnHistory,
        dateLowerBound,
        dateUpperBound,
        txnType,
        fkId,
        fieldName,
      } = input;
      return txnHistory.reduce((acc, item) => {
        const startDateTime = moment(dateLowerBound).unix();
        const endDateTime = moment(dateUpperBound).unix();
        let paymentAtTime = moment(item.paymentAt).format("YYYY-MM-DD");
        paymentAtTime = moment(paymentAtTime).unix();
        const timeBetween =
          paymentAtTime >= endDateTime && paymentAtTime <= startDateTime;
        if (
          item[fieldName].toString() === fkId.toString() &&
          timeBetween &&
          item.txnType.toLowerCase() === txnType.toLowerCase()
        ) {
          acc.push(parseInt(item.amount, 10));
        }
        return acc;
      }, []);
    } catch (ex) {
      console.error(ex);
      return [];
    }
  },
  getDataset(
    arrData,
    paymentHistory,
    dateUpperBound,
    txnType,
    fieldName,
    isSum
  ) {
    const response = arrData.reduce((acc, item) => {
      const txnHistoryRes = this.txnHistory({
        txnHistory: paymentHistory,
        dateLowerBound: moment(new Date()).format("YYYY-MM-DD"),
        dateUpperBound,
        txnType,
        fkId: item[fieldName].toString(),
        fieldName,
      });
      acc = [...acc, ...txnHistoryRes];
      return acc;
    }, []);
    if (isSum) {
      return response.reduce((acc, item) => {
        acc = parseInt(acc + parseInt(item, 10), 10);
        return acc;
      }, 0);
    } else {
      return response;
    }
  },
  accountSummary(context) {
    return new Promise(async (resolve) => {
      const responseObj = {
        accounts: {},
        profile: {},
        weeklyMonthlyYearly: {},
        txnWeeklyMonthlyYearly: {},
      };
      let lastTxn = [];
      let savingsAccount = "";

      try {
        if (auth.isHuman(context)) {
          const { error, data } = await commonFunc.findByAttribute(
            { _id: mongoose.Types.ObjectId(context.user._id) },
            User
          );
          if (error || !data) {
            return resolve(responseObj);
          } else {
            const { fullName, profilePic, accountInfo, paymentHistory } = data;
            if (accountInfo.length === 0) {
              return resolve(responseObj);
            } else {
              const accountTypeRes = await commonFunc.queryExecutor(
                {
                  match: { name: { $ne: "" } },
                  project: { _id: "$_id", name: "$name" },
                },
                AccountType
              );
              const savingsAccountTypeRes = await commonFunc.queryExecutor(
                {
                  match: { name: { $ne: "" } },
                  project: { _id: "$_id", name: "$name" },
                },
                SavingsAccount
              );
              const cardResponse = await commonFunc.queryExecutor(
                {
                  match: { name: { $ne: "" } },
                  project: { _id: "$_id", name: "$name" },
                },
                Card
              );
              if (accountTypeRes.response.length === 0) {
                return resolve(responseObj);
              } else {
                const accounts = accountTypeRes.response.reduce((acc, item) => {
                  if (
                    item.name.toLowerCase() === config.SAVINGS.toLowerCase()
                  ) {
                    savingsAccount = accountInfo.filter(
                      (x) =>
                        x.fkAccountTypeId.toString() === item._id.toString() &&
                        !x.cardNumber
                    );
                    acc["savings"] = savingsAccount.map((x) => ({
                      _id: x._id.toString(),
                      title: "Balance",
                      amount: `INR ${parseFloat(x.availableAmount).toFixed(2)}`,
                      overDueTitle: "Overdue amount",
                      overDueAmount: `INR ${parseFloat(x.outstandingAmount).toFixed(2)}`,
                      accountInfo: `Your ${
                        savingsAccountTypeRes.response.find(
                          (y) =>
                            y._id.toString() === x.fkSavingsAccountId.toString()
                        )?.name
                      } Account Number ${x.accountNumber}`,
                      hasPayNowBtn: false,
                    }));

                    lastTxn.push(
                      ...savingsAccount.reduce((acc1, i) => {
                        const txn = paymentHistory.find(
                          (y) =>
                            y.fkSavingsAccountId.toString() ===
                            i.fkSavingsAccountId.toString()
                        );
                        if (txn) {
                          acc1.push({
                            _id:txn._id.toString(),
                            title: `${
                              savingsAccountTypeRes.response.find(
                                (y) =>
                                  y._id.toString() ===
                                  i.fkSavingsAccountId.toString()
                              )?.name
                            } account ${txn.txnType}`,
                            link: "/admin/history/savings",
                            date: moment(txn.paymentAt).format("ddd MM, YYYY"),
                          });
                        }
                        return acc1;
                      }, [])
                    );
                  } else if (
                    item.name.toLowerCase() === config.CREDIT_CARD.toLowerCase()
                  ) {
                    creditCardAccount = accountInfo.filter(
                      (x) =>
                        x.fkAccountTypeId.toString() === item._id.toString()
                    );
                    acc["credit"] = creditCardAccount.map((x) => ({
                      _id: x._id.toString(),
                      title: "Balance",
                      amount: `INR ${parseFloat(x.availableAmount).toFixed(2)}`,
                      overDueTitle: "Overdue amount",
                      overDueAmount: `INR ${parseFloat(x.outstandingAmount).toFixed(2)}`,
                      accountInfo: `Your ${
                        cardResponse.response.find(
                          (y) => y._id.toString() === x.fkCardId.toString()
                        )?.name
                      } Card Number ${x.cardNumber}`,
                      hasPayNowBtn: !!parseFloat(x.outstandingAmount).toFixed(
                        2
                      ),
                    }));
                    lastTxn.push(
                      ...creditCardAccount.reduce((acc1, i) => {
                        const txn = paymentHistory.find(
                          (y) => y.fkCardId.toString() === i.fkCardId.toString()
                        );
                        if (txn) {
                          acc1.push({
                            _id:txn._id.toString(),
                            title: `${
                              cardResponse.response.find(
                                (y) =>
                                  y._id.toString() === i.fkCardId.toString()
                              )?.name
                            } account ${txn.txnType}`,
                            link: "/admin/history/credit-cards",
                            date: moment(txn.paymentAt).format("ddd MM, YYYY"),
                          });
                        }
                        return acc1;
                      }, [])
                    );
                  }
                  return acc;
                }, {});

                responseObj.accounts = accounts;
                responseObj.profile = {
                  name: fullName,
                  profilePic: profilePic
                    ? `${process.env.IMAGE_PATH}/profile/${profilePic}`
                    : "CgProfile",
                  txnDetails: lastTxn,
                };
                const sortPaymentHistory = paymentHistory.sort(
                  (a, b) =>
                    moment(moment(b.paymentAt).format("YYYY-MM-DD")).unix() -
                    moment(moment(a.paymentAt).format("YYYY-MM-DD")).unix()
                );
                const sevenDays = diffDate
                  .eachDayOfInterval({
                    start: diffDate.subDays(new Date(), 6),
                    end: new Date(),
                  })
                  .map((day) => diffDate.format(day, "eeee"));
                const monthList = diffDate
                  .eachMonthOfInterval({
                    start: diffDate.sub(new Date(), { years: 1, months: 1 }),
                    end: new Date(),
                  })
                  .map((month) => diffDate.format(month, "MMMM"));
                // Assigned data
                responseObj.weeklyMonthlyYearly = {
                  savingsLastWeek: {
                    labels: sevenDays,
                    datasets: [
                      {
                        label: "Savings Account Withdrawal Weekly",
                        backgroundColor: "rgba(220, 220, 220, 0.2)",
                        borderColor: "rgba(220, 220, 220, 1)",
                        pointBackgroundColor: "rgba(220, 220, 220, 1)",
                        pointBorderColor: "#fff",
                        data: this.getDataset(
                          savingsAccount,
                          sortPaymentHistory,
                          diffDate.format(
                            diffDate.subDays(new Date(), 7),
                            "yyyy-MM-dd"
                          ),
                          config.WITHDRAWAL,
                          "fkSavingsAccountId",
                          false
                        ),
                      },
                      {
                        label: "Savings Account Deposit Weekly",
                        backgroundColor: "rgba(151, 187, 205, 0.2)",
                        borderColor: "rgba(151, 187, 205, 1)",
                        pointBackgroundColor: "rgba(151, 187, 205, 1)",
                        pointBorderColor: "#fff",
                        data: this.getDataset(
                          savingsAccount,
                          sortPaymentHistory,
                          diffDate.format(
                            diffDate.subDays(new Date(), 7),
                            "yyyy-MM-dd"
                          ),
                          config.DEPOSIT,
                          "fkSavingsAccountId",
                          false
                        ),
                      },
                    ],
                  },
                  savingsLastMonth: {
                    labels: monthList,
                    datasets: [
                      {
                        label: "Savings Account Withdrawal Last month",
                        backgroundColor: "rgba(220, 220, 220, 0.2)",
                        borderColor: "rgba(220, 220, 220, 1)",
                        pointBackgroundColor: "rgba(220, 220, 220, 1)",
                        pointBorderColor: "#fff",
                        data: this.getDataset(
                          savingsAccount,
                          sortPaymentHistory,
                          diffDate.format(
                            diffDate.subMonths(new Date(), 1),
                            "yyyy-MM-dd"
                          ),
                          config.WITHDRAWAL,
                          "fkSavingsAccountId",
                          false
                        ),
                      },
                      {
                        label: "Savings Account Deposit Last month",
                        backgroundColor: "rgba(151, 187, 205, 0.2)",
                        borderColor: "rgba(151, 187, 205, 1)",
                        pointBackgroundColor: "rgba(151, 187, 205, 1)",
                        pointBorderColor: "#fff",
                        data: this.getDataset(
                          savingsAccount,
                          sortPaymentHistory,
                          diffDate.format(
                            diffDate.subMonths(new Date(), 1),
                            "yyyy-MM-dd"
                          ),
                          config.DEPOSIT,
                          "fkSavingsAccountId",
                          false
                        ),
                      },
                    ],
                  },
                  savingsLastYear: {
                    labels: monthList,
                    datasets: [
                      {
                        label: "Savings Account Withdrawal Last Year",
                        backgroundColor: "rgba(220, 220, 220, 0.2)",
                        borderColor: "rgba(220, 220, 220, 1)",
                        pointBackgroundColor: "rgba(220, 220, 220, 1)",
                        pointBorderColor: "#fff",
                        data: this.getDataset(
                          savingsAccount,
                          sortPaymentHistory,
                          diffDate.format(
                            diffDate.subMonths(new Date(), 1),
                            "yyyy-MM-dd"
                          ),
                          config.WITHDRAWAL,
                          "fkSavingsAccountId",
                          false
                        ),
                      },
                      {
                        label: "Savings Account Deposit Last year",
                        backgroundColor: "rgba(151, 187, 205, 0.2)",
                        borderColor: "rgba(151, 187, 205, 1)",
                        pointBackgroundColor: "rgba(151, 187, 205, 1)",
                        pointBorderColor: "#fff",
                        data: this.getDataset(
                          savingsAccount,
                          sortPaymentHistory,
                          diffDate.format(
                            diffDate.subMonths(new Date(), 1),
                            "yyyy-MM-dd"
                          ),
                          config.DEPOSIT,
                          "fkSavingsAccountId",
                          false
                        ),
                      },
                    ],
                  },
                  creditCardLastweek: {
                    labels: sevenDays,
                    datasets: [
                      {
                        label: "Credit Card Withdrawal Weekly",
                        backgroundColor: "rgba(220, 220, 220, 0.2)",
                        borderColor: "rgba(220, 220, 220, 1)",
                        pointBackgroundColor: "rgba(220, 220, 220, 1)",
                        pointBorderColor: "#fff",
                        data: this.getDataset(
                          creditCardAccount,
                          sortPaymentHistory,
                          diffDate.format(
                            diffDate.subDays(new Date(), 7),
                            "yyyy-MM-dd"
                          ),
                          config.WITHDRAWAL,
                          "fkCardId",
                          false
                        ),
                      },
                      {
                        label: "Credit Card Deposit Weekly",
                        backgroundColor: "rgba(151, 187, 205, 0.2)",
                        borderColor: "rgba(151, 187, 205, 1)",
                        pointBackgroundColor: "rgba(151, 187, 205, 1)",
                        pointBorderColor: "#fff",
                        data: this.getDataset(
                          creditCardAccount,
                          sortPaymentHistory,
                          diffDate.format(
                            diffDate.subDays(new Date(), 7),
                            "yyyy-MM-dd"
                          ),
                          config.DEPOSIT,
                          "fkCardId",
                          false
                        ),
                      },
                    ],
                  },
                  creditCardLastMonth: {
                    labels: monthList,
                    datasets: [
                      {
                        label: "Credit Card Withdrawal Last month",
                        backgroundColor: "rgba(220, 220, 220, 0.2)",
                        borderColor: "rgba(220, 220, 220, 1)",
                        pointBackgroundColor: "rgba(220, 220, 220, 1)",
                        pointBorderColor: "#fff",
                        data: this.getDataset(
                          creditCardAccount,
                          sortPaymentHistory,
                          diffDate.format(
                            diffDate.subMonths(new Date(), 1),
                            "yyyy-MM-dd"
                          ),
                          config.WITHDRAWAL,
                          "fkCardId",
                          false
                        ),
                      },
                      {
                        label: "Credit Card Deposit Last month",
                        backgroundColor: "rgba(151, 187, 205, 0.2)",
                        borderColor: "rgba(151, 187, 205, 1)",
                        pointBackgroundColor: "rgba(151, 187, 205, 1)",
                        pointBorderColor: "#fff",
                        data: this.getDataset(
                          creditCardAccount,
                          sortPaymentHistory,
                          diffDate.format(
                            diffDate.subMonths(new Date(), 1),
                            "yyyy-MM-dd"
                          ),
                          config.DEPOSIT,
                          "fkCardId",
                          false
                        ),
                      },
                    ],
                  },
                  creditCardLastYear: {
                    labels: monthList,
                    datasets: [
                      {
                        label: "Credit Card Withdrawal Last Year",
                        backgroundColor: "rgba(220, 220, 220, 0.2)",
                        borderColor: "rgba(220, 220, 220, 1)",
                        pointBackgroundColor: "rgba(220, 220, 220, 1)",
                        pointBorderColor: "#fff",
                        data: this.getDataset(
                          creditCardAccount,
                          sortPaymentHistory,
                          diffDate.format(
                            diffDate.subMonths(new Date(), 1),
                            "yyyy-MM-dd"
                          ),
                          config.WITHDRAWAL,
                          "fkCardId",
                          false
                        ),
                      },
                      {
                        label: "Credit Card Deposit Last year",
                        backgroundColor: "rgba(151, 187, 205, 0.2)",
                        borderColor: "rgba(151, 187, 205, 1)",
                        pointBackgroundColor: "rgba(151, 187, 205, 1)",
                        pointBorderColor: "#fff",
                        data: this.getDataset(
                          creditCardAccount,
                          sortPaymentHistory,
                          diffDate.format(
                            diffDate.subMonths(new Date(), 1),
                            "yyyy-MM-dd"
                          ),
                          config.DEPOSIT,
                          "fkCardId",
                          false
                        ),
                      },
                    ],
                  },
                };
                // Bind Txn
                responseObj.txnWeeklyMonthlyYearly = {
                  savingsLastWeek: {
                    labels: [
                      "Savings A/c Deposit last week",
                      "Savings A/c Withdrawal last week",
                      "Credit cards Deposit last week",
                      "Credit cards Withdrawal last week",
                    ],
                    datasets: [
                      {
                        backgroundColor: [
                          "#41B883",
                          "#E46651",
                          "#00D8FF",
                          "#DD1B16",
                        ],
                        data: [
                          this.getDataset(
                            savingsAccount,
                            sortPaymentHistory,
                            diffDate.format(
                              diffDate.subDays(new Date(), 7),
                              "yyyy-MM-dd"
                            ),
                            config.DEPOSIT,
                            "fkSavingsAccountId",
                            true
                          ),
                          this.getDataset(
                            savingsAccount,
                            sortPaymentHistory,
                            diffDate.format(
                              diffDate.subDays(new Date(), 7),
                              "yyyy-MM-dd"
                            ),
                            config.WITHDRAWAL,
                            "fkSavingsAccountId",
                            true
                          ),
                          this.getDataset(
                            creditCardAccount,
                            sortPaymentHistory,
                            diffDate.format(
                              diffDate.subDays(new Date(), 7),
                              "yyyy-MM-dd"
                            ),
                            config.DEPOSIT,
                            "fkCardId",
                            true
                          ),
                          this.getDataset(
                            creditCardAccount,
                            sortPaymentHistory,
                            diffDate.format(
                              diffDate.subDays(new Date(), 7),
                              "yyyy-MM-dd"
                            ),
                            config.WITHDRAWAL,
                            "fkCardId",
                            true
                          ),
                        ],
                      },
                    ],
                  },
                  savingsLastMonth: {
                    labels: [
                      "Savings A/c Deposit last month",
                      "Savings A/c Withdrawal last month",
                      "Credit cards Deposit last month",
                      "Credit cards Withdrawal last month",
                    ],
                    datasets: [
                      {
                        backgroundColor: [
                          "#41B883",
                          "#E46651",
                          "#00D8FF",
                          "#DD1B16",
                        ],
                        data: [
                          this.getDataset(
                            savingsAccount,
                            sortPaymentHistory,
                            diffDate.format(
                              diffDate.subMonths(new Date(), 1),
                              "yyyy-MM-dd"
                            ),
                            config.DEPOSIT,
                            "fkSavingsAccountId",
                            true
                          ),
                          this.getDataset(
                            savingsAccount,
                            sortPaymentHistory,
                            diffDate.format(
                              diffDate.subMonths(new Date(), 1),
                              "yyyy-MM-dd"
                            ),
                            config.WITHDRAWAL,
                            "fkSavingsAccountId",
                            true
                          ),
                          this.getDataset(
                            creditCardAccount,
                            sortPaymentHistory,
                            diffDate.format(
                              diffDate.subMonths(new Date(), 1),
                              "yyyy-MM-dd"
                            ),
                            config.DEPOSIT,
                            "fkCardId",
                            true
                          ),
                          this.getDataset(
                            creditCardAccount,
                            sortPaymentHistory,
                            diffDate.format(
                              diffDate.subMonths(new Date(), 1),
                              "yyyy-MM-dd"
                            ),
                            config.WITHDRAWAL,
                            "fkCardId",
                            true
                          ),
                        ],
                      },
                    ],
                  },

                  savingsLastYear: {
                    labels: [
                      "Savings A/c Deposit last year",
                      "Savings A/c Withdrawal last year",
                      "Credit cards Deposit last year",
                      "Credit cards Withdrawal last year",
                    ],
                    datasets: [
                      {
                        backgroundColor: [
                          "#41B883",
                          "#E46651",
                          "#00D8FF",
                          "#DD1B16",
                        ],
                        data: [
                          this.getDataset(
                            savingsAccount,
                            sortPaymentHistory,
                            diffDate.format(
                              diffDate.subMonths(new Date(), 1),
                              "yyyy-MM-dd"
                            ),
                            config.DEPOSIT,
                            "fkSavingsAccountId",
                            true
                          ),
                          this.getDataset(
                            savingsAccount,
                            sortPaymentHistory,
                            diffDate.format(
                              diffDate.subMonths(new Date(), 1),
                              "yyyy-MM-dd"
                            ),
                            config.WITHDRAWAL,
                            "fkSavingsAccountId",
                            true
                          ),
                          this.getDataset(
                            creditCardAccount,
                            sortPaymentHistory,
                            diffDate.format(
                              diffDate.subMonths(new Date(), 1),
                              "yyyy-MM-dd"
                            ),
                            config.DEPOSIT,
                            "fkCardId",
                            true
                          ),
                          this.getDataset(
                            creditCardAccount,
                            sortPaymentHistory,
                            diffDate.format(
                              diffDate.subMonths(new Date(), 1),
                              "yyyy-MM-dd"
                            ),
                            config.WITHDRAWAL,
                            "fkCardId",
                            true
                          ),
                        ],
                      },
                    ],
                  },
                };
                return resolve(responseObj);
              }
            }
          }
        } else {
          return resolve(responseObj);
        }
      } catch (ex) {
        console.log("err =>>", ex);
        return resolve(responseObj);
      }
    });
  },
};
