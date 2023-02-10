module.exports = `
type accountSummaryResponse {
    accounts:accountTypeFields
    profile:profileTypeFields
    weeklyMonthlyYearly:weeklyMonthlyYearlyField
    txnWeeklyMonthlyYearly:txnWeeklyMonthlyYearlyFields
}

type weeklyMonthlyYearlyField {
    savingsLastWeek:datasetLableReport
    savingsLastMonth:datasetLableReport
    savingsLastYear:datasetLableReport
    creditCardLastweek:datasetLableReport
    creditCardLastMonth:datasetLableReport
    creditCardLastYear:datasetLableReport
}

type txnWeeklyMonthlyYearlyFields {
    savingsLastWeek:datasetLableTxn
    savingsLastMonth:datasetLableTxn
    savingsLastYear:datasetLableTxn
}

type datasetLableReport {
    labels: [String]
    datasets:[datesetFields]
}

type datasetLableTxn {
    labels:[String]
    datasets:[datesetTxnFields]
}

type accountTypeFields {
    savings: [accountFields]
    credit: [accountFields]
}
type profileTypeFields {
    name:String
    profilePic:String
    txnDetails:[txnDetailFields]
}

type accountFields {
    _id:String
    title:String
    amount:String
    overDueTitle: String
    overDueAmount:String
    accountInfo: String
    hasPayNowBtn:Boolean
}

type txnDetailFields {
    _id:String
    title:String
    link:String
    date: String
}

type datesetFields {
    label:String
    backgroundColor:String
    borderColor:String
    pointBackgroundColor:String
    pointBorderColor:String
    data: [Int]
}

type datesetTxnFields {
    backgroundColor:[String]
    data: [Int]
}

type Query {
    accountSummary:accountSummaryResponse
}
`;
