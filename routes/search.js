const express = require("express")
const supabase = require("../supabase/config")
const authMiddleware = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/user", async (req, res) => {
    const { query } = req.query

    try {
        const { data, error } = await supabase
            .from("user")
            .select(`username, fullName, profilePic`)
            .or(`username.ilike.%${query}%,fullName.ilike.%${query}%}`)

        if (error) {
            return res.status(400).send({ success: false, msg: error.message })
        }

        res.status(200).send({ success: true, result: data })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

module.exports = router
