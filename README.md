# Order email notifications

Recipients are configured in `index.ts`:
- Cabdiraxmanmohamud95@gmail.com
- director@ebyancosmetics.com
- abdalla@ebyancosmetics.com
- anasfr181@gmail.com
- ebyansoap@ebyancosmetics.com

Required Supabase Edge Function secrets:
- `RESEND_API_KEY`
- `ORDER_EMAIL_FROM` (optional; default: orders@ebyancosmetics.com)

Supabase provides `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions.

Deploy as `notify_order_v2`. The customer checkout already calls this function after the order and payment proof have been saved. Email failure is logged and does not undo a successful order.
