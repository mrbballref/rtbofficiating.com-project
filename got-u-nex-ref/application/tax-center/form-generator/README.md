# Official Tax Form Generator

A standalone HTML/CSS/JavaScript application that uses the original government-issued PDF as the editable and printable document layer. It does not recreate IRS forms with approximate HTML styling.

## Start the application

Open `index.html` in a modern browser. For the strongest PDF-fetch and file-system support, serve the folder from a local web server instead of opening it with a `file://` URL.

Example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Included official IRS form connections

- W-9
- W-4
- W-2
- 1099-NEC
- 1099-MISC
- 1099-INT
- 1099-DIV
- 1099-K
- 1099-R
- 1040
- Schedule C (Form 1040)
- 1040-ES
- 1040-X
- 941
- 940
- SS-4
- W-7
- 4506-T
- 2848
- 9465
- W-8BEN
- 1065
- 1120
- 1120-S
- 990
- 1041
- Custom state, local, territorial, tribal, or other government PDF upload

The application points to the IRS's current canonical PDF URLs. When the IRS replaces a PDF at the same canonical URL, the generator loads the replacement rather than retaining an outdated visual copy.

## How exact-form editing works

1. Choose a form.
2. The generator requests the original PDF from `irs.gov`.
3. The browser-side PDF library discovers the PDF's AcroForm controls.
4. Entries made in the left field panel are written into those official PDF fields.
5. The scrollable preview displays the resulting official PDF itself.
6. Save Form writes a completed PDF to a user-selected location and automatically stores the same completed PDF in the browser Document Vault.

## Browser fallback

Some browsers, privacy extensions, corporate networks, or agency servers may block cross-origin PDF field access. When that occurs:

1. The exact official PDF is still displayed in the embedded viewer when permitted.
2. Complete the form in that viewer and download it using the viewer's Download control.
3. Select **Upload Government PDF** and choose the completed file.
4. The generator can then edit supported fields, save the completed PDF to a chosen location, and automatically place it in the Document Vault.

This fallback preserves the original PDF instead of substituting a visual recreation.

## Features

- Original IRS PDF layouts
- Scrollable embedded PDF preview
- Dynamic editing of the PDF's actual fillable fields
- Searchable PDF field list
- Create New Form
- Edit/Lock Form
- Save completed PDF to a chosen location
- Automatic browser Document Vault storage
- Print and Print Preview
- Email preparation with the completed PDF downloaded for attachment
- Drawn or typed electronic signature placement into a selected PDF field
- Upload any official state, local, territorial, tribal, or other government PDF
- Unsaved-change warnings
- Responsive interface

## Production requirements

For production deployment, connect the app to authenticated encrypted storage, secure server-side email delivery, access controls, retention policies, tamper-evident audit records, identity verification, and an e-signature provider appropriate for the form and jurisdiction. Government acceptance of an electronic or reproduced signature depends on the specific form and current filing instructions.
