import express from "express";
import { ENV } from "./config/env.ts";
import { clerkMiddleware } from "@clerk/express";


const app = express()

app.use(clerkMiddleware())

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to the carSmx API Powered by Clerk, Drizzle ORM and PostgreSQL"
    })
})

app.listen(ENV.PORT, () => {
    console.log(`Server running on port ${ENV.PORT}`)
})