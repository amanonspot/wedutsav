const SHEET_NAME = "Form Responses 1";
const FIXED_HEADERS = ["Timestamp", "SubmittedAtISO", "Name", "EntriesJSON"];

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error("Sheet not found: " + SHEET_NAME);
    }

    const payload = parsePayload_(e);
    const name = String(payload.name || "").trim();
    const entries = payload.entries || [];
    const submittedAt = payload.submittedAt || new Date().toISOString();

    if (!name) {
      throw new Error("Missing name.");
    }

    const questionHeaders = buildQuestionHeaders_(entries);
    const headerMap = ensureHeadersAndGetMap_(sheet, questionHeaders);
    const row = new Array(sheet.getLastColumn()).fill("");

    row[headerMap.Timestamp - 1] = new Date();
    row[headerMap.SubmittedAtISO - 1] = submittedAt;
    row[headerMap.Name - 1] = name;
    row[headerMap.EntriesJSON - 1] = JSON.stringify(entries);

    entries.forEach(function(entry, index) {
      const questionHeader = questionHeaders[index];
      const col = headerMap[questionHeader];
      if (col) {
        row[col - 1] = String(entry.answer || "");
      }
    });

    sheet.appendRow(row);

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

function buildQuestionHeaders_(entries) {
  return entries.map(function(entry, index) {
    const num = String(index + 1).padStart(2, "0");
    return "Q" + num + " | " + String(entry.question || "");
  });
}

function ensureHeadersAndGetMap_(sheet, questionHeaders) {
  let lastCol = sheet.getLastColumn();
  let headers = [];

  if (lastCol > 0) {
    headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  }

  // Keep first 4 fixed columns stable across submissions.
  sheet.getRange(1, 1, 1, FIXED_HEADERS.length).setValues([FIXED_HEADERS]);

  if (headers.length < FIXED_HEADERS.length) {
    headers = FIXED_HEADERS.slice();
    lastCol = FIXED_HEADERS.length;
  } else {
    FIXED_HEADERS.forEach(function(h, i) {
      headers[i] = h;
    });
  }

  questionHeaders.forEach(function(qHeader) {
    if (headers.indexOf(qHeader) === -1) {
      headers.push(qHeader);
    }
  });

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  const headerMap = {};
  headers.forEach(function(header, idx) {
    headerMap[String(header)] = idx + 1;
  });
  return headerMap;
}
