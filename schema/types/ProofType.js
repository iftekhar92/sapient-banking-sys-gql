module.exports = `
type allProofTypes {
    response:[nameType]
}

type findProofTypeByIdResponse {
    hasError:Boolean
    response:nameType
}

type proofTypeListResponse {
    total:Int
    response:[nameStatusType]
}

type Mutation {
    createProofType(input:nameInput):generalFormResponse
    updateProofType(input:nameInput):generalFormResponse
    removeProofType(input:idInput):generalResponse
}

type Query {
    proofTypeList(input:nameTypeSearch):proofTypeListResponse
    findProofTypeById(input:idInput):findProofTypeByIdResponse
    findAllProofTypes(input:statusInput):allProofTypes
}
`;
