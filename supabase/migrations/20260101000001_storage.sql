-- Private bucket for generated resume PDFs (accessed via service role + signed URLs)
insert into storage.buckets (id, name, public)
values ('pdfs', 'pdfs', false)
on conflict (id) do nothing;
