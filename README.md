# Expense Form App (Netlify)

This project recreates the uploaded expense sheet as an editable, print-friendly web form.

Features:
- Print-first form matching your spreadsheet structure.
- Save form button with persistent storage on Netlify.
- Saved Pages screen to browse all saved forms.
- Re-open any saved page for editing and printing.

## Tech
- Static frontend (HTML/CSS/JS) in `public`
- Netlify Functions in `netlify/functions`
- Netlify Blobs (`@netlify/blobs`) as persistent data store

## Run locally

1. Install dependencies:
   npm install
2. Start local Netlify dev server:
   npm run dev
3. Open the local URL shown by Netlify CLI.

## Deploy to Netlify

1. Push this folder to GitHub.
2. In Netlify, create a new site from that repo.
3. Build settings are read from `netlify.toml`.
4. After deploy:
   - Form page: `/index.html`
   - Saved pages: `/records.html`

## Auto deploy with GitHub Actions

This repository includes a workflow at `.github/workflows/netlify-deploy.yml`.

It deploys to Netlify automatically on every push to the `main` branch.

Add these GitHub repository secrets before using it:

1. `NETLIFY_AUTH_TOKEN`
   - Create in Netlify: User settings -> Applications -> Personal access tokens.
2. `NETLIFY_SITE_ID`
   - Find in Netlify: Site configuration -> General -> Site details -> Site ID.

After adding both secrets, push a commit to `main` and the deployment runs automatically.

## Data model

Each saved record stores:
- Header fields: name, designation, month, area
- 31 daily rows: date, from, to, T.A, D.A, N.STAY, expense
- Summary fields: basic salary, mobile, other, grand total, words
- Metadata: id, createdAt, updatedAt

## Notes

- This app intentionally keeps the same printable structure and labels from the uploaded sheet, including "Monthly Expenses Summery" as written in the template.
- To print the current record, open the form and click Print.
