const express = require("express")
const supabase = require("../supabase/config")
const authMiddleware = require("../middleware/authMiddleware")

const router = express.Router()

// TODO: Figure out how to store PICs in todo table

module.exports = router
