module.exports = `
input dummyUserInput {
    fullName:String!
    email:String!
    userType:String!
    phone:String
    occupation:String!
    address:String!
}

input signupInput {
    fullName:String!
    email:String!
    userType:String!
    phone:String
    fkIncomeId:String!
    occupation:String!
    address:String!
    fkGovId:String!
    govIdProof:String!
}

input emailWithKeyInput {
    email:String!
    key:String!
}

input setPasswordInput{
    token:String!
    key:String!
    password:String!
    confirmPassword:String!
}

input changePasswordInput {
    oldPassword:String!
    password:String!
    confirmPassword:String!
}

input loginlInput{
    email:String!
    password:String!
}

input updateProfileInput {
    fullName:String!
    phone:String!
    occupation:String!
    profilePic:String
}

type loginResponse{
    error:[error]
    message:String
    severity:String
    response:userFields
    token:String
}

type findDetailResponse {
    response:findDetailFields
}

type findDetailFields {
    fullName:String
    email:String
    phone:String
    fkIncomeId:String
    occupation:String
    address:String
    profilePic:String
}

type Mutation {
    dummyUser(input:dummyUserInput):generalFormResponse
    signup(input:signupInput):generalFormResponse
    setPassword(input:setPasswordInput):generalFormResponse
    changePassword(input:changePasswordInput):generalFormResponse
    updateProfile(input:updateProfileInput):generalFormResponse
}
type Query {
    getTokenToSetPassword(input:emailWithKeyInput):generalFormResponse
    login(input:loginlInput):loginResponse
    findDetail:findDetailResponse
}
`;
