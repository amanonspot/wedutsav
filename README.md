# Wedutsav Form -> Google Sheets

This repo contains:

- `index.html`: form UI that collects `name` and all question entries.
- `google-apps-script/Code.gs`: Google Apps Script code that stores submissions in Google Sheets.

## 1) Create Google Sheet

1. Create a new Google Sheet.
2. Keep the first sheet name as `Form Responses 1` (or change `SHEET_NAME` in `Code.gs`).

## 2) Add Apps Script

1. In Google Sheet, open `Extensions -> Apps Script`.
2. Replace default script with code from `google-apps-script/Code.gs`.
3. Save.

## 3) Deploy Apps Script as Web App

1. Click `Deploy -> New deployment`.
2. Select type: `Web app`.
3. Execute as: `Me`.
4. Who has access: `Anyone`.
5. Click `Deploy` and authorize access.
6. Copy the Web App URL (ends with `/exec`).

## 4) Connect HTML Form

1. Open `index.html`.
2. Replace:

```js
const GOOGLE_SCRIPT_WEB_APP_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
```

with your deployed Apps Script URL.

## 5) Use Form

1. Open `index.html` in browser.
2. Fill name and answers.
3. Click submit.
4. Check Google Sheet: each question answer is written into its own column.

## Data format stored in sheet

- `Timestamp`: server-side save time.
- `SubmittedAtISO`: client timestamp.
- `Name`: user name.
- `EntriesJSON`: full JSON backup of all answers.
- `Q01...Q23` columns: one answer per question (readable format).
