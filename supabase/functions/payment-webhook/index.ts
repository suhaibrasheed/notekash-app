import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  // Allow OPTIONS preflight request for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const signature = req.headers.get("x-razorpay-signature")
    if (!signature) {
      return new Response("Missing signature", { status: 400 })
    }

    const bodyBuffer = await req.arrayBuffer()
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? ""

    console.log(`[DEBUG] Secret length: ${webhookSecret.length}, Secret value: "${webhookSecret}"`)

    if (!webhookSecret) {
      console.error("CRITICAL: RAZORPAY_WEBHOOK_SECRET is not set.")
      return new Response("Webhook secret not configured", { status: 500 })
    }

    // Verify Razorpay webhook signature using native Deno Web Crypto
    const encoder = new TextEncoder()
    const cryptoKey = await globalThis.crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )
    const signatureBuffer = await globalThis.crypto.subtle.sign("HMAC", cryptoKey, bodyBuffer)
    const hashArray = Array.from(new Uint8Array(signatureBuffer))
    const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    console.log(`[DEBUG] Expected: ${expectedSignature}`)
    console.log(`[DEBUG] Got:      ${signature}`)

    if (expectedSignature !== signature) {
      console.error("Signature mismatch!")
      return new Response(JSON.stringify({
        error: "Invalid signature",
        expected: expectedSignature,
        got: signature,
        secretLength: webhookSecret.length
      }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      })
    }

    const payload = JSON.parse(new TextDecoder().decode(bodyBuffer))
    const event = payload.event
    console.log(`[DEBUG] Event received: ${event}`)

    // Handle both authorized and captured events
    if (event === "payment.captured" || event === "payment.authorized") {
      const payment = payload.payload.payment.entity
      const userId = payment.notes?.user_id
      const tier = payment.notes?.tier

      console.log(`[DEBUG] Payment notes - user_id: ${userId}, tier: ${tier}`)

      if (!userId || !tier) {
        console.error("User metadata missing in payment notes:", payment.notes)
        return new Response("Missing user metadata", { status: 400 })
      }

      // Validate UUID format for userId
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(userId)) {
        console.error("Invalid user_id format (must be UUID):", userId)
        return new Response("Invalid user_id format", { status: 400 })
      }

      // Initialize Supabase Admin Client
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      )

      // Compute membership expiry
      let proExpiry = new Date()
      if (tier === "Bronze") {
        proExpiry.setMonth(proExpiry.getMonth() + 3)
      } else if (tier === "Silver") {
        proExpiry.setMonth(proExpiry.getMonth() + 6)
      } else if (tier === "Gold") {
        proExpiry.setFullYear(proExpiry.getFullYear() + 1)
      } else if (tier === "Diamond") {
        proExpiry.setFullYear(proExpiry.getFullYear() + 100)
      }

      console.log(`Upgrading User: ${userId} to Tier: ${tier} until ${proExpiry.toISOString()}`)

      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ pro_expires_at: proExpiry.toISOString() })
        .eq("id", userId)

      if (error) {
        console.error("Database profile update failed:", error)
        return new Response("Database update error", { status: 500 })
      }

      return new Response(JSON.stringify({ success: true, message: `Upgraded to ${tier}` }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        status: 200,
      })
    }

    return new Response("Event unhandled", { status: 200 })

  } catch (err: any) {
    console.error("Server Error:", err)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    })
  }
})
