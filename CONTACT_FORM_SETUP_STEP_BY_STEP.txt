SAMRIDDHI WEBSITE CONTACT FORM SETUP

Google Sheet columns:
Name | Mobile | Email | Custom Message

1. Create a new blank Google Sheet.
2. Rename it: Samriddhi Website Contact Enquiries
3. Open Extensions > Apps Script.
4. Delete the existing Code.gs content.
5. Copy the complete code from Google_Apps_Script_Contact_Form.gs.
6. Save the Apps Script project.
7. Select setupContactSheet and click Run.
8. Approve Google permissions.
9. The Contact Enquiries tab will be created with:
   Name | Mobile | Email | Custom Message

WEB APP DEPLOYMENT
1. Deploy > New deployment.
2. Select type: Web app.
3. Execute as: Me.
4. Who has access: Anyone.
5. Deploy and copy the URL ending in /exec.

WEBSITE CONNECTION
1. Open assets/contact-config.js.
2. Replace:
   PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE
   with the complete /exec URL.
3. Save the file.
4. Upload the complete website to the GitHub main branch.
5. Wait for GitHub Pages deployment.
6. Test:
   https://gstewaylogin.in/contact.html


CURRENT STATUS
Google Apps Script Web App URL has been inserted into assets/contact-config.js.
The website contact form is ready for GitHub upload and testing.
