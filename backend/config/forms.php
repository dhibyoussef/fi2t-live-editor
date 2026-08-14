<?php

return [
    /*
    | Official From: identities (shown as sender). CMS Global → Formulaires overrides.
    | Domain is fit-tunisie.org (fi2t.tn is not registered).
    */
    'notify_contact' => env('FORM_NOTIFY_CONTACT', 'contact.fi2t@fit-tunisie.org'),
    'notify_newsletter' => env('FORM_NOTIFY_NEWSLETTER', 'newsletter.fi2t@fit-tunisie.org'),
    'notify_adhesion' => env('FORM_NOTIFY_ADHESION', 'adhesion.fi2t@fit-tunisie.org'),

    // Who actually receives the mail (set FORM_RECEIVER in .env). Not shown on the site.
    'receiver' => env('FORM_RECEIVER', ''),

    /*
    | Technical From used by Brevo. Must be a verified sender in the Brevo account.
    | contact.fi2t@fit-tunisie.org is rejected until the domain is authenticated (DNS).
    */
    'brevo_sender' => env('BREVO_SENDER', ''),
];
