-- Each purchase owns its own resume.
--
-- resumes.purchased = false: the user's working draft(s) in /build.
-- resumes.purchased = true:  a copy made by the Stripe webhook for one payment
--   (linked through resume_snapshots.resume_id). Editing it never touches other
--   purchases or the draft.
--
-- payments.pdf_hash: hash of the resume content + template the stored PDF was
--   rendered from; a free re-edit regenerates the PDF when it no longer matches.

alter table public.resumes
  add column if not exists purchased boolean not null default false;

alter table public.payments
  add column if not exists pdf_hash text;

-- Existing purchases shared the user's draft resume. Give each one its own
-- resume rebuilt from its frozen snapshot, and point the snapshot at it.
do $$
declare
  r record;
  new_id uuid;
begin
  for r in
    select s.id as snapshot_id, s.snapshot_data as data, p.user_id
    from public.resume_snapshots s
    join public.payments p on p.id = s.payment_id
    join public.resumes cur on cur.id = s.resume_id
    where p.deleted_at is null
      and cur.purchased = false
  loop
    insert into public.resumes (user_id, title, personal_info, purchased)
    values (
      r.user_id,
      coalesce(nullif(r.data -> 'personalInfo' ->> 'name', '') || '''s Resume', 'My Resume'),
      coalesce(r.data -> 'personalInfo', '{}'::jsonb),
      true
    )
    returning id into new_id;

    insert into public.resume_sections (resume_id, section_type, content, display_order)
    select new_id, e ->> 'type', e -> 'content', coalesce((e ->> 'displayOrder')::int, 0)
    from jsonb_array_elements(coalesce(r.data -> 'sections', '[]'::jsonb)) e;

    update public.resume_snapshots set resume_id = new_id where id = r.snapshot_id;
  end loop;
end $$;
