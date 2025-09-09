const express = require("express")
const supabase = require("../supabase/config")
const authMiddleware = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/", authMiddleware, async (req, res) => {
    const { subject, content } = req.body
    const token = req.userToken

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser(token)

        const { error } = await supabase
            .from("user_report")
            .insert({ subject, content, created_by: user.id })

        if (error) {
            return res.status(400).send({ success: false, msg: error.message })
        }

        res.status(200).send({ success: true, msg: "Report sent" })
    } catch (error) {
        res.status(500).send({ msg: "internal server error" })
    }
})

module.exports = router
