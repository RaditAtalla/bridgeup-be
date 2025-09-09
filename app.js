const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
require("dotenv").config()

const app = express()
const authRoutes = require("./routes/auth")
const activityRoutes = require("./routes/activity")
const profileRoutes = require("./routes/profile")
const notificationRoutes = require("./routes/notification")
const todoRoutes = require("./routes/todo")

app.use(
    cors({
        credentials: true,
    }),
)
app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send("Hello BridgeUp backend")
})

app.use("/auth", authRoutes)
app.use("/activity", activityRoutes)
app.use("/profile", profileRoutes)
app.use("/notification", notificationRoutes)
app.use("/todo", todoRoutes)

app.listen(3000, () => {
    console.log("running on http://localhost:3000")
})
