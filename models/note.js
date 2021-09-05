import { Schema, model } from 'mongoose'
import moment from 'moment'



const noteSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId
    },
    title: {
        type: String
    },
    note: {
        type: String
    },
    is_active: {
        type: Number,
        default: 1
    },
    is_pinned: {
        type: Number,
        default: 0
    },
    is_archived: {
        type: Number,
        default: 0
    },
    color: {
        type: String
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }
}, { collection: 'note' })

noteSchema.pre('save', function (next) {
    let note = this;
    note.created_at = note.updated_at = moment().unix() * 1000;
    next()
})

module.exports = model(noteSchema.options.collection, noteSchema)