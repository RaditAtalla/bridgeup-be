const supabase = require("../supabase/config")

async function authMiddleware(req, res, next) {
    try {
        const token = req.cookies.access_token

        if (!token) {
            return res.status(401).send({ success: false, msg: "Unauthorized" })
        }

        const { error } = await supabase.auth.getUser(token)

        if (error) {
            const refreshToken = req.cookies.refresh_token
            if (!refreshToken) {
                return res
                    .status(401)
                    .send({ success: false, msg: "Unauthorized" })
            }

            const { data: refreshData, error: refreshError } =
                await supabase.auth.refreshSession({
                    refresh_token: refreshToken,
                })

            if (refreshError) {
                return res
                    .status(401)
                    .send({ success: false, msg: "Invalid refresh token" })
            }

            res.cookie("access_token", refreshData.session.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
                maxAge: 1000 * 60 * 60,
            })

            res.cookie("refresh_token", refreshData.session.refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
                maxAge: 1000 * 60 * 60 * 24 * 30,
            })

            token = refreshData.session.access_token
        }

        req.userToken = token
        next()
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message })
    }
}

module.exports = authMiddleware
