const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
require("dotenv").config()

const app = express()
const authRoutes = require("./routes/auth.js")

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

app.listen(3000, () => {
    console.log("running on http://localhost:3000")
})
