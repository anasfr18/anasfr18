EBYAN UNIVERSAL WEBSITE ADMIN

Included tools:
- Text & sections editor
- Image selector/preview
- Button labels and destinations
- Product add/edit/remove
- Product pricing (KSh 400 default)
- Page creator/editor
- Cart/store controls
- Ask Ebyan editor
- Customer-facing preview
- Admin authentication shell
- Supabase CMS schema for shared/global editing

IMPORTANT:
The browser editor stores drafts locally in this build. To make edits visible to every visitor, connect these controls to the supplied Supabase CMS tables and Storage with Row Level Security. Do not put a service-role key in frontend code.

Admin login:
Create an admin user in Supabase Authentication, then add that user's UUID to public.admin_users using SUPABASE-CMS-SETUP.sql.
Set the public Supabase URL and publishable/anon key in admin.html.
