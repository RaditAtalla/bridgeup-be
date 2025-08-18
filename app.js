const express = require("express")
const supabase = require("./supabase/config.js")
const cors = require("cors")
require("dotenv").config()

const app = express()

app.use(cors())

app.get("/", (req, res) => {
    res.send("Hello BridgeUp backend")
})

app.listen(3000, () => {
    console.log("running on http://localhost:3000")
})
