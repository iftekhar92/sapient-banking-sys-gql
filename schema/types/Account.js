module.exports = `
input openAccountInput {
    fkAccountTypeId:String!
    fkSavingsAccountId:String
    fkCardId:String
    type:String!
}

input accountInput {
    status:String
}

input makeTransactionInput {
    txnType:String!
    fkAccountTypeId:String!
    fkCardId:String
    fkSavingsAccountId:String
    amount:Int!
    remark:String
}

input transactionHistoryInput {
    key:String!
    value:String!
    type:String!
    pageLimit:Int
    pageNo:Int
    search:searchPayment
}

input fakeTransactionInput {
    accountType:String!
    cardName:String
    savingsAccountName:String
    amountLowerBound:Int
    amountUpperBound:Int
    noOfTxn:Int
    dateLowerBound:String!
    dateUpperBound:String!
}

input searchPayment{
    startDate:String
    endDate:String
}

type openAccountResponse {
    error:[error]
    severity:String
    message:String
    isAccountCreated:Boolean
    isCardCreated:Boolean
    type:String
}

type savingsAccountResponse {
    message:String
    severity:String
    response:[savingsAccountFields]
}

type creditCardsAccountResponse {
    message:String
    severity:String
    response:[creditCardsAccountFields]
}

type creditCardsAccountFields {
    _id:String
    selection:String
    cardNumber:String
    cardName:String
    limitAmount:String
    availableAmount:String
    outstandingAmount:String
    status:String
    startDate:String
    expiryDate:String
}

type savingsAccountFields {
    _id:String
    selection:String
    accountNumber:String
    fkSavingsAccount:String
    availableAmount:String
    startDate:String
    status:String
}

type accountDetailResponse {
    message:String
    severity:String
    accountType:[options]
    cards:[options]
    accounts:[options]
}

type transactionHistoryResponse {
    total:Int
    response:[txnFields]
}

type txnFields {
    txnId:String
    txnType:String
    accountNumber:String
    cardName:String
    accountInfo:String
    amount:String
    remark:String
    status:String
    paymentAt:String
}

type Mutation {
    openAccount(input:openAccountInput):openAccountResponse
    makeTransaction(input:makeTransactionInput):generalFormResponse
    removeSavingsAccount(input:idInput):generalResponse
    removeAccountAndPaymentHistory:generalResponse
    fakeTransaction(input:fakeTransactionInput):generalResponse
}
type Query {
    savingsAccount(input:accountInput):savingsAccountResponse
    creditCardsAccount(input:accountInput):creditCardsAccountResponse
    fetchAccountDetails:accountDetailResponse
    transactionHistory(input:transactionHistoryInput):transactionHistoryResponse
}
`;
