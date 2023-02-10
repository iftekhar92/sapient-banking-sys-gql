'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const jwtDecode = require('jwt-decode');
const mongoose = require('mongoose');
const User = require('../models/User');

const IV_LENGTH = 16; // For AES, this is always 16

const encrypt = (text, KEY) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', new Buffer.from(KEY), iv);
    let encrypted = cipher.update(text);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

const decrypt = (text, KEY) => {
    const textParts = text.split(':');
    const iv = new Buffer.from(textParts.shift(), 'hex');
    const encryptedText = new Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', new Buffer.from(KEY), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

const generateToken = _id => jwt.sign({ data: { _id } }, process.env.SECERET_KEY, { expiresIn: process.env.TOKEN_EXPIRE_IN });

const tokenValidator = token => {
    const result = { status: false, message: 'Token is not valid' };
    try {
        const decoded = jwt.verify(token, process.env.SECERET_KEY);
        if (decoded) {
            result.status = true;
            result.message = 'Success';
        }
        return result;
    } catch (err) {
        return result;
    }
}

const tokenExtract = token => new Promise(resolve => {
    try {
        const payload = jwtDecode(token).data;
        if (payload._id) {
            User.findOne({ _id: mongoose.Types.ObjectId(payload._id) }, (error, response) => {
                if (error || !response) return resolve({ response: null });
                return resolve({ response });
            });
        } else {
            return resolve({ response: null });
        }
    }
    catch (error) {
        return resolve({ response: null });
    }
});

module.exports = { decrypt, encrypt, generateToken, tokenValidator, tokenExtract };