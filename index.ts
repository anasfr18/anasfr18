import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const recipients = [
  'Cabdiraxmanmohamud95@gmail.com',
  'director@ebyancosmetics.com',
  'abdalla@ebyancosmetics.com',
  'anasfr181@gmail.com',
  'ebyansoap@ebyancosmetics.com',
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) throw new Error('Missing authorization')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendKey = Deno.env.get('RESEND_API_KEY')
    const from = Deno.env.get('ORDER_EMAIL_FROM') || 'Ebyan Orders <orders@ebyancosmetics.com>'
    if (!resendKey) throw new Error('RESEND_API_KEY is not configured')

    // Verify the caller's Supabase session.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    const body = await req.json()
    const orderId = Number(body?.order_id)
    if (!Number.isInteger(orderId) || orderId <= 0) throw new Error('Invalid order_id')

    const admin = createClient(supabaseUrl, serviceKey)
    const { data: order, error: orderError } = await admin.from('orders').select('*').eq('id', orderId).single()
    if (orderError || !order) throw new Error('Order not found')
    if (String(order.user_id) !== String(user.id)) throw new Error('Forbidden')

    const { data: items, error: itemsError } = await admin
      .from('order_items')
      .select('product_name, quantity, unit_price')
      .eq('order_id', orderId)
    if (itemsError) throw itemsError

    const rows = (items || []).map((item: any) =>
      `<tr><td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(item.product_name || '')}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">KSh ${Number(item.unit_price || 0).toLocaleString()}</td></tr>`
    ).join('')

    const proof = order.payment_proof_path ? 'Uploaded' : 'Not uploaded'
    const payment = order.payment_method === 'cash_on_delivery' ? 'Pay on Delivery' : 'M-Pesa'
    const orderNumber = order.order_number || order.id

    const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#243128">
      <h2 style="color:#234d32">New Ebyan Order #${escapeHtml(String(orderNumber))}</h2>
      <p>A customer has placed an order on the Ebyan Cosmetics website.</p>
      <h3>Customer</h3>
      <p><b>Name:</b> ${escapeHtml(order.customer_name || '')}<br>
      <b>Phone:</b> ${escapeHtml(order.customer_phone || '')}<br>
      <b>Email:</b> ${escapeHtml(order.customer_email || '')}<br>
      <b>Address:</b> ${escapeHtml(order.delivery_address || '')}<br>
      <b>Town/Area:</b> ${escapeHtml(order.town_area || '')}</p>
      <h3>Order</h3>
      <table style="border-collapse:collapse;width:100%;max-width:650px"><thead><tr><th style="text-align:left;padding:8px;border-bottom:2px solid #234d32">Product</th><th style="padding:8px;border-bottom:2px solid #234d32">Qty</th><th style="text-align:right;padding:8px;border-bottom:2px solid #234d32">Price</th></tr></thead><tbody>${rows}</tbody></table>
      <p><b>Subtotal:</b> KSh ${Number(order.subtotal || 0).toLocaleString()}<br>
      <b>Delivery:</b> KSh ${Number(order.delivery_fee || 0).toLocaleString()}<br>
      <b>Total:</b> KSh ${Number(order.total || 0).toLocaleString()}<br>
      <b>Payment:</b> ${escapeHtml(payment)}<br>
      <b>Payment proof:</b> ${escapeHtml(proof)}<br>
      <b>Status:</b> ${escapeHtml(String(order.status || ''))}</p>
      </body></html>`

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: recipients, subject: `New Ebyan order #${orderNumber} — KSh ${Number(order.total || 0).toLocaleString()}`, html }),
    })
    if (!response.ok) throw new Error(`Email provider error: ${await response.text()}`)

    return new Response(JSON.stringify({ ok: true, recipients }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char] || char))
}
