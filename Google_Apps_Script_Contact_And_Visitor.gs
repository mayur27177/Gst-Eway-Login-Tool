/**
 * Samriddhi Associates Website
 * Contact Form + Privacy-Preserving Visitor Counter
 *
 * Contact sheet columns:
 * Name | Mobile | Email | Custom Message
 *
 * Visitor sheet:
 * Date | Visitors, with summary at D:E
 */

const CONTACT_SHEET_NAME = 'Contact Enquiries';
const CONTACT_HEADERS = ['Name', 'Mobile', 'Email', 'Custom Message'];
const VISITOR_SHEET_NAME = 'Website Visitors';
const VISITOR_HEADERS = ['Date', 'Visitors'];
const INDIA_TIME_ZONE = 'Asia/Kolkata';

/** Run once after pasting the code in the Sheet-bound Apps Script project. */
function setupWebsiteSheets() {
  setupContactSheet();
  setupVisitorSheet();
  return 'Contact and visitor sheets are ready.';
}

function setupContactSheet() {
  const spreadsheet = getSetupSpreadsheet_();
  PropertiesService.getScriptProperties().setProperty(
    'CONTACT_SPREADSHEET_ID',
    spreadsheet.getId()
  );

  let sheet = spreadsheet.getSheetByName(CONTACT_SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(CONTACT_SHEET_NAME);

  sheet.getRange(1, 1, 1, 4).setValues([CONTACT_HEADERS]);
  sheet.getRange('A1:D1')
    .setFontWeight('bold')
    .setBackground('#0d315d')
    .setFontColor('#ffffff');
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 190);
  sheet.setColumnWidth(2, 150);
  sheet.setColumnWidth(3, 240);
  sheet.setColumnWidth(4, 450);
  sheet.getRange('B:B').setNumberFormat('@');

  return 'Contact sheet setup completed.';
}

function setupVisitorSheet() {
  const spreadsheet = getSetupSpreadsheet_();
  PropertiesService.getScriptProperties().setProperty(
    'CONTACT_SPREADSHEET_ID',
    spreadsheet.getId()
  );

  let sheet = spreadsheet.getSheetByName(VISITOR_SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(VISITOR_SHEET_NAME);

  sheet.getRange(1, 1, 1, 2).setValues([VISITOR_HEADERS]);
  sheet.getRange('A1:B1')
    .setFontWeight('bold')
    .setBackground('#0d315d')
    .setFontColor('#ffffff');
  sheet.getRange('D1:E1').setValues([['Summary', 'Value']]);
  sheet.getRange('D1:E1')
    .setFontWeight('bold')
    .setBackground('#0d315d')
    .setFontColor('#ffffff');
  sheet.getRange('D2').setValue('Total Visitors');
  sheet.getRange('E2').setFormula('=SUM(B2:B)');
  sheet.getRange('D3').setValue('Last Visit');
  sheet.getRange('E3').setNumberFormat('dd-MM-yyyy hh:mm:ss AM/PM');
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 130);
  sheet.setColumnWidth(2, 110);
  sheet.setColumnWidth(4, 150);
  sheet.setColumnWidth(5, 210);
  sheet.getRange('A:A').setNumberFormat('@');

  return 'Visitor sheet setup completed.';
}

function doPost(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};

    // Honeypot field used by the public contact form.
    if (String(params.website || '').trim() !== '') {
      return responseHtml_('Submission rejected.');
    }

    const name = cleanText_(params.name, 100);
    const mobile = cleanMobile_(params.mobile);
    const email = cleanEmail_(params.email);
    const customMessage = cleanText_(params.customMessage, 2000);

    if (name.length < 2) throw new Error('Invalid visitor name.');
    if (!/^\+?[0-9]{7,15}$/.test(mobile)) throw new Error('Invalid mobile number.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email address.');
    if (customMessage.length < 3) throw new Error('Invalid message.');

    const spreadsheet = openConfiguredSpreadsheet_();
    let sheet = spreadsheet.getSheetByName(CONTACT_SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(CONTACT_SHEET_NAME);
      sheet.getRange(1, 1, 1, 4).setValues([CONTACT_HEADERS]);
    }

    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, 1, 4).setValues([[
      safeSheetValue_(name),
      safeSheetValue_(mobile),
      safeSheetValue_(email),
      safeSheetValue_(customMessage)
    ]]);
    sheet.getRange(nextRow, 2).setNumberFormat('@');
    sheet.getRange(nextRow, 4).setWrap(true);

    return responseHtml_('Success');
  } catch (error) {
    console.error(error);
    return responseHtml_('Error');
  }
}

function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const action = String(params.action || '').trim().toLowerCase();
    const source = String(params.source || '').trim().toLowerCase();

    if (action === 'visit' && source === 'samriddhi-site') {
      recordWebsiteVisit_();
      return responseText_('OK');
    }

    return responseText_('Samriddhi Associates website service is active.');
  } catch (error) {
    console.error(error);
    return responseText_('Error');
  }
}

function recordWebsiteVisit_() {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const spreadsheet = openConfiguredSpreadsheet_();
    let sheet = spreadsheet.getSheetByName(VISITOR_SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(VISITOR_SHEET_NAME);
      sheet.getRange(1, 1, 1, 2).setValues([VISITOR_HEADERS]);
      sheet.getRange('D1:E1').setValues([['Summary', 'Value']]);
      sheet.getRange('D2').setValue('Total Visitors');
      sheet.getRange('E2').setFormula('=SUM(B2:B)');
      sheet.getRange('D3').setValue('Last Visit');
    }

    const now = new Date();
    const dateKey = Utilities.formatDate(now, INDIA_TIME_ZONE, 'yyyy-MM-dd');
    const lastRow = sheet.getLastRow();
    let targetRow = -1;

    if (lastRow >= 2) {
      const dates = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
      for (let i = dates.length - 1; i >= 0; i--) {
        if (String(dates[i][0]).trim() === dateKey) {
          targetRow = i + 2;
          break;
        }
      }
    }

    if (targetRow === -1) {
      targetRow = Math.max(lastRow + 1, 2);
      sheet.getRange(targetRow, 1, 1, 2).setValues([[dateKey, 1]]);
      sheet.getRange(targetRow, 1).setNumberFormat('@');
    } else {
      const current = Number(sheet.getRange(targetRow, 2).getValue()) || 0;
      sheet.getRange(targetRow, 2).setValue(current + 1);
    }

    sheet.getRange('D1:E1').setValues([['Summary', 'Value']]);
    sheet.getRange('D2').setValue('Total Visitors');
    sheet.getRange('E2').setFormula('=SUM(B2:B)');
    sheet.getRange('D3').setValue('Last Visit');
    sheet.getRange('E3').setValue(now).setNumberFormat('dd-MM-yyyy hh:mm:ss AM/PM');
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

function getSetupSpreadsheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error('Open Apps Script from the Google Sheet using Extensions > Apps Script.');
  }
  return spreadsheet;
}

function openConfiguredSpreadsheet_() {
  const spreadsheetId = PropertiesService
    .getScriptProperties()
    .getProperty('CONTACT_SPREADSHEET_ID');
  if (!spreadsheetId) {
    throw new Error('Run setupWebsiteSheets() once before deployment.');
  }
  return SpreadsheetApp.openById(spreadsheetId);
}

function cleanText_(value, maxLength) {
  return String(value || '')
    .replace(/\u0000/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
    .slice(0, maxLength);
}

function cleanMobile_(value) {
  return String(value || '')
    .replace(/[^\d+]/g, '')
    .trim()
    .slice(0, 16);
}

function cleanEmail_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .slice(0, 150);
}

function safeSheetValue_(value) {
  const text = String(value || '');
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function responseText_(message) {
  return ContentService
    .createTextOutput(String(message || ''))
    .setMimeType(ContentService.MimeType.TEXT);
}

function responseHtml_(message) {
  return HtmlService
    .createHtmlOutput(
      '<!doctype html><html><body style="font-family:Arial">' +
      '<p>' + escapeHtml_(message) + '</p>' +
      '</body></html>'
    )
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function escapeHtml_(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
