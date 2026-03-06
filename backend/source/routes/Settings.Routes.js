import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as SettingsController from '../controllers/Settings.Controller.js';
import { authMiddleware } from '../middlewares/Auth.Middleware.js';
import { authorize } from '../middlewares/Authorize.Middleware.js';
import { PERMISSIONS } from '../role/permissions.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_DIR = path.join(__dirname, '..', '..', 'documents', 'company');
if (!fs.existsSync(LOGO_DIR)) fs.mkdirSync(LOGO_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, LOGO_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `company_logo_${Date.now()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        const allowed = ['.png', '.jpg', '.jpeg', '.svg'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error('Invalid file type for logo'));
    },
});

const router = express.Router();

router.use(authMiddleware);

router.get('/', authorize(PERMISSIONS.SETTINGS_VIEW), SettingsController.getSettings);
router.patch('/', authorize(PERMISSIONS.SETTINGS_UPDATE), upload.single('logo'), SettingsController.updateSettings);

export default router;
