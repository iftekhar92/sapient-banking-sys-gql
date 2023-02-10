module.exports = `
input cardInput {
    _id:String
    name:String!
    fkIncomeId:String!
    fkAccountTypeId:String!
    fkCardTypeId:String!
    validityNoOfYear:Int!
    limitAmount:Int!
    annualCharge:Int!
    status:String!
}

type availableCardsResponse {
    response:types
}

type types {
    debitCard:[cardField]
    creditCard:[cardField]
}

type findCardByIdResponse {
    hasError:Boolean
    response:cardField
}

type cardListResponse {
    total:Int
    response:[cardField]
}

type Mutation {
    createCard(input:cardInput):generalFormResponse
    updateCard(input:cardInput):generalFormResponse
    removeCard(input:idInput):generalResponse
}

type Query {
    cardList(input:nameTypeSearch):cardListResponse
    findCardById(input:idInput):findCardByIdResponse
    findAvailableCards(input:statusInput):availableCardsResponse
}
`;
