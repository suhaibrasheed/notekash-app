import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    // 1. Authenticate the user via their JWT token
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } })
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } })
    }

    // 2. Get payment_id and tier from request body
    const { payment_id, tier } = await req.json()
    if (!payment_id || !tier) {
      return new Response(JSON.stringify({ error: "Missing payment_id or tier" }), { status: 400, headers: { "Content-Type": "application/json" } })
    }

    console.log(`Verifying payment ${payment_id} for user ${user.id}, tier: ${tier}`)

    // 3. Fetch payment from Razorpay API to verify it's real and captured
    const keyId = Deno.env.get("RAZORPAY_KEY_ID") ?? ""
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? ""
    const credentials = btoa(`${keyId}:${keySecret}`)

    const rzpResponse = await fetch(`https://api.razorpay.com/v1/payments/${payment_id}`, {
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json"
      }
    })

    if (!rzpResponse.ok) {
      const errText = await rzpResponse.text()
      console.error("Razorpay API error:", errText)
      return new Response(JSON.stringify({ error: "Failed to verify payment with Razorpay" }), { status: 400, headers: { "Content-Type": "application/json" } })
    }

    const payment = await rzpResponse.json()
    console.log(`Payment status: ${payment.status}, amount: ${payment.amount}`)

    // 4. Verify payment status is captured or authorized
    if (payment.status !== "captured" && payment.status !== "authorized") {
      return new Response(JSON.stringify({ error: `Payment not captured (status: ${payment.status})` }), { status: 400, headers: { "Content-Type": "application/json" } })
    }

    // 5. Verify the user_id in notes matches the authenticated user (security check)
    const paymentUserId = payment.notes?.user_id
    if (paymentUserId && paymentUserId !== user.id) {
      console.error(`User ID mismatch: notes says ${paymentUserId}, authenticated user is ${user.id}`)
      return new Response(JSON.stringify({ error: "Payment does not belong to this user" }), { status: 403, headers: { "Content-Type": "application/json" } })
    }

    // 6. Compute membership expiry based on tier
    const proExpiry = new Date()
    if (tier === "Bronze") {
      proExpiry.setMonth(proExpiry.getMonth() + 3)
    } else if (tier === "Silver") {
      proExpiry.setMonth(proExpiry.getMonth() + 6)
    } else if (tier === "Gold") {
      proExpiry.setFullYear(proExpiry.getFullYear() + 1)
    } else if (tier === "Diamond") {
      proExpiry.setFullYear(proExpiry.getFullYear() + 100)
    }

    // 7. Update profile using service role key (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    )

    const { error: dbError } = await supabaseAdmin
      .from("profiles")
      .update({ pro_expires_at: proExpiry.toISOString() })
      .eq("id", user.id)

    if (dbError) {
      console.error("Database update failed:", dbError)
      return new Response(JSON.stringify({ error: "Database update failed" }), { status: 500, headers: { "Content-Type": "application/json" } })
    }

    console.log(`Successfully upgraded user ${user.id} to ${tier} until ${proExpiry.toISOString()}`)
    return new Response(JSON.stringify({ success: true, message: `Upgraded to ${tier}` }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 200
    })

  } catch (err: any) {
    console.error("Server Error:", err)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    })
  }
})
