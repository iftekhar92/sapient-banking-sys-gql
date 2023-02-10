const mongoose = require('mongoose')

const User = require('../models/User')

module.exports = {
    auth(context) {
        return new Promise((resolve) => {
            if (context.user) {
                User.findOne(
                    { _id: mongoose.Types.ObjectId(context.user._id) },
                    (error, response) => {
                        if (error || !response)
                            return resolve({ status: false, response: null })
                        return resolve({ status: true, response })
                    }
                )
            } else {
                return resolve({ status: false, response: null })
            }
        })
    },
    authorization(isAuthorization, context) {
        if (isAuthorization)
            return !!(context?.user?._id && context?.user?.userType === 'ADMIN')
        else return true
    },
    isHuman(context) {
        return !!(
            context?.user?._id &&
            (context?.user?.userType === 'ADMIN' ||
                context?.user?.userType === 'CUSTOMER')
        )
    },
}
