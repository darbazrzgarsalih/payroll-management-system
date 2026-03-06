import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Document from '../models/Document.Model.js';
import { BadRequestError, InternalServerError, NotFoundError } from '../utils/Error.Classes.js';
import { logAudit } from '../utils/Audit.Logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.join(__dirname, '..', '..', 'documents');
if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });


const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, DOCS_DIR),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.xlsx', '.csv', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`File type not allowed: ${ext}`));
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, 
});


export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) return next(new BadRequestError('No file uploaded'));
        const { employeeID, type, name, description, expiryDate, isConfidential } = req.body;

        if (!employeeID || !name) {
            fs.unlinkSync(req.file.path); 
            return next(new BadRequestError('employeeID and name are required'));
        }
        if (!mongoose.Types.ObjectId.isValid(employeeID)) {
            fs.unlinkSync(req.file.path);
            return next(new BadRequestError('Invalid employee ID'));
        }

        const relPath = path.relative(path.join(__dirname, '..', '..'), req.file.path);

        const document = await Document.create({
            employeeID,
            type: type || 'other',
            name: name.trim(),
            description,
            fileUrl: relPath,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            expiryDate: expiryDate || null,
            isConfidential: isConfidential === 'true',
            uploadedBy: req.user._id,
            createdBy: req.user._id,
            updatedBy: req.user._id,
        });

        await logAudit({ req, action: 'UPLOAD_DOCUMENT', entity: 'Document', entityID: document._id, newValue: { name, employeeID } });

        return res.status(201).json({ success: true, message: 'Document uploaded', document });
    } catch (error) {
        console.error('[uploadDocument]', error);
        return next(new InternalServerError('Could not upload document'));
    }
};


export const getEmployeeDocuments = async (req, res, next) => {
    try {
        const { employeeID } = req.params;
        if (!mongoose.Types.ObjectId.isValid(employeeID)) return next(new BadRequestError('Invalid employee ID'));

        const documents = await Document.find({ employeeID })
            .sort({ createdAt: -1 })
            .populate('uploadedBy', 'username');

        return res.status(200).json({ success: true, documents });
    } catch (error) {
        return next(new InternalServerError('Could not fetch documents'));
    }
};


export const downloadDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return next(new BadRequestError('Invalid ID'));

        const document = await Document.findById(id);
        if (!document) return next(new NotFoundError('Document not found'));

        const absPath = path.resolve(path.join(__dirname, '..', '..'), document.fileUrl);
        if (!fs.existsSync(absPath)) return next(new NotFoundError('File not found on disk'));

        const ext = path.extname(document.fileUrl);
        const safeFilename = `${document.name.replace(/[^a-z0-9]/gi, '_')}${ext}`;
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
        res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
        fs.createReadStream(absPath).pipe(res);
    } catch (error) {
        return next(new InternalServerError('Could not download document'));
    }
};


export const deleteDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return next(new BadRequestError('Invalid ID'));

        const document = await Document.findByIdAndDelete(id);
        if (!document) return next(new NotFoundError('Document not found'));

        
        try {
            const absPath = path.resolve(path.join(__dirname, '..', '..'), document.fileUrl);
            if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
        } catch (e) {
            console.warn('[deleteDocument] Could not delete file from disk:', e.message);
        }

        await logAudit({ req, action: 'DELETE_DOCUMENT', entity: 'Document', entityID: id, oldValue: { name: document.name } });

        return res.status(200).json({ success: true, message: 'Document deleted' });
    } catch (error) {
        return next(new InternalServerError('Could not delete document'));
    }
};
