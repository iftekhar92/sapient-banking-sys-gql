const mongoose = require("mongoose");
const moment = require("moment");
const randomstring = require("randomstring");
const asyncLoop = require("node-async-loop");

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
  isExistAccountAndCard(input, context) {
    return new Promise(async (resolve) => {
      try {
        const { error, data } = await commonFunc.findByAttribute(
          { _id: mongoose.Types.ObjectId(context.user._id) },
          User
        );
        if (!error && data) {
          const {
            fkAccountTypeId = "",
            fkSavingsAccountId = "",
            fkCardId = "",
          } = input;
          const isAccountExist = data.accountInfo.find(
            (x) =>
              x.fkAccountTypeId.toString() === fkAccountTypeId &&
              x.fkSavingsAccountId.toString() === fkSavingsAccountId
          );
          const isCardExist = data.accountInfo.find(
            (x) =>
              x.fkAccountTypeId.toString() === fkAccountTypeId &&
              x.fkCardId.toString() === fkCardId
          );
          return resolve({
            error: false,
            isAccount: !!isAccountExist,
            isCard: !!isCardExist,
          });
        } else {
          return resolve({ error: true });
        }
      } catch (ex) {
        console.error(ex);
        return resolve({ error: true });
      }
    });
  },
  createSavingsAccount(input, context) {
    return new Promise(async (resolve) => {
      const { type } = input;
      try {
        // Fetched user details
        const { error, data } = await commonFunc.findByAttribute(
          { _id: mongoose.Types.ObjectId(context.user._id) },
          User
        );

        if (!error && data) {
          // Checked existing details like Account and Card
          const {
            error: exError,
            isAccount = false,
            isCard = false,
          } = await this.isExistAccountAndCard(input, context);
          if (exError) {
            return resolve({
              error: null,
              severity: "error bg",
              isAccountCreated: false,
              isCardCreated: false,
              type,
              message: "Something went wrong!",
            });
          } else {
            // Thrown Error in case Account is already exist
            if (isAccount) {
              return resolve({
                error: [
                  {
                    key: "fkSavingsAccountId",
                    value: "Already created!, Please select another",
                  },
                ],
                severity: "error bg",
                isAccountCreated: false,
                isCardCreated: false,
                type,
                message: "Please fix fields in red below.",
              });
            } else {
              // Preparing input for creating Account
              const datetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
              const {
                fkAccountTypeId = "",
                fkSavingsAccountId = "",
                fkCardId = "",
              } = input;
              const accountNumber = faker.accountNumber();
              const obj = {
                _id: mongoose.Types.ObjectId(),
                accountNumber,
                fkAccountTypeId: mongoose.Types.ObjectId(fkAccountTypeId),
                fkSavingsAccountId: fkSavingsAccountId
                  ? mongoose.Types.ObjectId(fkSavingsAccountId)
                  : mongoose.Types.ObjectId(),
                fkCardId: mongoose.Types.ObjectId(),
                cardNumber: "",
                cvvNumber: "",
                limitAmount: 0,
                availableAmount: faker.amount(), // TODO
                outstandingAmount: 0,
                startDate: datetime,
                expiryDate: datetime,
                status: "CONFIRMED",
                createdAt: datetime,
                updatedAt: datetime,
              };
              // Account creating
              const { error: accError } = await commonFunc.pushDoc(
                { _id: mongoose.Types.ObjectId(context.user._id) },
                { accountInfo: obj },
                User
              );
              // Thrown Error for creating Account
              if (accError) {
                return resolve({
                  error: null,
                  severity: "error bg",
                  isAccountCreated: false,
                  isCardCreated: false,
                  type,
                  message: "Something went wrong while creating Account!",
                });
              } else {
                // Check Card need to create
                if (fkCardId && !isCard) {
                  const { error: c_error, data: c_data } =
                    await commonFunc.findByAttribute(
                      { _id: mongoose.Types.ObjectId(fkCardId) },
                      Card
                    );
                  if (!c_error && c_data) {
                    const cardObj = {
                      _id: mongoose.Types.ObjectId(),
                      accountNumber,
                      fkAccountTypeId: mongoose.Types.ObjectId(fkAccountTypeId),
                      fkSavingsAccountId: fkSavingsAccountId
                        ? mongoose.Types.ObjectId(fkSavingsAccountId)
                        : mongoose.Types.ObjectId(),
                      fkCardId: mongoose.Types.ObjectId(fkCardId),
                      cardNumber: faker.cardNumber(),
                      cvvNumber: faker.cvvNumber(),
                      limitAmount: 0,
                      availableAmount: 0,
                      outstandingAmount: 0,
                      startDate: datetime,
                      expiryDate: moment()
                        .add(parseInt(c_data.validityNoOfYear, 10), "years")
                        .format("YYYY-MM-DD HH:mm:ss"),
                      status: "CONFIRMED",
                      createdAt: datetime,
                      updatedAt: datetime,
                    };
                    const { error: caError } = await commonFunc.pushDoc(
                      { _id: mongoose.Types.ObjectId(context.user._id) },
                      { accountInfo: cardObj },
                      User
                    );
                    if (caError) {
                      return resolve({
                        error: null,
                        severity: "success bg",
                        isAccountCreated: true,
                        isCardCreated: false,
                        type,
                        message:
                          "Account has been created. But have issue with creating card",
                      });
                    } else {
                      return resolve({
                        error: null,
                        severity: "success bg",
                        isAccountCreated: true,
                        isCardCreated: true,
                        type,
                        message:
                          "Account and Card has been created successfully!",
                      });
                    }
                  } else {
                    // Card does not exist
                    return resolve({
                      error: null,
                      severity: "success bg",
                      isAccountCreated: true,
                      isCardCreated: false,
                      type,
                      message:
                        "Account has been created successfully, but not card!",
                    });
                  }
                } else {
                  return resolve({
                    error: null,
                    severity: "success bg",
                    isAccountCreated: true,
                    isCardCreated: false,
                    type,
                    message:
                      "Account has been created successfully. But, Card does not exist.",
                  });
                }
              }
            }
          }
        } else {
          return resolve({
            error: null,
            severity: "error bg",
            isAccountCreated: false,
            isCardCreated: false,
            type,
            message: "Sorry!, User does not exist!",
          });
        }
      } catch (ex) {
        console.error(ex);
        return resolve({
          error: null,
          severity: "error bg",
          isAccountCreated: false,
          isCardCreated: false,
          type,
          message: "Something went wrong!",
        });
      }
    });
  },
  createCreditCardAccount(input, context) {
    return new Promise(async (resolve) => {
      const { type } = input;
      try {
        // Fetched user details
        const { error, data } = await commonFunc.findByAttribute(
          { _id: mongoose.Types.ObjectId(context.user._id) },
          User
        );
        if (!error && data) {
          // Checked existing details for Card
          const { error, isCard = false } = await this.isExistAccountAndCard(
            input,
            context
          );
          if (error) {
            return resolve({
              error: null,
              severity: "error bg",
              isAccountCreated: false,
              isCardCreated: false,
              type,
              message: "Something went wrong!",
            });
          } else {
            // Thrown Error in case Account is already exist
            if (isCard) {
              return resolve({
                error: [
                  {
                    key: "fkCardId",
                    value: "Already created!, Please select another",
                  },
                ],
                severity: "error bg",
                isAccountCreated: false,
                isCardCreated: false,
                type,
                message: "Please fix fields in red below.",
              });
            } else {
              // Preparing input for creating Card
              const datetime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
              const {
                fkAccountTypeId = "",
                fkSavingsAccountId = "",
                fkCardId = "",
              } = input;
              const { error: c_error, data: c_data } =
                await commonFunc.findByAttribute(
                  { _id: mongoose.Types.ObjectId(fkCardId) },
                  Card
                );
              if (!c_error && c_data) {
                const cardObj = {
                  _id: mongoose.Types.ObjectId(),
                  accountNumber: faker.accountNumber(),
                  fkAccountTypeId: mongoose.Types.ObjectId(fkAccountTypeId),
                  fkSavingsAccountId: fkSavingsAccountId
                    ? mongoose.Types.ObjectId(fkSavingsAccountId)
                    : mongoose.Types.ObjectId(),
                  fkCardId: mongoose.Types.ObjectId(fkCardId),
                  cardNumber: faker.cardNumber(),
                  cvvNumber: faker.cvvNumber(),
                  limitAmount: parseInt(c_data.limitAmount, 10),
                  availableAmount: parseInt(c_data.limitAmount, 10),
                  outstandingAmount: 0,
                  startDate: datetime,
                  expiryDate: moment()
                    .add(parseInt(c_data.validityNoOfYear, 10), "years")
                    .format("YYYY-MM-DD HH:mm:ss"),
                  status: "CONFIRMED",
                  createdAt: datetime,
                  updatedAt: datetime,
                };
                const { error: caError } = await commonFunc.pushDoc(
                  { _id: mongoose.Types.ObjectId(context.user._id) },
                  { accountInfo: cardObj },
                  User
                );
                if (caError) {
                  return resolve({
                    error: null,
                    severity: "error bg",
                    isAccountCreated: false,
                    isCardCreated: false,
                    type,
                    message: "Something went wrong while creating Card!",
                  });
                } else {
                  return resolve({
                    error: null,
                    severity: "success bg",
                    isAccountCreated: false,
                    isCardCreated: true,
                    type,
                    message: "Card has been assigned successfully!",
                  });
                }
              } else {
                // Card does not exist
                return resolve({
                  error: null,
                  severity: "error bg",
                  isAccountCreated: false,
                  isCardCreated: false,
                  type,
                  message: "Card does not exist!",
                });
              }
            }
          }
        } else {
          return resolve({
            error: null,
            severity: "error bg",
            isAccountCreated: false,
            isCardCreated: false,
            type,
            message: "Sorry!, User does not exist!",
          });
        }
      } catch (ex) {
        console.error(ex);
        return resolve({
          error: null,
          severity: "error bg",
          isAccountCreated: false,
          isCardCreated: false,
          type,
          message: "Something went wrong!",
        });
      }
    });
  },
  openAccount(input, context) {
    return new Promise(async (resolve) => {
      const { type } = input;
      try {
        if (auth.isHuman(context)) {
          const validation = joi.openAccount(input);
          if (validation.error) {
            return resolve({
              error: validation.error,
              severity: "error bg",
              isAccountCreated: false,
              isCardCreated: false,
              type,
              message: "Please fix fields in red below.",
            });
          } else {
            if (type === config.SAVINGS) {
              const response = await this.createSavingsAccount(input, context);
              return resolve(response);
            } else if (type === config.CREDIT_CARD) {
              const response = await this.createCreditCardAccount(
                input,
                context
              );
              return resolve(response);
            } else {
              return resolve({
                error: null,
                severity: "error bg",
                isAccountCreated: false,
                isCardCreated: false,
                type,
                message: "Sorry, criteria does not match.",
              });
            }
          }
        } else {
          return resolve({
            error: null,
            severity: "error bg",
            isAccountCreated: false,
            isCardCreated: false,
            type,
            message: "Sorry, You are not authorized.",
          });
        }
      } catch (ex) {
        console.error(ex);
        return resolve({
          error: null,
          severity: "error bg",
          isAccountCreated: false,
          isCardCreated: false,
          type,
          message: "Something went wrong!",
        });
      }
    });
  },
  savingsAccount(input, context) {
    return new Promise(async (resolve) => {
      const { status = "" } = input;
      try {
        if (auth.isHuman(context)) {
          const params = { _id: mongoose.Types.ObjectId(context.user._id) };
          if (status) {
            params.status = status;
          }
          const { error, data } = await commonFunc.findByAttribute(
            params,
            User
          );
          if (error || !data) {
            return resolve({
              message: "Sorry, You are not authorized.",
              severity: "error bg",
              response: [],
            });
          } else {
            const arrData = [];
            const accountInfo = data.accountInfo.filter(
              (x) => !x.cardNumber && !x.cvvNumber
            );
            if (accountInfo.length > 0) {
              return asyncLoop(
                accountInfo,
                async (item, next) => {
                  const {
                    fkSavingsAccountId,
                    accountNumber,
                    availableAmount,
                    startDate,
                    status,
                  } = item;
                  const { error: err, data: res } =
                    await commonFunc.findByAttribute(
                      {
                        _id: mongoose.Types.ObjectId(fkSavingsAccountId),
                      },
                      SavingsAccount
                    );
                  arrData.push({
                    _id: fkSavingsAccountId,
                    selection: "radio",
                    accountNumber,
                    fkSavingsAccount: !err && res ? res.name : "",
                    availableAmount,
                    startDate: moment(startDate)
                      .format("YYYY-MM-DD")
                      .toString(),
                    status,
                  });
                  next();
                },
                () => resolve({ message: "", severity: "", response: arrData })
              );
            } else {
              return resolve({
                message: "No, account created yet.",
                severity: "info bg",
                response: [],
              });
            }
          }
        } else {
          return resolve({
            message: "Sorry, You are not authorized.",
            severity: "error bg",
            response: [],
          });
        }
      } catch (ex) {
        console.error(ex);
        return resolve({
          message: "Something went wrong!",
          severity: "error bg",
          response: [],
        });
      }
    });
  },
  creditCardsAccount(input, context) {
    return new Promise(async (resolve) => {
      const { status = "" } = input;
      try {
        if (auth.isHuman(context)) {
          const params = { _id: mongoose.Types.ObjectId(context.user._id) };
          if (status) {
            params.status = status;
          }
          const { error, data } = await commonFunc.findByAttribute(
            params,
            User
          );
          if (error || !data) {
            return resolve({
              message: "Sorry, You are not authorized.",
              severity: "error bg",
              response: [],
            });
          } else {
            const arrData = [];
            if (data.accountInfo.length > 0) {
              return asyncLoop(
                data.accountInfo,
                async (item, next) => {
                  const {
                    fkCardId,
                    cardNumber,
                    limitAmount,
                    availableAmount,
                    outstandingAmount,
                    startDate,
                    expiryDate,
                    status,
                  } = item;
                  const { error: err, data: res } =
                    await commonFunc.findByAttribute(
                      {
                        _id: mongoose.Types.ObjectId(fkCardId),
                        name: { $ne: config.DEBIT_CARD },
                      },
                      Card
                    );
                  if (!err && res) {
                    arrData.push({
                      _id: fkCardId,
                      selection: "radio",
                      cardNumber,
                      cardName: res.name,
                      limitAmount,
                      availableAmount,
                      outstandingAmount,
                      status,
                      startDate: moment(startDate)
                        .format("YYYY-MM-DD")
                        .toString(),
                      expiryDate: moment(expiryDate)
                        .format("YYYY-MM-DD")
                        .toString(),
                    });
                  }
                  next();
                },
                () => resolve({ message: "", severity: "", response: arrData })
              );
            } else {
              return resolve({
                message: "No, Credit card assigned yet.",
                severity: "info bg",
                response: [],
              });
            }
          }
        } else {
          return resolve({
            message: "Sorry, You are not authorized.",
            severity: "error bg",
            response: [],
          });
        }
      } catch (ex) {
        console.error(ex);
        return resolve({
          message: "Something went wrong!",
          severity: "error bg",
          response: [],
        });
      }
    });
  },
  fetchAccountDetails(context) {
    return new Promise(async (resolve) => {
      try {
        if (auth.isHuman(context)) {
          const { error, data } = await commonFunc.findByAttribute(
            { _id: mongoose.Types.ObjectId(context.user._id) },
            User
          );
          if (error || !data) {
            return resolve({
              message: "Sorry, Your detail do not exist.",
              severity: "error bg",
              accountType: [],
              cards: [],
              accounts: [],
            });
          } else {
            const { accountInfo } = data;
            if (accountInfo.length > 0) {
              const arrAccountTypes = accountInfo.reduce((acc, item) => {
                acc.push(item.fkAccountTypeId);
                return acc;
              }, []);
              const arrCardTypes = accountInfo.reduce((acc, item) => {
                acc.push(item.fkCardId);
                return acc;
              }, []);
              const arrAccounts = accountInfo.reduce((acc, item) => {
                acc.push(item.fkSavingsAccountId);
                return acc;
              }, []);
              const project = {
                _id: "$_id",
                name: "$name",
              };
              const { response: accountType } = await commonFunc.queryExecutor(
                {
                  match: {
                    _id: { $in: arrAccountTypes },
                  },
                  project,
                },
                AccountType
              );
              const { response: cards } = await commonFunc.queryExecutor(
                {
                  match: {
                    _id: { $in: arrCardTypes },
                    name: { $ne: config.DEBIT_CARD },
                  },
                  project,
                },
                Card
              );
              const { response: accounts } = await commonFunc.queryExecutor(
                {
                  match: {
                    _id: { $in: arrAccounts },
                  },
                  project,
                },
                SavingsAccount
              );
              return resolve({
                message: "",
                severity: "",
                accountType,
                cards,
                accounts,
              });
            } else {
              return resolve({
                message: "Sorry, No card and Account created yet.",
                severity: "info bg",
                accountType: [],
                cards: [],
                accounts: [],
              });
            }
          }
        } else {
          return resolve({
            message: "Sorry, You are not authorized.",
            severity: "error bg",
            accountType: [],
            cards: [],
            accounts: [],
          });
        }
      } catch (ex) {
        console.error(ex);
        return resolve({
          message: "Something went wrong!",
          severity: "error bg",
          accountType: [],
          cards: [],
          accounts: [],
        });
      }
    });
  },
  makeTransaction(input, context) {
    return new Promise(async (resolve) => {
      try {
        if (auth.isHuman(context)) {
          const { error, data } = await commonFunc.findByAttribute(
            { _id: mongoose.Types.ObjectId(context.user._id) },
            User
          );
          if (error || !data) {
            return resolve({
              error: null,
              message: "Sorry, Your detail do not exist.",
              severity: "error bg",
            });
          } else {
            const validation = joi.makeTransaction(input);
            if (validation.error) {
              return resolve({
                error: validation.error,
                severity: "error bg",
                message: "Please fix fields in red below.",
              });
            } else {
              const {
                txnType,
                fkAccountTypeId,
                fkCardId = "",
                fkSavingsAccountId = "",
                amount,
                remark = "",
                paymentAt = "",
              } = input;
              const status = "CONFIRMED";
              let dynamicValue = fkCardId;
              let dynamicKey = "fkCardId";
              let availableAmount = 0;
              let outstandingAmount = 0;
              if (fkSavingsAccountId) {
                dynamicValue = fkSavingsAccountId;
                dynamicKey = "fkSavingsAccountId";
              }
              const account = data.accountInfo.find(
                (x) =>
                  x.fkAccountTypeId.toString() === fkAccountTypeId &&
                  x[dynamicKey].toString() === dynamicValue
              );
              if (account) {
                if (fkCardId) {
                  if (txnType === config.DEPOSIT) {
                    availableAmount = parseFloat(
                      parseFloat(account.availableAmount) + parseFloat(amount)
                    );
                    outstandingAmount = parseFloat(
                      parseFloat(account.outstandingAmount) - parseFloat(amount)
                    );
                  } else {
                    availableAmount = parseFloat(
                      parseFloat(account.availableAmount) - parseFloat(amount)
                    );
                    outstandingAmount = parseFloat(
                      parseFloat(account.outstandingAmount) + parseFloat(amount)
                    );
                  }
                } else {
                  if (txnType === config.DEPOSIT) {
                    availableAmount = parseFloat(
                      parseFloat(account.availableAmount) + parseFloat(amount)
                    );
                  } else {
                    availableAmount = parseFloat(
                      parseFloat(account.availableAmount) - parseFloat(amount)
                    );
                  }
                }
                if (outstandingAmount < 0) {
                  outstandingAmount = 0;
                }
                if (availableAmount < 0) {
                  return resolve({
                    error: null,
                    message:
                      "Sorry, Due to insufficient amount, your request can't be proceed.",
                    severity: "error bg",
                  });
                } else {
                  const condition = {
                    _id: mongoose.Types.ObjectId(context.user._id),
                    accountInfo: {
                      $elemMatch: { _id: mongoose.Types.ObjectId(account._id) },
                    },
                  };
                  const objValue = {
                    "accountInfo.$.availableAmount": availableAmount.toFixed(2),
                    "accountInfo.$.outstandingAmount":
                      outstandingAmount.toFixed(2),
                  };
                  const _id = mongoose.Types.ObjectId();
                  const objData = {
                    _id,
                    txnId: randomstring.generate(config.account.txnId),
                    txnType,
                    fkAccountTypeId: mongoose.Types.ObjectId(fkAccountTypeId),
                    fkCardId: fkCardId
                      ? mongoose.Types.ObjectId(fkCardId)
                      : mongoose.Types.ObjectId(),
                    fkSavingsAccountId: fkSavingsAccountId
                      ? mongoose.Types.ObjectId(fkSavingsAccountId)
                      : mongoose.Types.ObjectId(),
                    amount: parseFloat(amount).toFixed(2),
                    remark,
                    status,
                    paymentAt: moment(paymentAt || new Date()).format(
                      "YYYY-MM-DD HH:mm:ss"
                    ),
                    paymentUpdatedAt: moment(paymentAt || new Date()).format(
                      "YYYY-MM-DD HH:mm:ss"
                    ),
                  };
                  const { error: paymentError } = await commonFunc.pushDoc(
                    { _id: mongoose.Types.ObjectId(context.user._id) },
                    { paymentHistory: objData },
                    User
                  );
                  if (paymentError) {
                    return resolve({
                      error: null,
                      message: "Data can not be saved.",
                      severity: "error bg",
                    });
                  } else {
                    const { error: accountError } = await commonFunc.setDoc(
                      condition,
                      objValue,
                      User
                    );
                    if (accountError) {
                      await commonFunc.pullDoc(
                        { _id: mongoose.Types.ObjectId(context.user._id) },
                        { paymentHistory: { _id } },
                        User
                      );
                      return resolve({
                        error: null,
                        message:
                          "Due to fail to update account, Ttransaction is rollback.",
                        severity: "info bg",
                      });
                    } else {
                      return resolve({
                        error: null,
                        message: "Payment has been completely successfully.",
                        severity: "success bg",
                      });
                    }
                  }
                }
              } else {
                return resolve({
                  error: null,
                  message: "Sorry, Resource does not exist.",
                  severity: "error bg",
                });
              }
            }
          }
        } else {
          return resolve({
            error: null,
            message: "Sorry, You are not authorized.",
            severity: "error bg",
          });
        }
      } catch (ex) {
        console.error(ex);
        return resolve({
          error: null,
          message: "Something went wrong!",
          severity: "error bg",
        });
      }
    });
  },
  removeSavingsAccount(id, context) {
    return new Promise(async (resolve) => {
      try {
        if (auth.isHuman(context)) {
          const { error, data } = await commonFunc.findByAttribute(
            { _id: mongoose.Types.ObjectId(context.user._id) },
            User
          );
          if (error || !data) {
            return resolve({
              hasError: true,
              message: "Sorry, Your detail do not exist.",
              severity: "error bg",
            });
          } else {
            const { error } = await commonFunc.pullDoc(
              { _id: mongoose.Types.ObjectId(context.user._id) },
              { accountInfo: { _id: mongoose.Types.ObjectId(id) } },
              User
            );
            if (error) {
              return resolve({
                hasError: true,
                message: "Due to some error, request can not be completed",
                severity: "error bg",
              });
            } else {
              return resolve({
                hasError: false,
                message: "Account has been deleted permanently.",
                severity: "success bg",
              });
            }
          }
        } else {
          return resolve({
            hasError: true,
            message: "Sorry, You are not authorized.",
            severity: "error bg",
          });
        }
      } catch (ex) {
        console.error(ex);
        return resolve({
          hasError: true,
          message: "Something went wrong!",
          severity: "error bg",
        });
      }
    });
  },
  removeAccountAndPaymentHistory(context) {
    return new Promise(async (resolve) => {
      try {
        if (auth.isHuman(context)) {
          const { error, data } = await commonFunc.findByAttribute(
            { _id: mongoose.Types.ObjectId(context.user._id) },
            User
          );
          if (error || !data) {
            return resolve({
              hasError: true,
              message: "Sorry, Your detail do not exist.",
              severity: "error bg",
            });
          } else {
            const { error } = await commonFunc.updateByAttributes(
              { _id: mongoose.Types.ObjectId(context.user._id) },
              { accountInfo: [], paymentHistory: [] },
              User
            );
            if (error) {
              return resolve({
                hasError: true,
                message: "Due to some error, request can not be completed",
                severity: "error bg",
              });
            } else {
              return resolve({
                hasError: false,
                message:
                  "Account and Payment history have been deleted permanently.",
                severity: "success bg",
              });
            }
          }
        } else {
          return resolve({
            hasError: true,
            message: "Sorry, You are not authorized.",
            severity: "error bg",
          });
        }
      } catch (ex) {
        console.error(ex);
        return resolve({
          hasError: true,
          message: "Something went wrong!",
          severity: "error bg",
        });
      }
    });
  },
  transactionHistory(input, context) {
    return new Promise(async (resolve) => {
      try {
        if (auth.isHuman(context)) {
          const { error, data } = await commonFunc.findByAttribute(
            { _id: mongoose.Types.ObjectId(context.user._id) },
            User
          );
          if (error || !data) {
            return resolve({
              total: 0,
              response: [],
            });
          } else {
            const {
              key,
              value,
              type,
              pageLimit,
              pageNo,
              search: { startDate = "", endDate = "" },
            } = input;
            const limit = parseInt(pageLimit, 10);
            const page = parseInt(pageNo, 10);
            const skip = parseInt(limit * page, 10);
            let arrData = [];
            let startDateTime;
            let endDateTime;
            if (startDate && endDate) {
              startDateTime = moment(startDate).unix();
              endDateTime = moment(endDate).unix();
              arrData = data.paymentHistory.filter((x) => {
                let paymentAtTime = moment(x.paymentAt).format("YYYY-MM-DD");
                paymentAtTime = moment(paymentAtTime).unix();
                const timeBetween =
                  paymentAtTime >= startDateTime &&
                  paymentAtTime <= endDateTime;
                if (x[key].toString() === value && timeBetween) {
                  return x;
                }
              });
            } else {
              arrData = data.paymentHistory.filter(
                (x) => x[key].toString() === value
              );
            }
            arrData.sort(
              (a, b) =>
                moment(moment(b.paymentAt).format("YYYY-MM-DD")).unix() -
                moment(moment(a.paymentAt).format("YYYY-MM-DD")).unix()
            );
            const arrRes = arrData.slice(skip, skip + limit);
            const response = [];
            if (arrRes.length > 0) {
              return asyncLoop(
                arrRes,
                async (item, next) => {
                  const { error: sa_error, data: sa_data } =
                    await commonFunc.findByAttribute(
                      { _id: mongoose.Types.ObjectId(value) },
                      type === config.SAVINGS ? SavingsAccount : Card
                    );
                  const accountType = !sa_error && sa_data ? sa_data.name : "";
                  const accountInfo = data.accountInfo.find(
                    (x) => x[key].toString() === item[key].toString()
                  );
                  response.push({
                    txnId: item.txnId,
                    txnType: item.txnType,
                    accountNumber: accountInfo
                      ? accountInfo[
                          type === config.SAVINGS
                            ? "accountNumber"
                            : "cardNumber"
                        ]
                      : "",
                    accountInfo: accountType,
                    amount: item.amount,
                    remark: item.remark,
                    status: item.status,
                    paymentAt: moment(item.paymentAt).format("YYYY-MM-DD"),
                  });
                  next();
                },
                () =>
                  resolve({
                    total: arrData.length,
                    response,
                  })
              );
            } else {
              return resolve({
                total: arrData.length,
                response: [],
              });
            }
          }
        } else {
          return resolve({
            total: 0,
            response: [],
          });
        }
      } catch (ex) {
        console.error(ex);
        return resolve({
          total: 0,
          response: [],
        });
      }
    });
  },
  fakeTransaction(input, context) {
    return new Promise(async (resolve) => {
      try {
        if (auth.isHuman(context)) {
          const { error, data } = await commonFunc.findByAttribute(
            { _id: mongoose.Types.ObjectId(context.user._id) },
            User
          );
          if (error || !data) {
            return resolve({
              message: "Something went wrong!",
              severity: "error",
            });
          } else {
            const response = await this.fetchAccountDetails(context);
            const {
              accountType,
              cardName,
              savingsAccountName,
              dateLowerBound = "",
              dateUpperBound = "",
              amountLowerBound = 1,
              amountUpperBound = 1,
              noOfTxn = 10,
            } = input;
            if (
              response.accountType.length > 0 &&
              dateLowerBound &&
              dateUpperBound &&
              accountType &&
              (cardName || savingsAccountName)
            ) {
              let fkAccountTypeId = response.accountType.find(
                (x) => x.name.toLowerCase() === accountType.toLowerCase()
              );
              let fkCardId = "";
              let fkSavingsAccountId = "";
              if (fkAccountTypeId) {
                fkAccountTypeId = fkAccountTypeId._id.toString();
              }
              if (cardName.toLowerCase()) {
                fkCardId = response.cards.find(
                  (x) => x.name.toLowerCase() === cardName.toLowerCase()
                );
                if (fkCardId) {
                  fkCardId = fkCardId._id.toString();
                }
              } else if (savingsAccountName.toLowerCase()) {
                fkSavingsAccountId = response.accounts.find(
                  (x) =>
                    x.name.toLowerCase() === savingsAccountName.toLowerCase()
                );
                if (fkSavingsAccountId) {
                  fkSavingsAccountId = fkSavingsAccountId._id.toString();
                }
              }
              if (fkAccountTypeId && (fkCardId || fkSavingsAccountId)) {
                const arrData = Array(noOfTxn)
                  .fill()
                  .map((_, i) => i);
                const arrDate = faker.dateBetween(
                  dateLowerBound,
                  dateUpperBound
                );
                if (arrData.length > 0 && arrDate.length > 0) {
                  return asyncLoop(
                    arrData,
                    async (_, next) => {
                      const obj = {
                        txnType: faker.getRandTxnType(),
                        fkAccountTypeId,
                        fkCardId,
                        fkSavingsAccountId,
                        amount: faker.amount(
                          amountLowerBound,
                          amountUpperBound
                        ),
                        remark: faker.text(10),
                        paymentAt:
                          arrDate[Math.floor(Math.random() * arrDate.length)],
                      };
                      await this.makeTransaction(obj, context);
                      next();
                    },
                    () =>
                      resolve({
                        message: "Transcation has been completed",
                        severity: "success",
                      })
                  );
                } else {
                  return resolve({
                    message:
                      "Please enter date range and number of transactions.",
                    severity: "error",
                  });
                }
              } else {
                return resolve({
                  message: "Data does not exist.",
                  severity: "error",
                });
              }
            } else {
              return resolve({
                message: "A/c type does not exist.",
                severity: "error",
              });
            }
          }
        } else {
          return resolve({
            message: "Sorry, You are not authorized.",
            severity: "error",
          });
        }
      } catch (ex) {
        console.error(ex);
        return resolve({
          message: "Something went wrong!",
          severity: "error",
        });
      }
    });
  },
};
