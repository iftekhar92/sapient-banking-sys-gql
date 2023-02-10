module.exports = `
type authResponse{
    status:Boolean
    response:authFields
}

type authFields{
    _id:String
    fullName:String
    userType:String
    status:String
    profilePic:String
}
 
type Query {
    auth:authResponse
}
`;
