const express = require("express")
const supabase = require("../supabase/config")
const authMiddleware = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/user", async (req, res) => {
    const { query } = req.query
    // TODO: add rating filter
    try {
        const { data, error } = await supabase
            .from("user")
            .select(`id, username, fullName, profilePic`)
            .or(`username.ilike.%${query}%,fullName.ilike.%${query}%}`)

        if (error) {
            return res.status(400).send({ success: false, msg: error.message })
        }

        res.status(200).send({ success: true, result: data })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

router.post("/activity", async (req, res) => {
    const { query } = req.query
    // TODO: add category filter
    try {
        const { data, error } = await supabase
            .from("activity")
            .select()
            .or(`name.ilike.%${query}%`)

        if (error) {
            return res.status(400).send({ success: false, msg: error.message })
        }

        res.status(200).send({ success: true, result: data })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

module.exports = router
