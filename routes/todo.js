const express = require("express")
const supabase = require("../supabase/config")
const authMiddleware = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/:activityId", authMiddleware, async (req, res) => {
    const token = req.userToken
    const { activityId } = req.params
    const { date } = req.query || ""

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser(token)

        let query = supabase
            .from("todo")
            .select()
            .eq("activity_id", activityId)
            .eq("user_id", user.id)

        if (date) {
            query.eq("deadline", date)
        }

        const { data, error } = await query

        if (error) {
            return res.status(401).send({ success: false, msg: error.message })
        }

        res.status(200).send({ success: true, todos: data })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

router.post("/:activityId", authMiddleware, async (req, res) => {
    const { activityId } = req.params
    const { name, description, label, priority, deadline, pic } = req.body

    try {
        const { error } = await supabase.from("todo").insert({
            activity_id: activityId,
            name,
            description,
            label,
            priority,
            deadline,
            pic,
        })

        if (error) {
            return res.status(401).send({ success: false, msg: error.message })
        }

        res.status(200).send({ success: true, msg: "todo posted" })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

router.patch("/:todoId", authMiddleware, async (req, res) => {
    const update = req.body
    const { todoId } = req.params

    try {
        const { data, error } = await supabase
            .from("todo")
            .update(update)
            .eq("id", todoId)

        if (error) {
            return res.status(401).send({ success: false, msg: error.message })
        }

        res.status(200).send({ success: true, msg: "todo updated" })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

module.exports = router
