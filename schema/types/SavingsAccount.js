module.exports = `
input savingAccountInput {
    _id:String
    name:String!
    requiredAmount:Int
    status:String!
}

type allSavingsAccount {
    response:[nameType]
}

type findSavingsAccountByIdResponse {
    hasError:Boolean
    response:nameType
}

type savingsAccountListResponse {
    total:Int
    response:[nameStatusType]
}

type Mutation {
    createSavingsAccount(input:savingAccountInput):generalFormResponse
    updateSavingsAccount(input:savingAccountInput):generalFormResponse
    removeSavingsAccount(input:idInput):generalResponse
}

type Query {
    savingsAccountList(input:nameTypeSearch):savingsAccountListResponse
    findSavingsAccountById(input:idInput):findSavingsAccountByIdResponse
    findAllSavingsAccount(input:statusInput):allSavingsAccount
}
`;
