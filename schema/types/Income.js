module.exports = `
input incomeInput {
    _id:String
    name:String!
    from:Int
    to:Int!
    status:String!
}

type allIncomes {
    response:[nameStatusType]
}

type findIncomeByIdResponse {
    hasError:Boolean
    response:nameStatusType
}

type incomeListResponse {
    total:Int
    response:[nameStatusType]
}

type Mutation {
    createIncome(input:incomeInput):generalFormResponse
    updateIncome(input:incomeInput):generalFormResponse
    removeIncome(input:idInput):generalResponse
}

type Query {
    incomeList(input:nameTypeSearch):incomeListResponse
    findIncomeById(input:idInput):findIncomeByIdResponse
    findAllIncomes(input:statusInput):allIncomes
}
`;
