module.exports = `
input idInput{
    _id:String!
}

input statusInput{
    status:String
}

input nameInput {
    _id:String
    name:String!
    status:String!
}

input nameTypeSearch {
    pageLimit:Int
    pageNo:Int
    search:nameSearchInput
}

input nameSearchInput {
    name:String
    status:String
}

type nameType {
    _id:String
    name:String
    requiredAmount:Int
    status:String
}

type nameStatusType {
    _id:String
    name:String
    requiredAmount:Int
    range:String
    from:Int
    to:Int
    status:String
    action:action
}

type cardField {
    _id:String
    id:Int
    name:String
    fkIncomeId:String
    annualIncome:String
    fkAccountTypeId:String
    accountType:String
    fkCardTypeId:String
    cardType:String
    validityNoOfYear:String
    limitAmount:Int
    annualCharge:Int
    status:String
    action:action
}

type cardTypeField {
    _id:String
    id:Int
    name:String
    fkIncomeId:String
    incomeRange:String
    limitAmount:Int
    annualCharge:Int
    status:String
    action:action
}

type userFields {
    id:Int
    fullName:String
    email:String
    phone: String
    userType:String
    fkIncomeId:String
    incomeRange:String
    occupation:String
    address:String
    fkGovId:String
    fkGovtIdName:String
    govIdProof:String
    profilePic:String
    accountInfo:[accountInfo]
    paymentHistory:[paymentHistory]
    status:String
    createdAt:String
    updatedAt:String
}

type accountInfo{
    _id: String
    fkAccountTypeId:String
    fkAccountTypeName:String
    fkCategoryId:String
    fkCategoryName:String
    fkCardTypeId:String
    fkCardTypeName:String
    cardNumber:Int,
    cvvNumber: Int
    limitAmount: Int
    availableAmount: Int
    outstandingAmount: Int
    startDate:String
    expiryDate:String
    status:String
    createdAt:String
    updatedAt:String
}

type paymentHistory{
    _id: String
    txn:String
    txnType:String
    terget:String
    remark:String
    status:String
    paymentAt:String
    paymentUpdatedAt:String
}

type error {
    key:String
    value:String
}
type generalFormResponse {
    error:[error]
    message:String
    severity:String
    token:String
}
type generalResponse {
    hasError:Boolean 
    message:String
    severity:String
}

type action {
    view:Boolean
    edit:Boolean
    remove:Boolean
}

type options {
    _id:String
    name:String
}
`;
