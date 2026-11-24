/**
 * ============================================================================
 * 2-DAY GRAND RAAH E RAHMAT CONFERENCE - SCHOLARS VIDEO UPLOAD BACKEND
 * ============================================================================
 * Subai Jamiat Ahle Hadees Andhra Pradesh
 * Backend: Google Apps Script (Code.gs)
 * Storage: Google Drive (Dedicated folder: "Rah_e_Rahmat_Scholars_Videos")
 * Database: Google Sheets (Tab: "Scholars_Videos")
 *
 * Direct Resumable Upload Architecture:
 *   1. Frontend sends "initUpload" -> Apps Script requests Drive API v3
 *      resumable upload session URI using OAuth token (ScriptApp.getOAuthToken())
 *   2. Client browser streams original uncompressed HD video (MP4/MOV/MKV/WebM)
 *      directly to Google Drive via XMLHttpRequest PUT with live 0% -> 100% progress.
 *      (Bypasses Apps Script 50MB payload limit & 6-minute timeout!)
 *   3. Frontend calls "logUpload" -> Records entry into Google Sheet.
 *
 * Deployment Instructions:
 *   1. Open Google Sheets -> Extensions -> Apps Script.
 *   2. Enable "Google Drive API" under Services (+ icon).
 *   3. Paste this code into Code.gs.
 *   4. Deploy -> New Deployment -> Type: Web App.
 *      - Execute as: Me (your Google account)
 *      - Who has access: Anyone
 *   5. Copy the generated Web App URL and paste it into APPS_SCRIPT_URL in app.js.
 * ============================================================================
 */

// Configuration Constants
var CONFIG = {
  DRIVE_FOLDER_NAME: "Rah_e_Rahmat_Scholars_Videos",
  SHEET_NAME: "Scholars_Videos",
  LOCK_TIMEOUT_MS: 30000 // 30 seconds
};

/**
 * Handle HTTP GET Requests (Health Check)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ONLINE",
    service: "2-Day Grand Raah e Rahmat Conference - Scholars Video Upload Backend",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(CONFIG.LOCK_TIMEOUT_MS);
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: "Server is currently processing high traffic. Please try again in a moment."
    });
  }

  try {
    var rawData = e.postData ? e.postData.contents : "";
    var data = {};
    if (rawData) {
      try {
        data = JSON.parse(rawData);
      } catch (parseErr) {
        data = e.parameter || {};
      }
    } else {
      data = e.parameter || {};
    }

    var action = data.action || "";

    if (action === "initUpload") {
      return handleInitUpload(data);
    } else if (action === "logUpload") {
      return handleLogUpload(data);
    } else {
      return createJsonResponse({
        success: false,
        error: "Unrecognized action: " + action
      });
    }
  } catch (globalErr) {
    return createJsonResponse({
      success: false,
      error: globalErr.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * 1. Initialize Resumable Direct Upload Session with Google Drive
 */
function handleInitUpload(data) {
  var scholarId = data.scholarId || "GUEST";
  var scholarEnglish = data.scholarEnglish || "Guest_Speaker";
  var language = data.language || "Urdu";
  var originalFileName = data.fileName || "video.mp4";
  var fileSize = Number(data.fileSize) || 0;
  var mimeType = data.mimeType || "video/mp4";

  // Generate standardized clean filename
  var idPrefix = scholarId === "other" ? "GUEST" : (Number(scholarId) < 10 ? "0" + scholarId : scholarId);
  var cleanEnglish = scholarEnglish.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").substring(0, 35);
  var ext = originalFileName.indexOf(".") !== -1 ? originalFileName.split(".").pop().toLowerCase() : "mp4";
  var finalFileName = "RR_Promo_" + idPrefix + "_" + cleanEnglish + "_" + language.toUpperCase() + "." + ext;

  // Get destination folder
  var folder = getOrCreateFolder(CONFIG.DRIVE_FOLDER_NAME);
  var folderId = folder.getId();

  // Create Resumable Upload Session URI with Google Drive API v3
  var driveApiUrl = "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable";
  var metadata = {
    name: finalFileName,
    parents: [folderId],
    description: "2-Day Grand Raah e Rahmat Conference - Promotional Video Message. Scholar: " + scholarEnglish + " (" + language + ")"
  };

  var options = {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + ScriptApp.getOAuthToken(),
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": mimeType,
      "X-Upload-Content-Length": fileSize.toString()
    },
    payload: JSON.stringify(metadata),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(driveApiUrl, options);
  var statusCode = response.getResponseCode();
  var headers = response.getAllHeaders();

  // Google Drive API returns the resumable upload URI in the 'Location' header
  var uploadUrl = headers["Location"] || headers["location"] || "";

  if (statusCode === 200 && uploadUrl) {
    return createJsonResponse({
      success: true,
      uploadUrl: uploadUrl,
      finalFileName: finalFileName,
      folderId: folderId
    });
  } else {
    return createJsonResponse({
      success: false,
      error: "Failed to create Google Drive upload session. Status: " + statusCode + ". " + response.getContentText()
    });
  }
}

/**
 * 2. Log Completed Upload to Google Sheets
 */
function handleLogUpload(data) {
  var sheet = getOrCreateSheet(CONFIG.SHEET_NAME);

  var now = new Date();
  var timestampStr = Utilities.formatDate(now, "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");

  var fileId = data.fileId || "";
  var driveLink = fileId ? "https://drive.google.com/file/d/" + fileId + "/view" : "";

  // Append entry row
  sheet.appendRow([
    timestampStr,
    data.scholarId || "",
    data.scholarUrdu || "",
    data.scholarEnglish || "",
    data.language || "",
    data.whatsapp || "",
    data.finalFileName || "",
    data.fileSizeFormatted || (data.fileSize ? (data.fileSize / (1024 * 1024)).toFixed(1) + " MB" : ""),
    fileId,
    driveLink
  ]);

  return createJsonResponse({
    success: true,
    message: "Promo video successfully archived in Google Drive and logged in Google Sheets.",
    fileId: fileId,
    timestamp: timestampStr
  });
}

/**
 * Helper: Find or create target Google Drive folder
 */
function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

/**
 * Helper: Find or create Google Sheet tab with formatted headers
 */
function getOrCreateSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    var headers = [
      "Timestamp (IST)",
      "Scholar ID",
      "Scholar Name (Urdu)",
      "Scholar Name (English)",
      "Video Language",
      "WhatsApp Number",
      "Final File Name",
      "File Size",
      "Drive File ID",
      "Drive View Link"
    ];
    sheet.appendRow(headers);

    // Format header row (Deep Emerald background with Gold/White text)
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0D4A2E");
    headerRange.setFontColor("#F3C14B");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(11);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Helper: Return CORS-enabled JSON Response
 */
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
