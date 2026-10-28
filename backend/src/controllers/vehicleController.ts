import type { Request, Response } from "express";
import * as queries from "../db/queries.ts"

export async function getMakes(req:Request, res:Response) { 
    try {
        const makes = await queries.getMakes()
        return res.status(200).json(makes)
    } catch (error) {
        console.error("Error getting Makes", error);
        return res.status(500).json({ error: "Failed to get makes"})
    }    
}

export async function getModelsByMake(req: Request, res:Response) {
    try {
        const rawMakeId = req.params.makeId;
        if (typeof rawMakeId !== "string") {
            return res.status(400).json({ error: "Invalid make ID" });
        }

        const makeId = Number(rawMakeId);
        if (!Number.isInteger(makeId) || makeId <= 0) {
            return res.status(400).json({ error: "Invalid make ID" });
        }
    
        const models = await queries.getModelsByMake(makeId);
        return res.status(200).json(models)
    } catch (error) {
        console.error("Error getting Models", error);
        return res.status(500).json({ error: "Failed to get models"})
    }
}

export async function getVehiclesByModel(req: Request, res: Response){
    try {
        const rawModelId = req.params.modelId;
        if(typeof rawModelId !== 'string'){
            return res.status(400).json({error: "Invalid model ID"});
        }
        const modelId = Number(rawModelId);
        if(!Number.isInteger(modelId) || modelId <= 0){
            return res.status(400).json({error: "Invalid Make ID"});
        }

        const vehicles = await queries.getVehiclesByModel(modelId);
        return res.status(200).json(vehicles)
    } catch (error) {
        console.error("Error getting Vehicles", error);
        return res.status(500).json({ error: "Failed to get Vehicles"})
    }
}