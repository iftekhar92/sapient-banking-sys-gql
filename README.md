A Mini Banking System
===========================

## Introduction
This application is used for backend for a mini banking system.
## Dependencies
 - Nodejs >=16.x.x or above
 - Mongodb >=4.x.x or above

## How to install Node and Mongodb
This application requires node and mongo to be installed on your system. Please check [upstream documentation](https://nodejs.org/en/download/) & [docs.mongodb.com](https://docs.mongodb.com/manual/administration/install-community)
for how to install node & mongo on your system.

## Install PM2
```bash
  npm install pm2 -g
  ````

## Development build
In application root path run following commands
```bash
cd ROOT-DIR
npm install
````
## Start mongo db
After installing mongo you should start mongo
 - Linux: sudo service mongod start
 - Window: 
    - Create a folder in any drive i.e. D:\\data
    - Open command prompt
    - Go C:\Program Files\MongoDB\Server\4.0\bin
    - mongod.exe --dbpath="D:\data" and then enter. You may see running status

## Start Application
```bash
cd ROOT-DIR
pm2 start ecosystem.config.js --env development
````

## Restart Application
```bash
cd ROOT-DIR
pm2 restart ecosystem.config.js --env development
````

## Environment variables
Environment variables is the main mechanism of manipulating application settings. Currently application recognizes
following environment variables: ecosystem.config.js

| Variable           | Default value                     | Description             |
| ------------------ | ----------------------------------| ----------------------- |
| HOST               | localhost                         | Address to listen on    |
| PORT               | 4001                              | Port to listen on       |
| DB_NAME            | bankingS                          |                         |
| SECERET_KEY        | anyrandomstring                   |                         |
| TOKEN_EXPIRE_IN    | 30d                               |                         |

http://localhost:4001/graphql

<h1>Setup required data</h1>

### Create Govt Proof
```
mutation{
  createProofType(input:{
    name:"PAN Card",
    status:"ACTIVE"
  }){
    error{
      key
      value
    }
    message
    severity
  }
}
```
### Create Incomes
```
mutation {
  createIncome(
    input: { name: "Basic", from: 200000, to: 500000, status: "ACTIVE" }
  ) {
    error {
      key
      value
    }
    severity
    message
  }
}

mutation {
  createIncome(
    input: { name: "Medium", from: 500000, to: 1000000, status: "ACTIVE" }
  ) {
    error {
      key
      value
    }
    severity
    message
  }
}

mutation {
  createIncome(
    input: { name: "High", from: 1000000, to: 2000000, status: "ACTIVE" }
  ) {
    error {
      key
      value
    }
    severity
    message
  }
}
```

### Income list

```
query{
  incomeList(input:{
    pageLimit:10,
    pageNo:0,
    search:{}
  }){
    response{
      _id,
      name
    }
  }
}
```

### Govt Proof list

```
query{
  proofTypeList(input:{
    pageLimit:10,
    pageNo:0,
    search:{}
  }){
    response{
      _id,
      name
    }
  }
}
```

### SIGNUP (ADMIN)
```
mutation{
  signup(input:{
    fullName:"Admin",
    email:"iphtekhar.k@publicissapient.com",
    userType:"ADMIN",
    phone:"7678124926",
    fkIncomeId:"63c24fa09858d730c71cdca5",
    fkGovId:"63c24c9e9858d730c71cdc99",
    govIdProof:"xyz.jpg",
    occupation:"S/w Engineer",
    address:"New Delhi"
  }){
    error{
      key
      value
    }
    severity
    message
  }
}
```

Now, click this [link](http://localhost:4000/set/password) to set password.
After seting Password, [loggedIn](http://localhost:4000/login)

- Create [Account type](http://localhost:4000/admin/account-type/create)
  - Name: Credit Card
  - Name: Savings
- Create [Savings Account type](http://localhost:4000/admin/savings-account/create)
  - Name: Regular, Amount: 0
  - Name: Premium, Amount: 10000
- Create [Card type](http://localhost:4000/admin/card-type/create)
  - Name: Credit Card
  - Name: Debit Card
- Create Card that will be available to the customer [Card](http://localhost:4000/admin/cards/create)
  - GOLD
    - Name: Gold
    - Annual Income: Basic(Select in dropdown)
    - Account Type: Credit Card (Select from dropdown)
    - Card Type: Credit Card (Select from dropdown)
    - Validity Number of Year: 5
    - Limit: 50000
    - Annual Charges: 250
    - status: Active (Select from dropdown)
  - Platinum
    - Name: Platinum
    - Annual Income: Medium(Select in dropdown)
    - Account Type: Credit Card (Select from dropdown)
    - Card Type: Credit Card (Select from dropdown)
    - Validity Number of Year: 5
    - Limit: 150000
    - Annual Charges: 1000
    - status: Active (Select from dropdown)
  - Debit Card
    - Name: Debit Card
    - Annual Income: Medium(Select in dropdown)
    - Account Type: Debit Card (Select from dropdown)
    - Card Type: Debit Card (Select from dropdown)
    - Validity Number of Year: 5
    - Limit: 0
    - Annual Charges: 0
    - status: Active (Select from dropdown)

Now, Customer can be [Signup](http://localhost:4000/signup) and can be used above configuration:

## Bulk Transactions

### Payment Savings Premium Account
```
mutation {
  fakeTransaction(input:{
    accountType:"Savings",
    cardName:"",
    savingsAccountName:"Premium",
    amountLowerBound: 500,
    amountUpperBound:1000,
    noOfTxn:15,
    dateLowerBound:"2023-01-07",
    dateUpperBound:"2023-01-14"
  }){
    hasError
    message
    severity
  }
}
```
### Payment Savings Regular Account
```
mutation {
  fakeTransaction(input:{
    accountType:"Savings",
    cardName:"",
    savingsAccountName:"Regular",
    amountLowerBound: 500,
    amountUpperBound:1000,
    noOfTxn:15,
    dateLowerBound:"2023-01-07",
    dateUpperBound:"2023-01-14"
  }){
    hasError
    message
    severity
  }
}
```
### Payment Credit Account
```
mutation {
  fakeTransaction(input:{
    accountType:"Credit Card",
    cardName:"Gold",
    savingsAccountName:"",
    amountLowerBound: 500,
    amountUpperBound:1000,
    noOfTxn:15,
    dateLowerBound:"2023-01-07",
    dateUpperBound:"2023-01-14"
  }){
    hasError
    message
    severity
  }
}
```
### JWT token
```
{
  "authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjYzYzI1YjRjNzczODY1MjQzYjJjYTNjNSJ9LCJpYXQiOjE2NzM2ODE3NjIsImV4cCI6MTY3NjI3Mzc2Mn0.w7SSWTDkYMnApYSF-hlhBc_5Ra7RgaQBXAvRMqhkOBo"
}
```