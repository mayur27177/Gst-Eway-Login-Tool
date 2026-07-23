SAMRIDDHI ASSOCIATES WEBSITE - VISITOR COUNT SETUP
===================================================

WHAT WAS UPDATED
----------------
1. Homepage ke teen Explore buttons remove kiye gaye.
2. Top menu ab sirf Home, Products aur Contact Us dikhata hai.
3. Products click karne par homepage ka complete products section open/scroll hota hai.
4. Website visitor count same Google Sheet me daily aggregate ke roop me save hoga.
5. Ek browser ko aam taur par ek din me ek baar count kiya jayega.
6. Contact form ka existing logic bhi combined Apps Script me included hai.

GOOGLE SHEET / APPS SCRIPT UPDATE
---------------------------------
1. Wahi Google Sheet open karein jisme Contact Enquiries save ho rahi hain.
2. Extensions > Apps Script open karein.
3. Purana contact-form code replace karke file:
   Google_Apps_Script_Contact_And_Visitor.gs
   ka poora code paste karein.
4. Save karein.
5. Function dropdown se setupWebsiteSheets select karke Run karein.
6. Google permission Allow karein.
7. Sheet me naya tab Website Visitors ban jayega.
8. Deploy > Manage deployments > existing Web App ke Edit icon par click karein.
9. Version me New version select karein.
10. Execute as: Me
11. Who has access: Anyone
12. Deploy karein.

Existing deployment update karne par URL same rahega:
https://script.google.com/macros/s/AKfycbxGLtIXkWxPfMjocbL2Siel3s4dZPr2QjBpChMO-MCGU4LoX_ZrCYTtzva_k5cWXfaG/exec

VISITOR SHEET
-------------
Column A: Date
Column B: Visitors
Cell E2: Total Visitors
Cell E3: Last Visit

IMPORTANT
---------
- Counts approximate hain, verified identities nahi.
- Private/incognito window, storage clear, dusra browser ya dusra device extra count kar sakta hai.
- Google Sheet visitor name, mobile, email, GSTIN, password, Excel data ya IP address store nahi karti.
