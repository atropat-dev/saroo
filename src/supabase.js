// supabase.js
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://yambhnxfsezxqsrbcubh.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbWJobnhmc2V6eHFzcmJjdWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAzOTI0MDksImV4cCI6MjAxNTk2ODQwOX0.p3N-_WyvduzU0TNT7x7bULpwVW-6otGBBVkayma5COo"

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
