// ============================================
//  EDITKARO.IN — GOOGLE APPS SCRIPT
//  Handles TWO forms:
//    1. Contact Form  (contact.html)
//    2. Subscribe Form (index.html)
//  Both forms POST to the same URL.
//  The "source" field routes each submission
//  to the correct sheet tab.
// ============================================

// ─── SHEET TAB NAMES ─────────────────────────
const CONTACT_SHEET_NAME   = 'Contact Submissions';
const SUBSCRIBE_SHEET_NAME = 'Email Subscribers';

// ─── MAIN HANDLER ─────────────────────────────
function doPost(e) {
  try {
    const ss     = SpreadsheetApp.getActiveSpreadsheet();
    const params = e.parameter;                 // URL-encoded POST body
    const source = params.source || '';

    if (source === 'homepage-subscribe') {
      handleSubscribe(ss, params);
    } else if (source === 'contact-form') {
      handleContact(ss, params);
    } else {
      // Unknown source — log to a fallback sheet
      handleUnknown(ss, params);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // Log the error and return a response (no-cors won't see it, but good practice)
    console.error('doPost error:', err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── CONTACT FORM HANDLER ─────────────────────
function handleContact(ss, p) {
  const sheet = getOrCreateSheet(ss, CONTACT_SHEET_NAME);

  // Write header row if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp',
      'Name',
      'Email',
      'Phone',
      'Budget',
      'Edit Types',
      'Deadline',
      'Message',
      'Reference Links',
      'Source'
    ]);
    formatHeaderRow(sheet);
  }

  // Append the submission
  sheet.appendRow([
    p.timestamp       || new Date().toISOString(),
    p.name            || '',
    p.email           || '',
    p.phone           || '',
    p.budget          || '',
    p.editTypes       || '',
    p.deadline        || '',
    p.message         || '',
    p.referenceLinks  || '',
    p.source          || 'contact-form'
  ]);

  sendContactNotification(p);
}

// ─── SUBSCRIBE FORM HANDLER ───────────────────
function handleSubscribe(ss, p) {
  const sheet = getOrCreateSheet(ss, SUBSCRIBE_SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp',
      'Name',
      'Email',
      'Source'
    ]);
    formatHeaderRow(sheet);
  }

  // Duplicate email check
  const emails = sheet.getRange(2, 3, Math.max(sheet.getLastRow() - 1, 1), 1)
                       .getValues()
                       .flat()
                       .map(e => String(e).toLowerCase().trim());

  const incomingEmail = String(p.email || '').toLowerCase().trim();

  if (emails.includes(incomingEmail)) {
    console.log('Duplicate subscriber skipped: ' + incomingEmail);
    return; // silently skip duplicates
  }

  sheet.appendRow([
    p.timestamp || new Date().toISOString(),
    p.name      || '',
    p.email     || '',
    p.source    || 'homepage-subscribe'
  ]);
}

// ─── UNKNOWN SOURCE FALLBACK ──────────────────
function handleUnknown(ss, p) {
  const sheet = getOrCreateSheet(ss, 'Unknown Submissions');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Raw Data']);
    formatHeaderRow(sheet);
  }
  sheet.appendRow([new Date().toISOString(), JSON.stringify(p)]);
}

// ─── EMAIL NOTIFICATION (optional) ───────────
// Sends you an email when a new project brief arrives.
// Comment this out if you don't want email alerts.
function sendContactNotification(p) {
  const recipient = 'hello@editkaro.in'; // ← change to your email
  const subject   = '✦ New Project Brief — ' + (p.name || 'Unknown') + ' [editkaro.in]';
  const body = [
    'New contact form submission on Editkaro.in:',
    '',
    'Name:          ' + (p.name || '—'),
    'Email:         ' + (p.email || '—'),
    'Phone:         ' + (p.phone || '—'),
    'Budget:        ' + (p.budget || '—'),
    'Edit Types:    ' + (p.editTypes || '—'),
    'Deadline:      ' + (p.deadline || '—'),
    'Ref Links:     ' + (p.referenceLinks || '—'),
    '',
    'Message:',
    p.message || '—',
    '',
    '— Editkaro.in Auto-Notifier'
  ].join('\n');

  try {
    MailApp.sendEmail(recipient, subject, body);
  } catch (err) {
    console.warn('Email notification failed:', err.toString());
    // Don't throw — the sheet write already succeeded
  }
}

// ─── HELPERS ──────────────────────────────────

// Gets a sheet by name; creates it if it doesn't exist
function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

// Bold + freeze the first (header) row
function formatHeaderRow(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 10);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#1e1e26');
  headerRange.setFontColor('#a78bfa');
  sheet.setFrozenRows(1);
}

// ─── GET HANDLER (for browser test) ──────────
// Visit your deployed URL in a browser — should return {"status":"ok"}
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', app: 'editkaro-forms' }))
    .setMimeType(ContentService.MimeType.JSON);
}
