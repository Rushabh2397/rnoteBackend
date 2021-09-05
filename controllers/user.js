import User from '../models/user'
import async from 'async'
import jwt from 'jsonwebtoken'
import config from '../config'

module.exports = {

    register = (req, res) => {
        async.waterfall([
            (nextCall) => {
                if (!req.body.email || !req.body.password) {
                    return nextCall({
                        message: 'Please provide all parameters.'
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
                nextCall(null,user)
            }

        ], (err, response) => { 
            if(err){
                return res.status(400).json({
                    message : (err && err.message) || 'Oops! Failed to register user.'
                })
            }

            res.json({
                status:'success',
                message: 'User registerd successfully.',
                data: response
            })
        })
    }
}