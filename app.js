const express = require("express")
require("dotenv").config()

const app = express()

app.get("/", (req, res) => {
    res.send("Hello ASE")
})

app.listen(3000, () => {
    console.log("running on http://localhost:3000")
})
