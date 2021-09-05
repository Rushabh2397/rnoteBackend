import Note from '../models/note'
import async from 'async'



module.exports = {

    /**
     * Api to add user note.
     * @param {title,note} req  
    */
    addNote: (req, res) => {
        async.waterfall([
            (nextCall) => {
                if (!req.body.title || !req.body.note) {
                    return nextCall({
                        message: 'Title/Note is required.'
                    })
                }
                nextCall(null, req.body)
            },
            (body, nextCall) => {
                let newNote = new Note({
                    user_id: req.user._id,
                    title: body.title,
                    note: body.note,
                    color: body.color
                })
                newNote.save((err, note) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, note)
                })
            }
        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed to add note.'
                })
            }

            res.json({
                status: 'success',
                message: 'Note added successfully.',
                data: response
            })
        })
    },

    /**
     * Api to update note details. 
    */
    updateNote: (req, res) => {
        async.waterfall([
            (nextCall) => {
                Note.findOne({ user_id: req.user._id }, (err, note) => {
                    if (err) {
                        nextCall(err)
                    } else if (note) {
                        nextCall(null, req.body, note)
                    } else {
                        nextCall({
                            message: "Note doesn't exist."
                        })
                    }
                })
            },
            (body, note, nextCall) => {
                Note.findByIdAndUpdate(
                    note._id,
                    {
                        title: body.title ? body.title : note.title,
                        note: body.note ? body.note : note.note,
                        color: body.color ? body.color : note.color,
                        is_active: body.is_active ? body.is_active : note.is_active,
                        is_pinned: body.is_pinned ? body.is_pinned : note.is_pinned,
                        is_archived: body.is_archived ? body.is_archived : note.is_archived
                    },
                    { new: true },
                    (err, updatedNote) => {
                        if (err) {
                            return nextCall(err)
                        }
                        nextCall(null, updatedNote)
                    }
                )
            }
        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed to update note.'
                })
            }

            res.json({
                status: 'success',
                message: 'Note updated successfully.',
                data: response
            })
        })
    },

    /**
     * Api to get user's all notes.
     * @param {field,value,search} req  
    */
    getAllNotes: (req, res) => {
        async.waterfall([
            (nextCall) => {
                let aggregateQuery = [];

                aggregateQuery.push({
                    $match: {
                        [req.body.field]: req.body.value
                    }
                })

                if (req.body.search) {
                    let regex = new RegExp(req.body.search, 'i');
                    let search = {
                        $or: [
                            { title: regex },
                            { color: regex }
                        ]
                    }

                    aggregateQuery.push({
                        $match: search
                    })
                }

                aggregateQuery.push({
                    $sort: { created_at: -1 }
                })

                aggregateQuery.push({
                    $group: {
                        _id: null,
                        noteCount: { $sum: 1 },
                        notes: {
                            $push: {
                                "_id": "$_id",
                                "title": "$title",
                                "note": "$note",
                                "color": "$color",
                                "is_pinned": "$is_pinned",
                                "is_archived": "$is_archived",
                                "is_active": "$is_active"
                            }
                        }
                    }
                })

                Note.aggrgate(aggregateQuery).exec((err, noteList) => {
                    if (err) {
                        return nextCall(err)
                    }
                    noteList = noteList.length > 0 ? noteList[0] : { noteCount: 0, notes: [] }
                    nextCall(null, noteList)
                })
            }
        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed to get note list.'
                })
            }

            res.json({
                status: 'success',
                message: 'Note list.',
                data: response
            })
        })
    },
    
    /**
     * Api to delete user's note permanently.
     * @param {note_id} req  
    */
    deleteNote: (req, res) => {
        async.waterfall([
            (nextCall) => {
                if (!req.body.note_id) {
                    return nextCall({
                        message: 'Note id is required.'
                    })
                }
                nextCall(null, req.body)
            },
            (body, nextCall) => {
                Note.findByIdAndDelete(body.note_id, (err) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null,null)
                })
            }
        ], (err, response) => { 
            if(err){
                res.status(400).json({
                    message : (err && err.message) || 'Oops! Failed to delete note.'
                })
            }

            res.json({
                status :'success',
                message : 'Note deleted successfully.'
            })
        })
    }
}