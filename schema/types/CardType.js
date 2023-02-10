module.exports = `
type allCardTypes {
    response:[nameStatusType]
}

type findCardTypeByIdResponse {
    hasError:Boolean
    response:nameStatusType
}

type cardTypeListResponse {
    total:Int
    response:[nameStatusType]
}

type Mutation {
    createCardType(input:nameInput):generalFormResponse
    updateCardType(input:nameInput):generalFormResponse
    removeCardType(input:idInput):generalResponse
}

type Query {
    cardTypeList(input:nameTypeSearch):cardTypeListResponse
    findCardTypeById(input:idInput):findCardTypeByIdResponse
    findAllCardTypes(input:statusInput):allCardTypes
}
`;
