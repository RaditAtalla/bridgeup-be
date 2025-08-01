const { createClient } = require("@supabase/supabase-js")
require("dotenv").config()

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLIC_ANNON_KEY,
)

module.exports = supabase
