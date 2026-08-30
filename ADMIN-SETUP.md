# Ebyan Store Admin

Open `admin.html` for the customer-store admin panel.

It uses the same Supabase project and Supabase email/password authentication as the storefront.
For production product/order/customer management, create Supabase tables with Row Level Security and an admin role; never put a service-role key in frontend files.

The current product editor stores product edits in browser localStorage until a secure database/API layer is connected.
