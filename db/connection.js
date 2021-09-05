import mongoose from 'mongoose'
import config from '../config'

let connection = mongoose.connect(config.connectionString, { useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connection.on('connected', () => {
    console.log("DB connected successfully.")
})

mongoose.connection.on('error', err => {
    console.log("DB ERROR:", err)
})

module.exports = connection
