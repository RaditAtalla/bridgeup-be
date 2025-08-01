const express = require("express")
const supabase = require("./supabase/config.js")
require("dotenv").config()

const app = express()

app.get("/", (req, res) => {
    res.send("Hello ASE")
})

app.get("/food", async (req, res) => {
    const { data, error } = await supabase.from("food").select()

    if (!error) {
        return res.send(data)
    }

    res.send(error)
})

app.listen(3000, () => {
    console.log("running on http://localhost:3000")
})
