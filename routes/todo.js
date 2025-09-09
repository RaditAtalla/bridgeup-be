const express = require("express")
const supabase = require("../supabase/config")
const authMiddleware = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/:activityId", authMiddleware, async (req, res) => {
    const token = req.userToken
    const { activityId } = req.params

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser(token)

        const { data, error } = await supabase
            .from("todo")
            .select()
            .eq("activity_id", activityId)
            .eq("user_id", user.id)

        if (error) {
            return res.status(401).send({ success: false, msg: error.message })
        }

        res.status(200).send({ success: true, todos: data })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

module.exports = router
