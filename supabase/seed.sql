-- Seed data for Cvolt
-- Run after schema.sql

insert into public.templates (name, slug, thumbnail_url, is_active, category) values
  ('Clean',          'clean',          '/templates/clean.png',          true, 'clean'),
  ('Modern',         'modern',         '/templates/modern.png',         true, 'modern'),
  ('Creative',       'creative',       '/templates/creative.png',       true, 'creative'),
  ('Elegant',        'elegant',        '/templates/elegant.png',        true, 'clean'),
  ('Elegant Single', 'elegant-single', '/templates/elegant-single.png', true, 'clean'),
  ('Elegant Dark',   'elegant-dark',   '/templates/elegant-dark.png',   true, 'modern'),
  ('Elegant Banner', 'elegant-banner', '/templates/elegant-banner.png', true, 'modern'),
  ('Bold Photo',     'bold-photo',     '/templates/bold-photo.png',     true, 'modern')
on conflict (slug) do nothing;
