/**
 * Fully Loaded — application intake (Google Apps Script web app).
 *
 * Receives applications from the site's /api/apply route, saves each applicant's photos to a
 * new folder in Drive, and appends one row per application to a Google Sheet.
 *
 * Setup (once):
 *   1. Create a Drive folder for applicant photos (keep it private) and a Google Sheet.
 *   2. script.google.com → New project → paste this file as Code.gs.
 *   3. Project Settings → Script properties:
 *        SECRET     long random string; same value as APPS_SCRIPT_SECRET on the site
 *        FOLDER_ID  id from the folder URL: drive.google.com/drive/folders/<FOLDER_ID>
 *        SHEET_ID   id from the sheet URL: docs.google.com/spreadsheets/d/<SHEET_ID>/edit
 *   4. Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone.
 *      ("Anyone" only lets the site reach the URL; requests without SECRET are rejected.)
 *   5. Copy the /exec URL into APPS_SCRIPT_URL on the site (.env.local and Netlify).
 *   After editing this file, Deploy → Manage deployments → Edit → New version, or the
 *   live URL keeps running the old code.
 */

var HEADERS = [
  "Submitted at", "Name", "Email", "Date of birth", "Event", "Event ID", "Photo folder",
  "Photo 1", "Photo 2", "Photo 3", "Photo 4", "Photo 5",
];

function doPost(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var body = JSON.parse(e.postData.contents);
    if (!body.secret || body.secret !== props.getProperty("SECRET")) {
      return json_({ ok: false, error: "Unauthorized" });
    }

    var root = DriveApp.getFolderById(props.getProperty("FOLDER_ID"));
    var folder = root.createFolder(
      body.submittedAt.slice(0, 10) + " — " + body.name + " — " + body.eventLabel
    );
    var photoLinks = (body.photos || []).slice(0, 5).map(function (photo) {
      var blob = Utilities.newBlob(Utilities.base64Decode(photo.data), photo.mimeType, photo.name);
      return folder.createFile(blob).getUrl();
    });

    var lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      var sheet = SpreadsheetApp.openById(props.getProperty("SHEET_ID")).getSheets()[0];
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(HEADERS);
        sheet.setFrozenRows(1);
      }
      sheet.appendRow(
        [
          new Date(body.submittedAt),
          safe_(body.name),
          safe_(body.email),
          safe_(body.dob),
          safe_(body.eventLabel),
          safe_(body.eventId),
          folder.getUrl(),
        ].concat(photoLinks)
      );
    } finally {
      lock.releaseLock();
    }

    return json_({ ok: true });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: String(error) });
  }
}

// Applicant-typed text starting with = + - @ would run as a formula in Sheets; force it to text.
function safe_(value) {
  var text = String(value == null ? "" : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
