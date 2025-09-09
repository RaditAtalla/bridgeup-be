const express = require("express")
const supabase = require("../supabase/config")
const authMiddleware = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("activity")
            .select(`*, user(email, fullName, username)`)

        if (error) {
            return res
                .status(400)
                .send({ success: false, msg: "Failed fetching activities" })
        }

        res.status(200).send({
            success: true,
            msg: "Fetched activities successfully",
            activities: data,
        })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

router.get("/by-me", authMiddleware, async (req, res) => {
    const token = req.userToken

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser(token)

        const { data, error } = await supabase
            .from("activity")
            .select()
            .eq("created_by", user.id)

        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Failed fetching activities by me",
            })
        }

        res.status(200).send({
            success: true,
            msg: "Activities fetched",
            activities: data,
        })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

router.get("/joined", authMiddleware, async (req, res) => {
    const token = req.userToken

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser(token)

        const { data: activities, error } = await supabase
            .from("activity_member")
            .select()
            .eq("user_id", user.id)

        if (error) {
            return res.status(400).send({ success: false, msg: error.message })
        }

        res.status(200).send({ success: true, activities })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

router.get("/:uuid", async (req, res) => {
    const { uuid } = req.params

    try {
        const { data, error } = await supabase
            .from("activity")
            .select(`*, user(email, fullName, username)`)
            .eq("id", uuid)

        if (error) {
            return res
                .status(400)
                .send({ success: false, msg: "Failed fetching activity" })
        }

        res.status(200).send({
            success: true,
            msg: "Fetched activity successfully",
            activity: data,
        })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

router.get("/:uuid", async (req, res) => {
    const { uuid } = req.params

    try {
        const { data, error } = await supabase
            .from("activity_member")
            .select()
            .eq("activity_id", uuid)

        if (error) {
            return res.status(400).send({ success: false, msg: error.message })
        }

        res.status(200).send({ success: true, members: data })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

router.post("/", authMiddleware, async (req, res) => {
    const { name, description, picture, category } = req.body
    const token = req.userToken

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser(token)

        const { error } = await supabase.from("activity").insert({
            name,
            description,
            picture,
            category,
            created_by: user.id,
        })

        if (error) {
            return res
                .status(400)
                .send({ success: false, msg: "Failed creating activity" })
        }

        res.status(200).send({ success: true, msg: "Activity created" })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

router.patch("/:uuid", authMiddleware, async (req, res) => {
    const { uuid } = req.params
    const { name, description, picture, category } = req.body
    const token = req.userToken

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser(token)

        const { data, error } = await supabase
            .from("activity")
            .update({
                name,
                description,
                picture,
                category,
            })
            .eq("id", uuid)
            .select()

        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Failed updating activity",
            })
        }

        // TODO: fix this
        if (user.id != data[0].created_by) {
            res.status(401).send({
                success: false,
                msg: "Unauthorized",
            })
        }

        res.status(200).send({
            success: true,
            msg: "Activity Updated",
            data: data[0].created_by,
        })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

router.delete("/:uuid", authMiddleware, async (req, res) => {
    const { uuid } = req.params
    const token = req.userToken

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser(token)

        const { error } = await supabase
            .from("activity")
            .delete()
            .eq("id", uuid)
            .eq("created_by", user.id)

        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Failed updating activity",
            })
        }

        res.status(200).send({
            success: true,
            msg: "Activity Deleted",
        })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

router.post("/:uuid/join", authMiddleware, async (req, res) => {
    const { uuid } = req.params
    const token = req.userToken

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser(token)

        const { data: activity, error: activityError } = await supabase
            .from("activity")
            .select()
            .single()
            .eq("id", uuid)

        if (activityError) {
            return res.status(400).send({
                success: false,
                msg: "Failed joining activity",
            })
        }

        if (activity.created_by == user.id) {
            return res.status(400).send({
                success: false,
                msg: "Creator cannot join their own activity",
            })
        }

        const { error: joinError } = await supabase
            .from("activity_member_request")
            .insert({ user_id: user.id, activity_id: uuid })

        if (joinError) {
            return res.status(400).send({
                success: false,
                msg: "Failed joining activity",
            })
        }

        res.status(200).send({
            success: true,
            msg: "Activity membership requested",
        })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

router.get("/:uuid/requesters", authMiddleware, async (req, res) => {
    const token = req.userToken
    const { uuid } = req.params

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser(token)

        const { data: requesters, error: requestersError } = await supabase
            .from("activity_member_request")
            .select() // TODO: inner join activity_member_request and user
            .eq("activity_id", uuid)

        if (requestersError) {
            return res.status(400).send({
                success: false,
                msg: requestersError.message,
            })
        }

        if (requesters.created_by == user.id) {
            return res.status(401).send({
                success: false,
                msg: "Lu yang punya hajatan wir",
            })
        }

        res.status(200).send({ success: true, requesters })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

router.patch("/:uuid/acc-requester", authMiddleware, async (req, res) => {
    const { uuid } = req.params
    const { status, user_id } = req.body

    try {
        const { error } = await supabase
            .from("activity_member_request")
            .update({ status })
            .eq("user_id", user_id)
            .eq("activity_id", uuid)

        if (error) {
            return res.status(400).send({ success: false, msg: error.message })
        }

        res.status(200).send({ success: true, msg: "Request status changed" })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

module.exports = router
