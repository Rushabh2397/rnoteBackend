import User from '../models/user'
import async from 'async'
import jwt from 'jsonwebtoken'
import config from '../config'
import { decrypt } from '../utils/encryDecry'

module.exports = {

    /**
     * Api to register user
     * @param {email,password} req
    */
    register : (req, res) => {
        async.waterfall([
            (nextCall) => {
                if (!req.body.email || !req.body.password) {
                    return nextCall({
                        message: 'All fields are compulsory.'
                    })
                }
                nextCall(null, req.body)
            },
            (body, nextCall) => {
                User.findOne({ email: body.email }, (err, user) => {
                    if (err) {
                        nextCall(err)
                    } else if (user) {
                        nextCall({
                            message: 'User already exist.'
                        })
                    } else {
                        nextCall(null, body)
                    }
                })
            },
            (body, nextCall) => {
                let user = new User(body)

                user.save((err, newUser) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, user)
                })
            },
            (user, nextCall) => {
                user = user.toJSON();
                let payload = {
                    _id: user._id,
                    email: user.email
                }
                user.token = jwt.sign(payload, config.secret, {
                    expiresIn: 24 * 24 * 60  // Expires in 24 hrs
                })
                delete user.password
                nextCall(null, user)
            }

        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed to register user.'
                })
            }

            res.json({
                status: 'success',
                message: 'User registerd successfully.',
                data: response
            })
        })
    },
    
    
    /**
     * Api to login user.
     * @param {email,password} req 
    */
    login: (req, res) => {
        async.waterfall([
            (nextCall) => {
                if (!req.body.email || !req.body.password) {
                    return nextCall({
                        message: 'All fields are compulsory.'
                    })
                }
                nextCall(null, req.body)
            },
            (body, nextCall) => {
                User.findOne({ email: body.email }, (err, user) => {
                    if (err) {
                        return nextCall(err)
                    } else if (user) {
                        let checkPassowrd = decrypt(body.password, user.password)
                        if (checkPassowrd) {
                            nextCall(null, user)
                        } else {
                            nextCall({
                                message: 'Please check your email/password.'
                            })
                        }
                    } else {
                        nextCall({
                            message: "User doesn't exist."
                        })
                    }
                })
            },
            (user,nextCall)=>{
                user = user.toJSON();
                let payload = {
                    _id: user._id,
                    email: user.email
                }
                user.token = jwt.sign(payload, config.secret, {
                    expiresIn: 24 * 24 * 60  // Expires in 24 hrs
                })
                delete user.password
                nextCall(null,user)
            }
        ], (err, response) => { 
            if(err){
                return res.status(400).json({
                    message : ( err && err.message ) || 'Oops! Failed to login.'
                })
            }

            res.json({
                status :'success',
                message :'User logged in successful.',
                data : response
            })
        })
    }


}