import type { Request, Response} from "express"
import * as queries from "../db/queries.ts";
import { getAuth } from "@clerk/express";

export async function syncUser(req: Request, res:Response) {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({error: "Unauthorized"});

        const { first_name, last_name, email, phone, image_url} = req.body;

        if(!first_name || !last_name || !email){
            return res.status(400).json({ error: "first name, last name and email are required"})
        }

        const user = await queries.upsertUser({
            id: userId,
            first_name,
            last_name,
            email,
            phone,
            image_url
        })

        return res.status(200).json(user)
    } catch(error) {
        console.error("Error Syncing user:", error)
        res.status(500).json({error: 'Failed syncing user'})
    }
}