SAMRIDDHI ASSOCIATES - DIRECT CHECKOUT WEBSITE v6

WHAT CHANGED
1. Six automated products now open checkout.html on gstewaylogin.in.
2. Customer Name, Mobile Number and Email are filled on your website.
3. Website calls the Cloudflare Worker /create-order endpoint.
4. Cashfree hosted checkout opens only for payment-method details.
5. payment-status.html verifies the final Cashfree order status through the Worker.
6. When PAID, the page displays Payment Successful and informs the customer that the licence key is being emailed.
7. Bulk Gmail Sender remains on its existing Cashfree Payment Form because licence automation was intentionally excluded.

UPLOAD
Upload/replace every file and folder from this ZIP in the GitHub repository root.
Important new files: checkout.html, assets/checkout.js, assets/payment-status.js.

TEST
Open an Incognito window, choose a product other than Bulk Gmail Sender, click Buy Now, enter test customer details, and verify that Cashfree checkout opens with the correct amount.
