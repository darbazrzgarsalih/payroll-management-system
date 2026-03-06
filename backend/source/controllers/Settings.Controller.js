import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Settings from '../models/Settings.Model.js';
import { InternalServerError, NotFoundError } from '../utils/Error.Classes.js';
import { logAudit } from '../utils/Audit.Logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


export const getSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne().populate('updatedBy', 'username');


        if (!settings) {
            settings = await Settings.create({
                companyName: 'High Tech',
                companyTitle: 'PAYROLL MANAGEMENT SYSTEM',
            });
        }

        return res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error('[getSettings]', error);
        return next(new InternalServerError('Could not fetch settings'));
    }
};


export const updateSettings = async (req, res, next) => {
    try {
        let updateData = req.body;

        // If settings were sent as JSON string (from hooks with multipart)
        if (req.body.settings) {
            try {
                updateData = JSON.parse(req.body.settings);
            } catch (e) {
                console.warn('[updateSettings] Error parsing settings JSON:', e.message);
            }
        }

        if (req.file) {
            const relPath = path.relative(path.join(__dirname, '..', '..'), req.file.path);
            updateData.companyLogo = relPath;
        }

        let settings = await Settings.findOne();

        if (!settings) {
            settings = new Settings(updateData);
        } else {

            if (req.file && settings.companyLogo) {
                try {
                    const oldPath = path.resolve(path.join(__dirname, '..', '..'), settings.companyLogo);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                } catch (e) {
                    console.warn('[updateSettings] Could not delete old logo:', e.message);
                }
            }
            Object.assign(settings, updateData);
        }

        settings.updatedBy = req.user._id;
        await settings.save();

        await logAudit({
            req,
            action: 'UPDATE_SETTINGS',
            entity: 'Settings',
            entityID: settings._id,
            newValue: settings
        });

        return res.status(200).json({
            success: true,
            message: 'System settings updated successfully',
            settings
        });
    } catch (error) {
        console.error('[updateSettings]', error);
        return next(new InternalServerError('Could not update settings'));
    }
};
