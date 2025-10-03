const express = require("express")
const supabase = require("../supabase/config")
const authMiddleware = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/", authMiddleware, async (req, res) => {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser(req.userToken)

        const { data: profile, error } = await supabase
            .from("user")
            .select()
            .single()
            .eq("email", user.email)

        if (error) {
            return res.status(400).send({ success: false, msg: error.message })
        }

        res.status(200).send({
            success: true,
            msg: "Profile fetched",
            user: profile,
        })
    } catch (error) {
        res.status(500).send({ msg: "internal server error" })
    }
})

router.get("/:username", async (req, res) => {
    const { username } = req.params

    try {
        const { data, error } = await supabase
            .from("user")
            .select()
            .single()
            .eq("username", username)

        if (error) {
            return res.status(400).send({ success: false, msg: error.message })
        }

        res.status(200).send({ success: true, profile: data })
    } catch (error) {
        res.status(500).send({ msg: "internal server error" })
    }
})

router.get("/friend-requests", authMiddleware, async (req, res) => {
    const token = req.userToken

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser(token)

        const { data, error } = await supabase
            .from("friend_request")
            .select()
            .eq("receiver_id", user.id)

        if (error) {
            return res.status(400).send({ success: false, msg: error.message })
        }

        res.status(200).send({ success: true, friendRequests: data })
    } catch (error) {
        res.status(500).send({ msg: "internal server error" })
    }
})

router.get("/friends", authMiddleware, async (req, res) => {
    const token = req.userToken

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser(token)

        const { data, error } = await supabase
            .from("friendship")
            .select()
            .or(`receiver_id.eq.${user.id}, requester_id.eq.${user_id}`)

        if (error) {
            return res.status(400).send({ success: false, msg: error.message })
        }

        res.status(200).send({ success: true, friends: data })
    } catch (error) {
        res.status(500).send({ msg: "internal server error" })
    }
})

router.post("/friend-request/:receiverId", authMiddleware, async (req, res) => {
    const token = req.userToken
    const { receiverId } = req.params

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser(token)

        const { error } = await supabase
            .from("friend_request")
            .insert({ requester_id: user.id, receiver_id: receiverId })

        if (error) {
            return res.status(400).send({ success: false, msg: error.message })
        }

        res.status(200).send({ success: true, msg: "Friend request sent" })
    } catch (error) {
        res.status(500).send({ msg: "internal server error" })
    }
})

router.post("/:userId/review", authMiddleware, async (req, res) => {
    const token = req.userToken
    const { rating, review } = req.body
    const { userId } = req.params

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser(token)

        const { error } = await supabase
            .from("user_rating_review")
            .insert({ rating, review, created_by: user.id, user_id: userId })

        if (error) {
            return res.status(400).send({ success: false, msg: error.message })
        }

        res.status(200).send({ success: true, msg: "Review n rating added" })
    } catch (error) {
        res.status(500).send({ msg: "internal server error" })
    }
})

router.patch(
    "/friend-request/:requesterId",
    authMiddleware,
    async (req, res) => {
        const { requesterId } = req.params
        const { status } = req.body
        const token = req.userToken

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser(token)

            const { error } = await supabase
                .from("friend_request")
                .update({ status })
                .eq("requester_id", requesterId)
                .eq("receiver_id", user.id)

            if (error) {
                return res
                    .status(400)
                    .send({ success: false, msg: error.message })
            }

            res.status(200).send({
                success: true,
                msg: "Friend request accepted",
                data,
            })
        } catch (error) {
            res.status(500).send({ msg: "internal server error" })
        }
    },
)

router.patch("/", authMiddleware, async (req, res) => {
    const update = req.body

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser(req.userToken)

        await supabase.from("user").update(update).eq("id", user.id)

        res.status(200).send({ success: true, msg: "Profile updated" })
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

router.delete("/", authMiddleware, async (req, res) => {
    const token = req.userToken

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser(token)

        const { error } = await supabase.auth.admin.deleteUser(user.id)

        if (error) {
            return res.status(400).send({ success: false, msg: error.message })
        }

        res.status(200).send({ success: true, msg: "Account deleted" })
    } catch (error) {
        res.status(500).send({ msg: "internal server error" })
    }
})

router.delete("friend/:friendId", authMiddleware, async (req, res) => {
    const token = req.userToken
    const { friendId } = req.params

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser(token)

        const { error } = await supabase
            .from("friendship")
            .delete()
            .or(
                `and(requester_id.eq.${user.id},receiver_id.eq.${friendId}),and(requester_id.eq.${friendId},receiver_id.eq.${user.id})`,
            )

        if (error) {
            return res.status(400).send({ success: false, msg: error.message })
        }

        res.status(200).send({ success: true, msg: "Friend removed" })
    } catch (error) {
        res.status(500).send({ msg: "internal server error" })
    }
})

module.exports = router
