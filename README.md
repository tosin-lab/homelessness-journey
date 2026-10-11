# Homelessness Journey: Housing Officer Guide

An interactive training web app for new homelessness and housing options officers in England. It walks through the full customer journey, from the first approach to the end of the main housing duty, reviews and appeals, explaining what the officer does at each stage, who is involved and the law behind it.

**Live site:** https://homelessness-journey.vercel.app

## Features

**Explore**
- Clickable flowchart of the whole journey, with a detail panel for every stage: plain-English summary, officer task checklist, roles, legal sections, timescales and an interview tip
- Highlight any role (front door, caseworker, TA officer, review officer and more) to see where it fits
- Seven case walkthroughs: prevention success, refugee, prison leaver, care leaver, a review that changes the decision, domestic abuse through to a settled home, and a refused private rented offer

**Practical tools**
- *Which duty applies?* step-by-step decision helper
- *Notice checker* for Section 8 and Section 21, updated for the Renters' Rights Act (1 May 2026)
- *Affordability calculator* with LHA shortfall
- *Deadline calculator*: day 56, review and appeal deadlines, 8-week review decision, 6-week B&B limit

**Learn**
- Quick check quiz on each stage
- 15-question knowledge test drawn from a question bank, with feedback
- Interview flashcards with model answer points

**Resources and polish**
- Decision letter checklist, glossary, official guidance links and helplines
- Site-wide search
- Trainer presentation mode (`/present`, arrow keys, F for full screen)
- Printable one-page handout (`/handout`)
- Invite-only accounts: sign in with email and password on any device, with progress saved to your account
- Keyboard and screen reader friendly, responsive on phones

## Tech

React 19, TypeScript, Vite, React Router, plus Firebase (Authentication and Firestore) for accounts and saved progress, and a small Vercel Routing Middleware (`middleware.ts`) that locks the site. Runs on free plans.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit and content integrity tests
npm run build    # production build in dist/
```

## Deploy

### 1. Push to GitHub

Create an empty **public** repository on GitHub called `homelessness-journey` (no README, no licence), then from this folder:

```bash
git init -b main          # skip if the folder is already a git repo
git add .
git commit -m "Homelessness Journey web app"
git remote add origin https://github.com/<your-username>/homelessness-journey.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. **Add New → Project**, then **Import** the `homelessness-journey` repository.
3. Vercel detects Vite automatically (settings are also in `vercel.json`). Click **Deploy**.
4. In about a minute you get a live URL such as `homelessness-journey.vercel.app`.

Every push to `main` now redeploys automatically, and pull requests get their own preview URL. To use your own domain, go to **Project → Settings → Domains**.

GitHub Actions (`.github/workflows/ci.yml`) runs the tests and a build on every push and pull request.

## Accounts (invite only)

The live site is locked. `middleware.ts` runs on Vercel's servers before any page or file is served and checks the visitor is signed in with Firebase, so nobody can see the content without an account. Trainees sign in with their email and a password, on any device, and their progress (stages explored, ticks, quiz scores, flashcards) is saved to their account.

Everything runs on free plans: Vercel Hobby and Firebase Spark.

### One-off setup (Firebase console, about 10 minutes)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com) (Google Analytics not needed).
2. **Add a web app** (the `</>` icon on the project overview). Copy the `firebaseConfig = { ... }` object it shows.
3. **Authentication → Get started → Sign-in method:** enable **Email/Password** (leave "Email link" off).
4. **Authentication → Settings:**
   - **User actions:** untick **Enable create (sign-up)** so only people you add can have accounts.
   - **Authorised domains:** add `homelessness-journey.vercel.app`.
5. **Firestore Database → Create database** (production mode, region `europe-west2` London). Then open **Rules**, paste in the contents of [`firestore.rules`](firestore.rules) and **Publish**.
6. In **Vercel → Environment Variables**, add `FIREBASE_CONFIG` and paste the config object from step 2. Then redeploy (or push to `main`).

If `FIREBASE_CONFIG` is missing, the site stays locked for everyone.

### Inviting and removing trainees

- **Invite:** Firebase console → **Authentication → Users → Add user**. Enter their email and any temporary password (they never need it). Tell them to go to the site and click **First time here, or forgotten your password?** They'll get an email to set their own password.
- **Remove:** in **Authentication → Users**, open the ⋮ menu next to them and **Disable account** (or delete it). They're locked out within the hour.
- Set-password emails come from Firebase's address and sometimes land in junk folders, so mention this when you invite people. You can change the email wording in **Authentication → Templates**.

The lock only applies on Vercel: `npm run dev` on your own computer runs without sign-in. To test sign-in locally, put `FIREBASE_CONFIG=...` in a `.env.local` file.

Keep this GitHub repository **private**, otherwise anyone could download the code and content directly.

## Updating the content

All content lives in `src/data/`:

| File | What it holds |
|------|---------------|
| `stages.ts` | Every stage of the journey, roles, flowchart arrows, key timescales and the "correct as at" date |
| `cases.ts` | Case walkthroughs |
| `dutyTree.ts` | Questions and results for *Which duty applies?* |
| `learning.ts` | Stage quizzes, extra test questions and flashcards |
| `glossary.ts`, `resources.ts` | Glossary, letter checklist, links and helplines |

The notice rules live in `src/lib/notice.ts`. Run `npm test` after editing: the tests check every link between stages, cases and the duty finder still points somewhere real.

When the law or guidance changes, update the content and `CONTENT_DATE` in `stages.ts`.

## Important

This is a training aid for England, correct as at October 2026 (Housing Act 1996 Part 7, as amended by the Homelessness Reduction Act 2017 and the Renters' Rights Act 2025). It is not legal advice. Always check the [Homelessness Code of Guidance](https://www.gov.uk/guidance/homelessness-code-of-guidance-for-local-authorities), [Shelter Legal](https://england.shelter.org.uk/professional_resources/legal) and your council's own policies.

## Licence

MIT. See [LICENSE](LICENSE).
