-- Contact table hardening — run once in the Supabase SQL editor.
--
-- The form validates in the browser, but a direct POST to the REST endpoint can skip
-- that. These constraints make the database enforce the same limits.
--
-- Verified separately: anonymous SELECT on this table returns 401 (RLS is on), so the
-- publishable key can insert but not read.

alter table public.contact_messages
  add constraint contact_name_len    check (char_length(name) between 1 and 120),
  add constraint contact_email_len   check (char_length(email) between 5 and 254),
  add constraint contact_company_len check (company is null or char_length(company) <= 160),
  add constraint contact_message_len check (char_length(message) between 10 and 4000);

-- If the table ever grows a status column or an admin view, keep reads behind an
-- authenticated policy and leave only INSERT open to the anon role.
