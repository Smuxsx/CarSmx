import type {
    Request,
    Response,
    NextFunction
} from "express"

import { getAuth } from "@clerk/express"

export const requireAuthentication = (req: Request, res: Response, next: NextFunction) => {
    const { isAuthenticated } = getAuth(req);

    if(!isAuthenticated) {
        return res.status(401).json({
            message: "Unathorized"
        })
    }
    next()
}