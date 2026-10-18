## What & why

<!-- What does this PR change, and why? Link the issue if there is one. -->

## Type

- [ ] Feature
- [ ] Bug fix
- [ ] Chore / refactor / dependencies
- [ ] Release (`develop` → `main`)

## How it was tested

<!-- Steps to verify, e.g. "build a resume → checkout with Stripe test card → download PDF". -->

## Screenshots

<!-- For UI or resume-template changes: before / after. Delete if not applicable. -->

## Checklist

- [ ] Branched from `develop` and targets `develop` (only release PRs target `main`)
- [ ] `npm run lint`, `npm run typecheck` and `npm run build` pass locally
- [ ] Schema changes are in a new file under `supabase/migrations/` (no edits to applied migrations)
- [ ] New env vars are added to `.env.example` and Vercel
- [ ] Resume templates still use inline styles only and render correctly in the PDF
- [ ] No secrets, keys or real user data committed
