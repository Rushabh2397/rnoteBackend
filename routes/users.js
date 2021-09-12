import express from 'express'
import NoteController from '../controllers/note'
import UserController from '../controllers/user'
import isUserAuthenticated from '../middlewares/isUserAuthenticated'
import isUserPresent from '../middlewares/isUserPresent'

const router = express.Router();


router.all('/api/*', isUserAuthenticated, isUserPresent)

router.post('/auth/login',UserController.login)
router.post('/auth/register',UserController.register)
router.post('/api/add_note',NoteController.addNote)
router.post('/api/get_all_notes',NoteController.getAllNotes)
router.post('/api/delete_note',NoteController.deleteNote)
router.put('/api/update_note',NoteController.updateNote)

module.exports = router;
