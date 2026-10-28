import { Router } from "express"
import { requireAuthentication } from "../middleware/requireAuthentication.ts"
import { syncUser } from "../controllers/userController.ts"


const router = Router()


// Api/users/sync
router.post("/sync", requireAuthentication, syncUser)

export default router;