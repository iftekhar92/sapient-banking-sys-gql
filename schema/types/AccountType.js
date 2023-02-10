module.exports = `
type allAccounts {
    response:[nameType]
}

type findAccountTypeByIdResponse {
    hasError:Boolean
    response:nameType
}

type accountTypeListResponse {
    total:Int
    response:[nameStatusType]
}

type Mutation {
    createAccountType(input:nameInput):generalFormResponse
    updateAccountType(input:nameInput):generalFormResponse
    removeAccountType(input:idInput):generalResponse
}

type Query {
    accountTypeList(input:nameTypeSearch):accountTypeListResponse
    findAccountTypeById(input:idInput):findAccountTypeByIdResponse
    findAllAccounts(input:statusInput):allAccounts
}
`;
