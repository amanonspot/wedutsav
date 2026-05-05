const SHEET_NAME = "Form Responses 1";

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error("Sheet not found: " + SHEET_NAME);
    }

    ensureHeader_(sheet);

    const payload = parsePayload_(e);
    const name = String(payload.name || "").trim();
    const entries = payload.entries || [];
    const submittedAt = payload.submittedAt || new Date().toISOString();

    if (!name) {
      throw new Error("Missing name.");
    }

    sheet.appendRow([
      new Date(),
      submittedAt,
      name,
      JSON.stringify(entries)
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, message: "Saved" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function parsePayload_(e) {
  if (!e) return {};

  if (e.parameter && e.parameter.payload) {
    return JSON.parse(e.parameter.payload);
  }

  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (_err) {
      return {};
    }
  }

  return {};
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.getRange(1, 1, 1, 4).setValues([[
    "Timestamp",
    "SubmittedAtISO",
    "Name",
    "EntriesJSON"
  ]]);
}
