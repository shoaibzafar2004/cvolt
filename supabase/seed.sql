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
  ('Bold Photo',     'bold-photo',     '/templates/bold-photo.png',     true, 'modern'),
  ('Pro Sidebar',    'pro-sidebar',    '/templates/pro-sidebar.png',    true, 'clean'),
  ('Soft Portrait',  'soft-portrait',  '/templates/soft-portrait.png',  true, 'clean'),
  ('Geometric',      'geometric',      '/templates/geometric.png',      true, 'clean'),
  ('Bold Header',    'bold-header',    '/templates/bold-header.png',    true, 'modern'),
  ('Editorial',      'editorial',      '/templates/editorial.png',      true, 'clean'),
  ('Columnar',       'columnar',       '/templates/columnar.png',       true, 'clean')
on conflict (slug) do nothing;
