import express from 'express'
import { authMiddleware } from '../middlewares/Auth.Middleware.js'
import { authorize } from '../middlewares/Authorize.Middleware.js'
import { PERMISSIONS } from '../role/permissions.js'
import { getAuditLogs } from '../controllers/AuditLog.Controller.js'

const router = express.Router()

router.get('/', authMiddleware, authorize(PERMISSIONS.AUDITLOG_VIEW), getAuditLogs)

export default router