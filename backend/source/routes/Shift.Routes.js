import express from "express"
import { authMiddleware } from "../middlewares/Auth.Middleware.js"
import { authorize } from "../middlewares/Authorize.Middleware.js"
import { PERMISSIONS } from "../role/permissions.js"
import {
    createShift,
    getAllShifts,
    getSingleShift,
    updateShift,
    deactivateShift
} from "../controllers/Shift.Controller.js"

const router = express.Router()

router.get(
    "/",
    authMiddleware,
    authorize(PERMISSIONS.SHIFT_VIEW),
    getAllShifts
)

router.post(
    "/",
    authMiddleware,
    authorize(PERMISSIONS.SHIFT_CREATE),
    createShift
)


router.get(
    "/:id",
    authMiddleware,
    authorize(PERMISSIONS.SHIFT_VIEW),
    getSingleShift
)

router.put(
    "/:id",
    authMiddleware,
    authorize(PERMISSIONS.SHIFT_UPDATE),
    updateShift
)

router.patch(
    "/:id/deactivate",
    authMiddleware,
    authorize(PERMISSIONS.SHIFT_DELETE),
    deactivateShift
)

export default router