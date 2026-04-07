-- Seed data for Cvolt
-- Run after schema.sql

insert into public.templates (name, slug, thumbnail_url, is_active, category) values
  ('Clean', 'clean', '/templates/clean.png', true, 'clean'),
  ('Modern', 'modern', '/templates/modern.png', true, 'modern'),
  ('Creative', 'creative', '/templates/creative.png', true, 'creative')
on conflict (slug) do nothing;
