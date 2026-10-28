import express from "express";
import { ENV } from "./config/env.ts";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors"
import userRoutes from "./routes/userRoutes.ts"
import listingRoutes from "./routes/listingRoutes.ts"
import vehicleRoutes from "./routes/vehicleRoutes.ts"

const app = express()

app.use(cors({origin:ENV.FRONTEND_URL, credentials: true}))
app.use(clerkMiddleware())
app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to the carSmx API Powered by Clerk, Drizzle ORM and PostgreSQL",
        endpoints: {
            users: "/api/users",
            listings: "/api/listings",
            vehicles: "/api/vehicles"
        }
    })
})

app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes)
app.use("/api/vehicles", vehicleRoutes)

app.listen(ENV.PORT, () => {
    console.log(`Server running on port ${ENV.PORT}`)
})

