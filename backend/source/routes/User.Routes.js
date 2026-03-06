import express from 'express'
import { authMiddleware } from '.././middlewares/Auth.Middleware.js'
import { authorize } from '.././middlewares/Authorize.Middleware.js'
import { PERMISSIONS } from '../role/permissions.js'
import { createUser, deleteUser, getAllUsers, getSingleUser, updateUser, updateUserRole, updateUserStatus } from '../controllers/User.Controller.js'
import { getUserProfile } from '../controllers/Auth.Controller.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const AVATAR_DIR = path.join(__dirname, '..', '..', 'documents', 'users')
if (!fs.existsSync(AVATAR_DIR)) fs.mkdirSync(AVATAR_DIR, { recursive: true })

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, AVATAR_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase()
        cb(null, `user_avatar_${Date.now()}${ext}`)
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['.png', '.jpg', '.jpeg']
        const ext = path.extname(file.originalname).toLowerCase()
        if (allowed.includes(ext)) cb(null, true)
        else cb(new Error('Invalid file type for avatar'))
    }
})

const router = express.Router()

router.get('/', authMiddleware, authorize(PERMISSIONS.USER_VIEW), getAllUsers)
router.get('/profile', authMiddleware, authorize(PERMISSIONS.USER_VIEW), getUserProfile)
router.get('/:id', authMiddleware, authorize(PERMISSIONS.USER_VIEW), getSingleUser)
router.post('/create', authMiddleware, authorize(PERMISSIONS.USER_CREATE), upload.single('avatar'), createUser)
router.put('/update/:id', authMiddleware, authorize(PERMISSIONS.USER_UPDATE), upload.single('avatar'), updateUser)
router.patch('/status/:id', authMiddleware, authorize(PERMISSIONS.USER_UPDATE), updateUserStatus)
router.patch('/role/:id', authMiddleware, authorize(PERMISSIONS.USER_UPDATE), updateUserRole)
router.delete('/delete/:id', authMiddleware, authorize(PERMISSIONS.USER_DELETE), deleteUser)

export default router