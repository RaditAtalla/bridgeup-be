const express = require("express")
const supabase = require("../supabase/config")
const authMiddleware = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/", authMiddleware, async (req, res) => {
    const token = req.userToken

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser(token)

        const { data, error } = await supabase
            .from("notification")
            .select()
            .or(`receiver_id.eq.${user.id},status.eq.system`)

        if (error) {
            return res.status(400).send({ success: false, msg: error.message })
        }

        res.status(200).send({ success: true, notifications: data })
    } catch (error) {
        res.status(500).send({ success: false, msg: "Internal server error" })
    }
})

module.exports = router
