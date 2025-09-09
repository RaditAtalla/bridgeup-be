const express = require("express")
const supabase = require("../supabase/config")
const authMiddleware = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/register", async (req, res) => {
    try {
        const signUp = await supabase.auth.signUp({
            email: req.body.email,
            password: req.body.password,
        })

        if (signUp.error) {
            return res
                .status(401)
                .send({ success: false, msg: signUp.error.message })
        }

        res.status(200).send({
            success: true,
            msg: "Verification email sent",
        })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

router.post("/login", async (req, res) => {
    try {
        const { error } = await supabase.auth.signInWithPassword({
            email: req.body.email,
            password: req.body.password,
        })

        if (error) {
            return res.status(401).send({ success: false, msg: error.message })
        }

        res.cookie("refresh_token", signIn.data.session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 30,
        })

        res.cookie("access_token", signIn.data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60,
        })

        res.status(200).send({
            success: true,
            msg: "Login successful",
        })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

router.post("/logout", async (req, res) => {
    try {
        await supabase.auth.signOut({ scope: "local" })

        res.clearCookie("refresh_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        })

        res.clearCookie("access_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        })

        res.status(200).send({ success: true, msg: "Logged out successfuly" })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const token = req.cookies.access_token
        const { data, error } = await supabase.auth.getUser(token)

        if (error) {
            return res.status(401).send({ success: false, msg: error.message })
        }

        res.status(200).send({ success: true, user: data })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

router.post("/otp-request", async (req, res) => {
    try {
        const { email } = req.body
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: false },
        })

        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Failed sending reset password email: " + error.message,
            })
        }

        res.status(200).send({
            success: true,
            msg: "Reset password email sent successfully",
        })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

router.post("/otp-verification", async (req, res) => {
    try {
        const { otp, email } = req.body
        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: "email",
        })

        if (error) {
            return res.status(400).send({ success: false, msg: "OTP failed" })
        }

        res.status(200).send({ success: true, msg: "Verification successful" })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

router.post("/password-reset", async (req, res) => {
    try {
        const { error } = await supabase.auth.updateUser({
            email: req.body.email,
            password: req.body.newPassword,
        })

        if (error) {
            return res.status(400).send({
                success: false,
                msg: "Error resetting password: " + error.message,
            })
        }

        res.status(200).send({
            success: true,
            msg: "Reset password successful",
        })
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
})

module.exports = router
