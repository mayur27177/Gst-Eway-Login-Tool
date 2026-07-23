/**
 * Samriddhi Associates Website Contact Form
 *
 * Sheet columns:
 * Name | Mobile | Email | Custom Message
 */

const CONTACT_SHEET_NAME = 'Contact Enquiries';
const CONTACT_HEADERS = ['Name', 'Mobile', 'Email', 'Custom Message'];

function setupContactSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error(
      'Open Apps Script from the Google Sheet using Extensions > Apps Script.'
    );
  }

  PropertiesService.getScriptProperties().setProperty(
    'CONTACT_SPREADSHEET_ID',
    spreadsheet.getId()
  );

  let sheet = spreadsheet.getSheetByName(CONTACT_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONTACT_SHEET_NAME);
  }

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

  return 'Contact Sheet setup completed.';
}

function doPost(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};

    if (String(params.website || '').trim() !== '') {
      return responseHtml_('Submission rejected.');
    }

    const name = cleanText_(params.name, 100);
    const mobile = cleanMobile_(params.mobile);
    const email = cleanEmail_(params.email);
    const customMessage = cleanText_(params.customMessage, 2000);

    if (name.length < 2) throw new Error('Invalid visitor name.');
    if (!/^\+?[0-9]{7,15}$/.test(mobile)) {
      throw new Error('Invalid mobile number.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email address.');
    }
    if (customMessage.length < 3) throw new Error('Invalid message.');

    const spreadsheetId = PropertiesService
      .getScriptProperties()
      .getProperty('CONTACT_SPREADSHEET_ID');

    if (!spreadsheetId) {
      throw new Error('Run setupContactSheet() before deployment.');
    }

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
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

function doGet() {
  return responseHtml_('Samriddhi Associates Contact Form is active.');
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
