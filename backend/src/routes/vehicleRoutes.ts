import { Router } from "express";
import * as vehicleController from "../controllers/vehicleController.ts"

const router = Router()

// GET /api/vehicles/make => get all the makes available
router.get("/makes", vehicleController.getMakes);

// GET /api/vehicles/model/:makeId
router.get("/makes/:makeId/models", vehicleController.getModelsByMake)

// GET /api/vehicles/:modelId
router.get("/models/:modelId/vehicles", vehicleController.getVehiclesByModel)

export default router;