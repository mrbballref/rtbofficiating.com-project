'use strict';

window.FORM_TEMPLATES = {
  "w9": {
    "group": "Taxpayer Identification",
    "agency": "Internal Revenue Service",
    "formNumber": "Form W-9",
    "title": "Request for Taxpayer Identification Number and Certification",
    "shortTitle": "W-9 — Taxpayer ID and Certification",
    "revision": "Rev. March 2024",
    "purpose": "Used by a requester to obtain a U.S. person’s correct taxpayer identification number and certification for information reporting.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-w-9",
    "instructionsUrl": "https://www.irs.gov/instructions/iw9",
    "sections": [
      {
        "title": "Requester Information",
        "fields": [
          {
            "id": "requesterName",
            "label": "Requester’s name",
            "type": "text"
          },
          {
            "id": "requesterAddress",
            "label": "Requester’s address",
            "type": "text",
            "wide": true
          },
          {
            "id": "requesterAccountNumbers",
            "label": "Account number(s)",
            "type": "text",
            "wide": true
          }
        ]
      },
      {
        "title": "Lines 1–2 — Name",
        "fields": [
          {
            "id": "nameLine1",
            "label": "1. Name of entity or individual",
            "type": "text",
            "required": true,
            "wide": true
          },
          {
            "id": "businessNameLine2",
            "label": "2. Business name / disregarded entity name",
            "type": "text",
            "wide": true
          }
        ]
      },
      {
        "title": "Line 3 — Federal Tax Classification",
        "fields": [
          {
            "id": "classification",
            "label": "3a. Federal tax classification",
            "type": "select",
            "required": true,
            "wide": true,
            "options": [
              "Individual / sole proprietor",
              "C corporation",
              "S corporation",
              "Partnership",
              "Trust / estate",
              "LLC taxed as C corporation",
              "LLC taxed as S corporation",
              "LLC taxed as partnership",
              "Other"
            ]
          },
          {
            "id": "otherClassification",
            "label": "Other classification or explanation",
            "type": "text"
          },
          {
            "id": "foreignPartners",
            "label": "3b. Partnership, trust, or estate has foreign partners, owners, or beneficiaries",
            "type": "select",
            "options": [
              "Yes",
              "No"
            ]
          }
        ]
      },
      {
        "title": "Line 4 — Exemptions",
        "fields": [
          {
            "id": "exemptPayeeCode",
            "label": "Exempt payee code",
            "type": "text"
          },
          {
            "id": "fatcaCode",
            "label": "Exemption from FATCA reporting code",
            "type": "text"
          }
        ]
      },
      {
        "title": "Lines 5–6 — Address",
        "fields": [
          {
            "id": "address",
            "label": "5. Number, street, and apartment or suite number",
            "type": "text",
            "wide": true
          },
          {
            "id": "cityStateZip",
            "label": "6. City, state, and ZIP code",
            "type": "text",
            "wide": true
          }
        ]
      },
      {
        "title": "Part I — Taxpayer Identification Number",
        "fields": [
          {
            "id": "tinType",
            "label": "TIN type",
            "type": "select",
            "options": [
              "Social Security Number (SSN)",
              "Employer Identification Number (EIN)",
              "Individual Taxpayer Identification Number (ITIN)"
            ],
            "required": true
          },
          {
            "id": "tin",
            "label": "Taxpayer identification number",
            "type": "password",
            "sensitive": true,
            "required": true
          }
        ]
      },
      {
        "title": "Part II — Certification",
        "fields": [
          {
            "id": "certCorrectTin",
            "label": "The number shown is my correct TIN",
            "type": "checkbox",
            "value": true
          },
          {
            "id": "certBackupWithholding",
            "label": "I am not subject to backup withholding, unless otherwise indicated",
            "type": "checkbox",
            "value": true
          },
          {
            "id": "subjectToBackupWithholding",
            "label": "Check if currently subject to backup withholding",
            "type": "checkbox"
          },
          {
            "id": "certUsPerson",
            "label": "I am a U.S. citizen or other U.S. person",
            "type": "checkbox",
            "value": true
          },
          {
            "id": "certFatca",
            "label": "Any FATCA exemption code entered is correct",
            "type": "checkbox",
            "value": true
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "w4": {
    "group": "Employment",
    "agency": "Internal Revenue Service",
    "formNumber": "Form W-4",
    "title": "Employee’s Withholding Certificate",
    "shortTitle": "W-4 — Employee Withholding",
    "revision": "Current annual revision — verify before filing",
    "purpose": "Used by an employee so an employer can determine the correct federal income tax withholding.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-w-4",
    "instructionsUrl": "https://www.irs.gov/forms-pubs/about-form-w-4",
    "sections": [
      {
        "title": "Step 1 — Personal Information",
        "fields": [
          {
            "id": "firstMiddle",
            "label": "First name and middle initial",
            "type": "text",
            "required": true
          },
          {
            "id": "lastName",
            "label": "Last name",
            "type": "text",
            "required": true
          },
          {
            "id": "ssn",
            "label": "Social Security number",
            "type": "password",
            "sensitive": true,
            "required": true
          },
          {
            "id": "address",
            "label": "Address",
            "type": "text",
            "wide": true
          },
          {
            "id": "cityStateZip",
            "label": "City, state, and ZIP code",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingStatus",
            "label": "Filing status",
            "type": "select",
            "options": [
              "Single or Married filing separately",
              "Married filing jointly or Qualifying surviving spouse",
              "Head of household"
            ],
            "required": true
          }
        ]
      },
      {
        "title": "Step 2 — Multiple Jobs or Spouse Works",
        "fields": [
          {
            "id": "multipleJobsMethod",
            "label": "Multiple jobs method",
            "type": "select",
            "wide": true,
            "options": [
              "Not applicable",
              "Use IRS estimator",
              "Use Multiple Jobs Worksheet",
              "Two jobs total — check box method"
            ]
          },
          {
            "id": "twoJobsCheckbox",
            "label": "Two jobs total / spouse also works",
            "type": "checkbox"
          }
        ]
      },
      {
        "title": "Step 3 — Claim Dependents and Other Credits",
        "fields": [
          {
            "id": "qualifyingChildrenCredit",
            "label": "Credit for qualifying children",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherDependentsCredit",
            "label": "Credit for other dependents",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherCredits",
            "label": "Other credits",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalDependentCredits",
            "label": "Total credits",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Step 4 — Other Adjustments",
        "fields": [
          {
            "id": "otherIncome",
            "label": "4(a). Other income, not from jobs",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "deductions",
            "label": "4(b). Deductions",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "extraWithholding",
            "label": "4(c). Extra withholding per pay period",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "exempt",
            "label": "Claim exempt from withholding",
            "type": "checkbox"
          }
        ]
      },
      {
        "title": "Step 5 — Employee Signature",
        "fields": [
          {
            "id": "employeeDate",
            "label": "Date",
            "type": "date"
          }
        ]
      },
      {
        "title": "Employer Only",
        "fields": [
          {
            "id": "employerNameAddress",
            "label": "Employer name and address",
            "type": "text",
            "wide": true
          },
          {
            "id": "firstDateEmployment",
            "label": "First date of employment",
            "type": "date"
          },
          {
            "id": "employerEin",
            "label": "Employer identification number",
            "type": "password",
            "sensitive": true
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "w2": {
    "group": "Employment",
    "agency": "Social Security Administration / Internal Revenue Service",
    "formNumber": "Form W-2",
    "title": "Wage and Tax Statement",
    "shortTitle": "W-2 — Wage and Tax Statement",
    "revision": "Current tax-year revision — verify before filing",
    "purpose": "Used by employers to report employee wages and federal, Social Security, Medicare, state, and local taxes withheld.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-w-2",
    "instructionsUrl": "https://www.irs.gov/instructions/iw2w3",
    "sections": [
      {
        "title": "Employer",
        "fields": [
          {
            "id": "employerEin",
            "label": "b. Employer EIN",
            "type": "password",
            "sensitive": true,
            "required": true
          },
          {
            "id": "employerNameAddress",
            "label": "c. Employer name, address, and ZIP code",
            "type": "textarea",
            "wide": true,
            "required": true
          },
          {
            "id": "controlNumber",
            "label": "d. Control number",
            "type": "text"
          }
        ]
      },
      {
        "title": "Employee",
        "fields": [
          {
            "id": "employeeSsn",
            "label": "a. Employee SSN",
            "type": "password",
            "sensitive": true,
            "required": true
          },
          {
            "id": "employeeName",
            "label": "e. Employee name",
            "type": "text",
            "required": true,
            "wide": true
          },
          {
            "id": "employeeAddress",
            "label": "f. Employee address and ZIP code",
            "type": "textarea",
            "wide": true
          }
        ]
      },
      {
        "title": "Federal Wage and Tax Information",
        "fields": [
          {
            "id": "wages",
            "label": "1. Wages, tips, other compensation",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "federalTax",
            "label": "2. Federal income tax withheld",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "socialSecurityWages",
            "label": "3. Social Security wages",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "socialSecurityTax",
            "label": "4. Social Security tax withheld",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "medicareWages",
            "label": "5. Medicare wages and tips",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "medicareTax",
            "label": "6. Medicare tax withheld",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "socialSecurityTips",
            "label": "7. Social Security tips",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "allocatedTips",
            "label": "8. Allocated tips",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "dependentCare",
            "label": "10. Dependent care benefits",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "nonqualifiedPlans",
            "label": "11. Nonqualified plans",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Codes and Other",
        "fields": [
          {
            "id": "box12Codes",
            "label": "12a–12d. Codes and amounts",
            "type": "table",
            "columns": [
              {
                "id": "box",
                "label": "Box",
                "type": "select",
                "options": [
                  "12a",
                  "12b",
                  "12c",
                  "12d"
                ]
              },
              {
                "id": "code",
                "label": "Code",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 4,
            "maxRows": 4
          },
          {
            "id": "box14Other",
            "label": "14. Other",
            "type": "table",
            "columns": [
              {
                "id": "description",
                "label": "Description",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 2
          },
          {
            "id": "statutoryEmployee",
            "label": "13. Statutory employee",
            "type": "checkbox"
          },
          {
            "id": "retirementPlan",
            "label": "13. Retirement plan",
            "type": "checkbox"
          },
          {
            "id": "thirdPartySickPay",
            "label": "13. Third-party sick pay",
            "type": "checkbox"
          }
        ]
      },
      {
        "title": "State and Local",
        "fields": [
          {
            "id": "state",
            "label": "15. State",
            "type": "text"
          },
          {
            "id": "stateId",
            "label": "15. Employer state ID",
            "type": "text"
          },
          {
            "id": "stateWages",
            "label": "16. State wages",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "stateTax",
            "label": "17. State income tax",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "localWages",
            "label": "18. Local wages",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "localTax",
            "label": "19. Local income tax",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "locality",
            "label": "20. Locality name",
            "type": "text"
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "nec1099": {
    "group": "Information Returns",
    "agency": "Internal Revenue Service",
    "formNumber": "Form 1099-NEC",
    "title": "Nonemployee Compensation",
    "shortTitle": "1099-NEC — Nonemployee Compensation",
    "revision": "Current tax-year revision — verify before filing",
    "purpose": "Used to report nonemployee compensation and related withholding information.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-1099-nec",
    "instructionsUrl": "https://www.irs.gov/instructions/i1099mec",
    "sections": [
      {
        "title": "Payer",
        "fields": [
          {
            "id": "voidReturn",
            "label": "VOID",
            "type": "checkbox"
          },
          {
            "id": "correctedReturn",
            "label": "CORRECTED",
            "type": "checkbox"
          },
          {
            "id": "payerNameAddress",
            "label": "Payer name, address, and phone",
            "type": "textarea",
            "wide": true,
            "required": true
          },
          {
            "id": "payerTin",
            "label": "Payer TIN",
            "type": "password",
            "sensitive": true,
            "required": true
          }
        ]
      },
      {
        "title": "Recipient",
        "fields": [
          {
            "id": "recipientTin",
            "label": "Recipient TIN",
            "type": "password",
            "sensitive": true,
            "required": true
          },
          {
            "id": "recipientName",
            "label": "Recipient name",
            "type": "text",
            "required": true,
            "wide": true
          },
          {
            "id": "recipientAddress",
            "label": "Recipient address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "accountNumber",
            "label": "Account number",
            "type": "text"
          }
        ]
      },
      {
        "title": "Amounts",
        "fields": [
          {
            "id": "nonemployeeComp",
            "label": "1. Nonemployee compensation",
            "type": "number",
            "format": "currency",
            "required": true
          },
          {
            "id": "directSales",
            "label": "2. Direct sales of $5,000 or more",
            "type": "checkbox"
          },
          {
            "id": "federalWithholding",
            "label": "4. Federal income tax withheld",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "State Information",
        "fields": [
          {
            "id": "state",
            "label": "5. State",
            "type": "text"
          },
          {
            "id": "statePayerNumber",
            "label": "6. State / payer state number",
            "type": "text"
          },
          {
            "id": "stateIncome",
            "label": "7. State income",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "misc1099": {
    "group": "Information Returns",
    "agency": "Internal Revenue Service",
    "formNumber": "Form 1099-MISC",
    "title": "Miscellaneous Information",
    "shortTitle": "1099-MISC — Miscellaneous Information",
    "revision": "Current tax-year revision — verify before filing",
    "purpose": "Used to report specified miscellaneous payments and withholding.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-1099-misc",
    "instructionsUrl": "https://www.irs.gov/instructions/i1099mec",
    "sections": [
      {
        "title": "Payer and Recipient",
        "fields": [
          {
            "id": "voidReturn",
            "label": "VOID",
            "type": "checkbox"
          },
          {
            "id": "correctedReturn",
            "label": "CORRECTED",
            "type": "checkbox"
          },
          {
            "id": "payerNameAddress",
            "label": "Payer name, address, and phone",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "payerTin",
            "label": "Payer TIN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "recipientTin",
            "label": "Recipient TIN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "recipientName",
            "label": "Recipient name",
            "type": "text",
            "wide": true
          },
          {
            "id": "recipientAddress",
            "label": "Recipient address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "accountNumber",
            "label": "Account number",
            "type": "text"
          }
        ]
      },
      {
        "title": "Payment Boxes",
        "fields": [
          {
            "id": "rents",
            "label": "1. Rents",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "royalties",
            "label": "2. Royalties",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherIncome",
            "label": "3. Other income",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "federalWithholding",
            "label": "4. Federal income tax withheld",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "fishingBoat",
            "label": "5. Fishing boat proceeds",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "medicalPayments",
            "label": "6. Medical and health care payments",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "directSales",
            "label": "7. Direct sales of $5,000 or more",
            "type": "checkbox"
          },
          {
            "id": "substitutePayments",
            "label": "8. Substitute payments",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "cropInsurance",
            "label": "9. Crop insurance proceeds",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "attorneyProceeds",
            "label": "10. Gross proceeds paid to an attorney",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "fishPurchased",
            "label": "11. Fish purchased for resale",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "section409aDeferrals",
            "label": "12. Section 409A deferrals",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "excessGoldenParachute",
            "label": "13. Excess golden parachute payments",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "nonqualifiedDeferred",
            "label": "14. Nonqualified deferred compensation",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "State Information",
        "fields": [
          {
            "id": "state",
            "label": "15. State",
            "type": "text"
          },
          {
            "id": "statePayerNumber",
            "label": "16. State / payer number",
            "type": "text"
          },
          {
            "id": "stateIncome",
            "label": "17. State income",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "int1099": {
    "group": "Information Returns",
    "agency": "Internal Revenue Service",
    "formNumber": "Form 1099-INT",
    "title": "Interest Income",
    "shortTitle": "1099-INT — Interest Income",
    "revision": "Current tax-year revision — verify before filing",
    "purpose": "Used to report interest income and related tax information.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-1099-int",
    "instructionsUrl": "https://www.irs.gov/instructions/i1099int",
    "sections": [
      {
        "title": "Payer and Recipient",
        "fields": [
          {
            "id": "voidReturn",
            "label": "VOID",
            "type": "checkbox"
          },
          {
            "id": "correctedReturn",
            "label": "CORRECTED",
            "type": "checkbox"
          },
          {
            "id": "payerNameAddress",
            "label": "Payer name and address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "payerTin",
            "label": "Payer TIN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "recipientTin",
            "label": "Recipient TIN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "recipientNameAddress",
            "label": "Recipient name and address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "accountNumber",
            "label": "Account number",
            "type": "text"
          }
        ]
      },
      {
        "title": "Interest and Tax Boxes",
        "fields": [
          {
            "id": "interestIncome",
            "label": "1. Interest income",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "earlyWithdrawalPenalty",
            "label": "2. Early withdrawal penalty",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "usSavingsInterest",
            "label": "3. U.S. Savings Bonds and Treasury obligations interest",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "federalWithholding",
            "label": "4. Federal income tax withheld",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "investmentExpenses",
            "label": "5. Investment expenses",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "foreignTax",
            "label": "6. Foreign tax paid",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "foreignCountry",
            "label": "7. Foreign country or U.S. possession",
            "type": "text"
          },
          {
            "id": "taxExemptInterest",
            "label": "8. Tax-exempt interest",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "privateActivityBond",
            "label": "9. Specified private activity bond interest",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "marketDiscount",
            "label": "10. Market discount",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "bondPremium",
            "label": "11. Bond premium",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "div1099": {
    "group": "Information Returns",
    "agency": "Internal Revenue Service",
    "formNumber": "Form 1099-DIV",
    "title": "Dividends and Distributions",
    "shortTitle": "1099-DIV — Dividends and Distributions",
    "revision": "Current tax-year revision — verify before filing",
    "purpose": "Used to report dividends, capital gain distributions, and related tax information.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-1099-div",
    "instructionsUrl": "https://www.irs.gov/instructions/i1099div",
    "sections": [
      {
        "title": "Payer and Recipient",
        "fields": [
          {
            "id": "voidReturn",
            "label": "VOID",
            "type": "checkbox"
          },
          {
            "id": "correctedReturn",
            "label": "CORRECTED",
            "type": "checkbox"
          },
          {
            "id": "payerNameAddress",
            "label": "Payer name and address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "payerTin",
            "label": "Payer TIN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "recipientTin",
            "label": "Recipient TIN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "recipientNameAddress",
            "label": "Recipient name and address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "accountNumber",
            "label": "Account number",
            "type": "text"
          }
        ]
      },
      {
        "title": "Distribution Boxes",
        "fields": [
          {
            "id": "ordinaryDividends",
            "label": "1a. Total ordinary dividends",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "qualifiedDividends",
            "label": "1b. Qualified dividends",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "capitalGain",
            "label": "2a. Total capital gain distribution",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "unrecaptured1250",
            "label": "2b. Unrecaptured section 1250 gain",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "section1202",
            "label": "2c. Section 1202 gain",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "collectiblesGain",
            "label": "2d. Collectibles gain",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "nondividend",
            "label": "3. Nondividend distributions",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "federalWithholding",
            "label": "4. Federal income tax withheld",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "section199a",
            "label": "5. Section 199A dividends",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "investmentExpenses",
            "label": "6. Investment expenses",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "foreignTax",
            "label": "7. Foreign tax paid",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "foreignCountry",
            "label": "8. Foreign country or possession",
            "type": "text"
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "k1099": {
    "group": "Information Returns",
    "agency": "Internal Revenue Service",
    "formNumber": "Form 1099-K",
    "title": "Payment Card and Third Party Network Transactions",
    "shortTitle": "1099-K — Payment Transactions",
    "revision": "Current tax-year revision — verify before filing",
    "purpose": "Used by payment settlement entities to report payment card and third-party network transactions.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-1099-k",
    "instructionsUrl": "https://www.irs.gov/instructions/i1099k",
    "sections": [
      {
        "title": "Filer and Payee",
        "fields": [
          {
            "id": "voidReturn",
            "label": "VOID",
            "type": "checkbox"
          },
          {
            "id": "correctedReturn",
            "label": "CORRECTED",
            "type": "checkbox"
          },
          {
            "id": "filerNameAddress",
            "label": "Filer name, address, and phone",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "filerTin",
            "label": "Filer TIN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "payeeTin",
            "label": "Payee TIN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "payeeNameAddress",
            "label": "Payee name and address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "accountNumber",
            "label": "Account number",
            "type": "text"
          }
        ]
      },
      {
        "title": "Transactions",
        "fields": [
          {
            "id": "grossAmount",
            "label": "1a. Gross payment card / third-party network amount",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "cardNotPresent",
            "label": "1b. Card-not-present transactions",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "merchantCategoryCode",
            "label": "2. Merchant category code",
            "type": "text"
          },
          {
            "id": "numberTransactions",
            "label": "3. Number of payment transactions",
            "type": "number"
          },
          {
            "id": "federalWithholding",
            "label": "4. Federal income tax withheld",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Monthly Gross Amounts",
        "fields": [
          {
            "id": "jan",
            "label": "January",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "feb",
            "label": "February",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "mar",
            "label": "March",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "apr",
            "label": "April",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "may",
            "label": "May",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "jun",
            "label": "June",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "jul",
            "label": "July",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "aug",
            "label": "August",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "sep",
            "label": "September",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "oct",
            "label": "October",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "nov",
            "label": "November",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "dec",
            "label": "December",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "r1099": {
    "group": "Information Returns",
    "agency": "Internal Revenue Service",
    "formNumber": "Form 1099-R",
    "title": "Distributions From Pensions, Annuities, Retirement or Profit-Sharing Plans, IRAs, Insurance Contracts, etc.",
    "shortTitle": "1099-R — Retirement Distributions",
    "revision": "Current tax-year revision — verify before filing",
    "purpose": "Used to report retirement-plan, pension, annuity, IRA, insurance-contract, and related distributions.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-1099-r",
    "instructionsUrl": "https://www.irs.gov/instructions/i1099r",
    "sections": [
      {
        "title": "Payer and Recipient",
        "fields": [
          {
            "id": "voidReturn",
            "label": "VOID",
            "type": "checkbox"
          },
          {
            "id": "correctedReturn",
            "label": "CORRECTED",
            "type": "checkbox"
          },
          {
            "id": "payerNameAddress",
            "label": "Payer name and address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "payerTin",
            "label": "Payer TIN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "recipientTin",
            "label": "Recipient TIN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "recipientNameAddress",
            "label": "Recipient name and address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "accountNumber",
            "label": "Account number",
            "type": "text"
          }
        ]
      },
      {
        "title": "Distribution",
        "fields": [
          {
            "id": "grossDistribution",
            "label": "1. Gross distribution",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "taxableAmount",
            "label": "2a. Taxable amount",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "taxableNotDetermined",
            "label": "2b. Taxable amount not determined",
            "type": "checkbox"
          },
          {
            "id": "totalDistribution",
            "label": "2b. Total distribution",
            "type": "checkbox"
          },
          {
            "id": "capitalGain",
            "label": "3. Capital gain",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "federalWithholding",
            "label": "4. Federal income tax withheld",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "employeeContributions",
            "label": "5. Employee contributions / insurance premiums",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "netUnrealizedAppreciation",
            "label": "6. Net unrealized appreciation",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "distributionCode",
            "label": "7. Distribution code",
            "type": "text"
          },
          {
            "id": "iraSepSimple",
            "label": "7. IRA / SEP / SIMPLE",
            "type": "checkbox"
          },
          {
            "id": "otherAmount",
            "label": "8. Other",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherPercent",
            "label": "8. Other percent",
            "type": "text"
          },
          {
            "id": "yourPercent",
            "label": "9a. Your percentage of total distribution",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalEmployeeContributions",
            "label": "9b. Total employee contributions",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "f1040": {
    "group": "Individual Income Tax",
    "agency": "Internal Revenue Service",
    "formNumber": "Form 1040",
    "title": "U.S. Individual Income Tax Return",
    "shortTitle": "1040 — Individual Income Tax Return",
    "revision": "Current tax-year revision — verify before filing",
    "purpose": "Primary U.S. individual federal income tax return.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-1040",
    "instructionsUrl": "https://www.irs.gov/instructions/i1040gi",
    "sections": [
      {
        "title": "Taxpayer Information",
        "fields": [
          {
            "id": "taxYear",
            "label": "Tax year",
            "type": "number",
            "required": true
          },
          {
            "id": "firstName",
            "label": "First name and initial",
            "type": "text",
            "required": true
          },
          {
            "id": "lastName",
            "label": "Last name",
            "type": "text",
            "required": true
          },
          {
            "id": "ssn",
            "label": "SSN",
            "type": "password",
            "sensitive": true,
            "required": true
          },
          {
            "id": "spouseName",
            "label": "Spouse name",
            "type": "text"
          },
          {
            "id": "spouseSsn",
            "label": "Spouse SSN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "address",
            "label": "Home address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "presidentialElection",
            "label": "Presidential election campaign designation",
            "type": "checkbox"
          }
        ]
      },
      {
        "title": "Filing Status and Digital Assets",
        "fields": [
          {
            "id": "filingStatus",
            "label": "Filing status",
            "type": "select",
            "options": [
              "Single",
              "Married filing jointly",
              "Married filing separately",
              "Head of household",
              "Qualifying surviving spouse"
            ],
            "required": true
          },
          {
            "id": "digitalAssets",
            "label": "Received, sold, exchanged, or otherwise disposed of a digital asset",
            "type": "select",
            "options": [
              "Yes",
              "No"
            ]
          }
        ]
      },
      {
        "title": "Dependents",
        "fields": [
          {
            "id": "dependents",
            "label": "Dependents",
            "type": "table",
            "columns": [
              {
                "id": "firstLast",
                "label": "First and last name",
                "type": "text"
              },
              {
                "id": "ssn",
                "label": "SSN",
                "type": "password",
                "sensitive": true
              },
              {
                "id": "relationship",
                "label": "Relationship",
                "type": "text"
              },
              {
                "id": "childTaxCredit",
                "label": "Child tax credit",
                "type": "checkbox"
              },
              {
                "id": "otherDependentCredit",
                "label": "Other dependent credit",
                "type": "checkbox"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Income",
        "fields": [
          {
            "id": "wages",
            "label": "1. Wages, salaries, tips",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "interest",
            "label": "2. Interest",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "dividends",
            "label": "3. Dividends",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "iraDistributions",
            "label": "4. IRA distributions",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "pensions",
            "label": "5. Pensions and annuities",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "socialSecurity",
            "label": "6. Social Security benefits",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "capitalGain",
            "label": "7. Capital gain or loss",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "additionalIncome",
            "label": "8. Additional income from Schedule 1",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalIncome",
            "label": "9. Total income",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Adjusted Gross Income and Deductions",
        "fields": [
          {
            "id": "adjustments",
            "label": "10. Adjustments to income",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "agi",
            "label": "11. Adjusted gross income",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "standardItemized",
            "label": "12. Standard or itemized deduction",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "qbiDeduction",
            "label": "13. Qualified business income deduction",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "taxableIncome",
            "label": "15. Taxable income",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "addLines12and13",
            "label": "14. Add lines 12 and 13",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Tax and Credits",
        "fields": [
          {
            "id": "tax",
            "label": "16. Tax",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "childCredit",
            "label": "19. Child tax credit / credit for other dependents",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherCredits",
            "label": "20. Other credits",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalTax",
            "label": "24. Total tax",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "schedule2Line3",
            "label": "17. Amount from Schedule 2, line 3",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "line18",
            "label": "18. Add lines 16 and 17",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "line21",
            "label": "21. Add lines 19 and 20",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "line22",
            "label": "22. Subtract line 21 from line 18",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherTaxes",
            "label": "23. Other taxes, including self-employment tax",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Payments, Refund, and Amount Owed",
        "fields": [
          {
            "id": "federalWithholding",
            "label": "25. Federal income tax withheld",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "estimatedPayments",
            "label": "26. Estimated tax payments",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "earnedIncomeCredit",
            "label": "27. Earned income credit",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "additionalChildCredit",
            "label": "28. Additional child tax credit",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherPayments",
            "label": "31. Other payments",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalPayments",
            "label": "33. Total payments",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "overpaid",
            "label": "34. Overpaid",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "refund",
            "label": "35a. Refund",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "appliedToEstimatedTax",
            "label": "36. Applied to estimated tax",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "amountOwed",
            "label": "37. Amount owed",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "estimatedTaxPenalty",
            "label": "38. Estimated tax penalty",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Third Party Designee and Paid Preparer",
        "fields": [
          {
            "id": "designeeAllowed",
            "label": "Authorize another person to discuss this return",
            "type": "select",
            "options": [
              "Yes",
              "No"
            ]
          },
          {
            "id": "designeeName",
            "label": "Designee name",
            "type": "text"
          },
          {
            "id": "designeePhone",
            "label": "Designee phone",
            "type": "text"
          },
          {
            "id": "designeePin",
            "label": "Personal identification number",
            "type": "text"
          },
          {
            "id": "preparerInfo",
            "label": "Paid preparer information",
            "type": "table",
            "columns": [
              {
                "id": "name",
                "label": "Preparer name",
                "type": "text"
              },
              {
                "id": "ptin",
                "label": "PTIN",
                "type": "text"
              },
              {
                "id": "firmName",
                "label": "Firm name",
                "type": "text"
              },
              {
                "id": "firmEin",
                "label": "Firm EIN",
                "type": "password",
                "sensitive": true
              },
              {
                "id": "phone",
                "label": "Phone",
                "type": "text"
              },
              {
                "id": "address",
                "label": "Firm address",
                "type": "text"
              },
              {
                "id": "selfEmployed",
                "label": "Self-employed",
                "type": "checkbox"
              }
            ],
            "wide": true,
            "minRows": 1,
            "maxRows": 1
          },
          {
            "id": "occupation",
            "label": "Taxpayer occupation",
            "type": "text"
          },
          {
            "id": "spouseOccupation",
            "label": "Spouse occupation",
            "type": "text"
          },
          {
            "id": "identityProtectionPin",
            "label": "Identity protection PIN",
            "type": "password",
            "sensitive": true
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "scheduleC": {
    "group": "Individual Income Tax",
    "agency": "Internal Revenue Service",
    "formNumber": "Schedule C (Form 1040)",
    "title": "Profit or Loss From Business",
    "shortTitle": "Schedule C — Business Profit or Loss",
    "revision": "Current tax-year revision — verify before filing",
    "purpose": "Used by sole proprietors and certain single-member LLC owners to report business income and expenses.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-schedule-c-form-1040",
    "instructionsUrl": "https://www.irs.gov/instructions/i1040sc",
    "sections": [
      {
        "title": "Business Information",
        "fields": [
          {
            "id": "ownerName",
            "label": "Proprietor name",
            "type": "text",
            "required": true
          },
          {
            "id": "ssn",
            "label": "SSN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "businessName",
            "label": "Business name",
            "type": "text"
          },
          {
            "id": "ein",
            "label": "EIN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "businessCode",
            "label": "Principal business code",
            "type": "text"
          },
          {
            "id": "businessAddress",
            "label": "Business address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "accountingMethod",
            "label": "Accounting method",
            "type": "select",
            "options": [
              "Cash",
              "Accrual",
              "Other"
            ]
          },
          {
            "id": "materialParticipation",
            "label": "Materially participated in operation of business",
            "type": "select",
            "options": [
              "Yes",
              "No"
            ]
          },
          {
            "id": "paymentsRequire1099",
            "label": "Made payments that require Forms 1099",
            "type": "select",
            "options": [
              "Yes",
              "No"
            ]
          }
        ]
      },
      {
        "title": "Part I — Income",
        "fields": [
          {
            "id": "grossReceipts",
            "label": "1. Gross receipts or sales",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "returnsAllowances",
            "label": "2. Returns and allowances",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "cogs",
            "label": "4. Cost of goods sold",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherIncome",
            "label": "6. Other income",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "grossIncome",
            "label": "7. Gross income",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherIncomeDetails",
            "label": "6. Other income details",
            "type": "table",
            "columns": [
              {
                "id": "description",
                "label": "Description",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Part II — Expenses",
        "fields": [
          {
            "id": "advertising",
            "label": "8. Advertising",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "carTruck",
            "label": "9. Car and truck expenses",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "commissions",
            "label": "10. Commissions and fees",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "contractLabor",
            "label": "11. Contract labor",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "depletion",
            "label": "12. Depletion",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "depreciation",
            "label": "13. Depreciation",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "employeeBenefits",
            "label": "14. Employee benefit programs",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "insurance",
            "label": "15. Insurance",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "interest",
            "label": "16. Interest",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "legalProfessional",
            "label": "17. Legal and professional services",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "officeExpense",
            "label": "18. Office expense",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "pensionProfitSharing",
            "label": "19. Pension and profit-sharing plans",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "rentLease",
            "label": "20. Rent or lease",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "repairsMaintenance",
            "label": "21. Repairs and maintenance",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "supplies",
            "label": "22. Supplies",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "taxesLicenses",
            "label": "23. Taxes and licenses",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "travelMeals",
            "label": "24. Travel and meals",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "utilities",
            "label": "25. Utilities",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "wages",
            "label": "26. Wages",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherExpenses",
            "label": "27a. Other expenses",
            "type": "table",
            "columns": [
              {
                "id": "description",
                "label": "Expense description",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 2
          },
          {
            "id": "totalExpenses",
            "label": "28. Total expenses",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "homeOffice",
            "label": "30. Business use of home",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "netProfitLoss",
            "label": "31. Net profit or loss",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Part III — Cost of Goods Sold",
        "fields": [
          {
            "id": "inventoryMethod",
            "label": "33. Method used to value closing inventory",
            "type": "select",
            "options": [
              "Cost",
              "Lower of cost or market",
              "Other"
            ]
          },
          {
            "id": "inventoryBeginning",
            "label": "35. Inventory at beginning of year",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "purchases",
            "label": "36. Purchases less cost of items withdrawn for personal use",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "costLabor",
            "label": "37. Cost of labor",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "materialsSupplies",
            "label": "38. Materials and supplies",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherCosts",
            "label": "39. Other costs",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalCogsBeforeEnding",
            "label": "40. Add lines 35 through 39",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "inventoryEnding",
            "label": "41. Inventory at end of year",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "calculatedCogs",
            "label": "42. Cost of goods sold",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Vehicle Information",
        "fields": [
          {
            "id": "vehiclePlacedInService",
            "label": "Date vehicle placed in service",
            "type": "date"
          },
          {
            "id": "businessMiles",
            "label": "Business miles",
            "type": "number"
          },
          {
            "id": "commutingMiles",
            "label": "Commuting miles",
            "type": "number"
          },
          {
            "id": "otherMiles",
            "label": "Other miles",
            "type": "number"
          },
          {
            "id": "vehicleAvailablePersonal",
            "label": "Vehicle available for personal use during off-duty hours",
            "type": "select",
            "options": [
              "Yes",
              "No"
            ]
          },
          {
            "id": "evidenceToSupport",
            "label": "Evidence supports the deduction",
            "type": "select",
            "options": [
              "Yes",
              "No"
            ]
          },
          {
            "id": "evidenceWritten",
            "label": "Evidence is written",
            "type": "select",
            "options": [
              "Yes",
              "No"
            ]
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "f1040es": {
    "group": "Individual Income Tax",
    "agency": "Internal Revenue Service",
    "formNumber": "Form 1040-ES",
    "title": "Estimated Tax for Individuals",
    "shortTitle": "1040-ES — Estimated Tax",
    "revision": "Current tax-year revision — verify before filing",
    "purpose": "Used to calculate and pay estimated federal income tax for individuals.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-1040-es",
    "instructionsUrl": "https://www.irs.gov/forms-pubs/about-form-1040-es",
    "sections": [
      {
        "title": "Taxpayer",
        "fields": [
          {
            "id": "taxYear",
            "label": "Tax year",
            "type": "number"
          },
          {
            "id": "taxpayerName",
            "label": "Name",
            "type": "text",
            "required": true
          },
          {
            "id": "ssn",
            "label": "SSN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "spouseName",
            "label": "Spouse name",
            "type": "text"
          },
          {
            "id": "spouseSsn",
            "label": "Spouse SSN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "address",
            "label": "Address",
            "type": "textarea",
            "wide": true
          }
        ]
      },
      {
        "title": "Estimated Tax Worksheet",
        "fields": [
          {
            "id": "expectedAgi",
            "label": "Expected adjusted gross income",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "deductions",
            "label": "Estimated deductions",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "taxableIncome",
            "label": "Estimated taxable income",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "estimatedTax",
            "label": "Estimated income tax",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "selfEmploymentTax",
            "label": "Estimated self-employment tax",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "credits",
            "label": "Estimated credits",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherTaxes",
            "label": "Other taxes",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "withholdingCredits",
            "label": "Expected withholding and refundable credits",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "requiredAnnualPayment",
            "label": "Required annual payment",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Payment Vouchers",
        "fields": [
          {
            "id": "voucher1",
            "label": "First installment",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "voucher2",
            "label": "Second installment",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "voucher3",
            "label": "Third installment",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "voucher4",
            "label": "Fourth installment",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "voucher1Due",
            "label": "Voucher 1 due date",
            "type": "date"
          },
          {
            "id": "voucher2Due",
            "label": "Voucher 2 due date",
            "type": "date"
          },
          {
            "id": "voucher3Due",
            "label": "Voucher 3 due date",
            "type": "date"
          },
          {
            "id": "voucher4Due",
            "label": "Voucher 4 due date",
            "type": "date"
          },
          {
            "id": "daytimePhone",
            "label": "Daytime phone number",
            "type": "tel"
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "f1040x": {
    "group": "Individual Income Tax",
    "agency": "Internal Revenue Service",
    "formNumber": "Form 1040-X",
    "title": "Amended U.S. Individual Income Tax Return",
    "shortTitle": "1040-X — Amended Return",
    "revision": "Current revision — verify before filing",
    "purpose": "Used to amend a previously filed individual income tax return.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-1040-x",
    "instructionsUrl": "https://www.irs.gov/instructions/i1040x",
    "sections": [
      {
        "title": "Taxpayer and Return Information",
        "fields": [
          {
            "id": "calendarYear",
            "label": "Calendar year being amended",
            "type": "number"
          },
          {
            "id": "fiscalPeriod",
            "label": "Fiscal-year period",
            "type": "text"
          },
          {
            "id": "name",
            "label": "Taxpayer name",
            "type": "text",
            "required": true
          },
          {
            "id": "ssn",
            "label": "SSN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "spouseName",
            "label": "Spouse name",
            "type": "text"
          },
          {
            "id": "spouseSsn",
            "label": "Spouse SSN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "address",
            "label": "Current address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "originalForm",
            "label": "Original return form",
            "type": "select",
            "options": [
              "1040",
              "1040-SR",
              "1040-NR",
              "Other"
            ]
          },
          {
            "id": "filingStatusOriginal",
            "label": "Original filing status",
            "type": "select",
            "options": [
              "Single",
              "Married filing jointly",
              "Married filing separately",
              "Head of household",
              "Qualifying surviving spouse"
            ]
          },
          {
            "id": "filingStatusCorrected",
            "label": "Corrected filing status",
            "type": "select",
            "options": [
              "Single",
              "Married filing jointly",
              "Married filing separately",
              "Head of household",
              "Qualifying surviving spouse"
            ]
          }
        ]
      },
      {
        "title": "Income and Deductions",
        "fields": [
          {
            "id": "originalAgi",
            "label": "1A. Original adjusted gross income",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "netChangeAgi",
            "label": "1B. Net change",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "correctAgi",
            "label": "1C. Correct amount",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "originalDeductions",
            "label": "2A. Original deductions",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "changeDeductions",
            "label": "2B. Net change",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "correctDeductions",
            "label": "2C. Correct amount",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "originalTaxableIncome",
            "label": "5A. Original taxable income",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "changeTaxableIncome",
            "label": "5B. Net change",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "correctTaxableIncome",
            "label": "5C. Correct amount",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Tax Liability and Payments",
        "fields": [
          {
            "id": "originalTax",
            "label": "6A. Original tax",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "changeTax",
            "label": "6B. Net change",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "correctTax",
            "label": "6C. Correct tax",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "credits",
            "label": "7–12. Credits",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalTax",
            "label": "11. Total tax",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "payments",
            "label": "12–17. Payments",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "overpayment",
            "label": "21. Overpayment",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "amountOwed",
            "label": "20. Amount owed",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Explanation of Changes",
        "fields": [
          {
            "id": "explanation",
            "label": "Part III — Detailed explanation of changes",
            "type": "table",
            "columns": [
              {
                "id": "formOrSchedule",
                "label": "Form / schedule / line",
                "type": "text"
              },
              {
                "id": "originalEntry",
                "label": "Original entry",
                "type": "text"
              },
              {
                "id": "correctedEntry",
                "label": "Corrected entry",
                "type": "text"
              },
              {
                "id": "reason",
                "label": "Reason and supporting document",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 2
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "f941": {
    "group": "Employment Taxes",
    "agency": "Internal Revenue Service",
    "formNumber": "Form 941",
    "title": "Employer’s Quarterly Federal Tax Return",
    "shortTitle": "941 — Quarterly Payroll Tax Return",
    "revision": "Rev. March 2026",
    "purpose": "Used by employers to report federal income tax withheld and both employee and employer Social Security and Medicare taxes.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-941",
    "instructionsUrl": "https://www.irs.gov/instructions/i941",
    "sections": [
      {
        "title": "Employer and Quarter",
        "fields": [
          {
            "id": "ein",
            "label": "Employer identification number",
            "type": "password",
            "sensitive": true,
            "required": true
          },
          {
            "id": "employerName",
            "label": "Employer name",
            "type": "text",
            "required": true
          },
          {
            "id": "tradeName",
            "label": "Trade name",
            "type": "text"
          },
          {
            "id": "address",
            "label": "Address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "quarter",
            "label": "Quarter",
            "type": "select",
            "options": [
              "1: January–March",
              "2: April–June",
              "3: July–September",
              "4: October–December"
            ],
            "required": true
          },
          {
            "id": "taxYear",
            "label": "Tax year",
            "type": "number",
            "required": true
          }
        ]
      },
      {
        "title": "Part 1 — Wages and Taxes",
        "fields": [
          {
            "id": "numberEmployees",
            "label": "1. Number of employees",
            "type": "number"
          },
          {
            "id": "wagesTips",
            "label": "2. Wages, tips, and other compensation",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "federalWithholding",
            "label": "3. Federal income tax withheld",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "noSocialSecurityMedicare",
            "label": "4. Wages not subject to Social Security or Medicare tax",
            "type": "checkbox"
          },
          {
            "id": "taxableSocialSecurityWages",
            "label": "5a. Taxable Social Security wages",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "taxableSocialSecurityTips",
            "label": "5b. Taxable Social Security tips",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "taxableMedicareWages",
            "label": "5c. Taxable Medicare wages and tips",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "additionalMedicareWages",
            "label": "5d. Wages subject to Additional Medicare Tax withholding",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalSsMedicareTaxes",
            "label": "5e. Total Social Security and Medicare taxes",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "section3121q",
            "label": "5f. Section 3121(q) notice and demand tax",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "adjustments",
            "label": "7–9. Current quarter adjustments",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalTaxesBeforeAdjustments",
            "label": "6. Total taxes before adjustments",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalTaxesAfterAdjustments",
            "label": "10. Total taxes after adjustments",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "payrollTaxCredit",
            "label": "11. Payroll tax credit",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalTaxesAfterCredits",
            "label": "12. Total taxes after adjustments and credits",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "deposits",
            "label": "13. Total deposits and refundable credits",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "balanceDue",
            "label": "14. Balance due",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "overpayment",
            "label": "15. Overpayment",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "qualifiedSickLeaveWages",
            "label": "Qualified sick leave wages, if applicable",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "qualifiedFamilyLeaveWages",
            "label": "Qualified family leave wages, if applicable",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Part 2 — Deposit Schedule and Tax Liability",
        "fields": [
          {
            "id": "depositSchedule",
            "label": "Deposit schedule",
            "type": "select",
            "options": [
              "Monthly schedule depositor",
              "Semiweekly schedule depositor — Schedule B required",
              "Tax liability less than $2,500"
            ]
          },
          {
            "id": "monthlyLiability",
            "label": "Monthly tax liability",
            "type": "table",
            "columns": [
              {
                "id": "period",
                "label": "Month",
                "type": "select",
                "options": [
                  "Month 1",
                  "Month 2",
                  "Month 3"
                ]
              },
              {
                "id": "liability",
                "label": "Tax liability",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 3,
            "maxRows": 3
          },
          {
            "id": "scheduleBLiabilities",
            "label": "Schedule B — Semiweekly tax liability entries",
            "type": "table",
            "columns": [
              {
                "id": "month",
                "label": "Month",
                "type": "select",
                "options": [
                  "Month 1",
                  "Month 2",
                  "Month 3"
                ]
              },
              {
                "id": "day",
                "label": "Day",
                "type": "number"
              },
              {
                "id": "liability",
                "label": "Liability",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Part 3 — Business Status",
        "fields": [
          {
            "id": "closedBusiness",
            "label": "Business closed or stopped paying wages",
            "type": "checkbox"
          },
          {
            "id": "finalWageDate",
            "label": "Final date wages were paid",
            "type": "date"
          },
          {
            "id": "seasonalEmployer",
            "label": "Seasonal employer",
            "type": "checkbox"
          }
        ]
      },
      {
        "title": "Part 4–5 — Designee and Signature",
        "fields": [
          {
            "id": "designeeAllowed",
            "label": "Allow third-party designee",
            "type": "select",
            "options": [
              "Yes",
              "No"
            ]
          },
          {
            "id": "designeeName",
            "label": "Designee name",
            "type": "text"
          },
          {
            "id": "designeePhone",
            "label": "Designee phone",
            "type": "text"
          },
          {
            "id": "signerName",
            "label": "Authorized signer name",
            "type": "text"
          },
          {
            "id": "signerTitle",
            "label": "Signer title",
            "type": "text"
          },
          {
            "id": "signerPhone",
            "label": "Signer phone",
            "type": "text"
          },
          {
            "id": "signatureDate",
            "label": "Date",
            "type": "date"
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "f940": {
    "group": "Employment Taxes",
    "agency": "Internal Revenue Service",
    "formNumber": "Form 940",
    "title": "Employer’s Annual Federal Unemployment (FUTA) Tax Return",
    "shortTitle": "940 — Annual FUTA Tax Return",
    "revision": "Current annual revision — verify before filing",
    "purpose": "Used by employers to report annual Federal Unemployment Tax Act tax.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-940",
    "instructionsUrl": "https://www.irs.gov/instructions/i940",
    "sections": [
      {
        "title": "Employer",
        "fields": [
          {
            "id": "ein",
            "label": "Employer identification number",
            "type": "password",
            "sensitive": true,
            "required": true
          },
          {
            "id": "employerName",
            "label": "Employer name",
            "type": "text",
            "required": true
          },
          {
            "id": "tradeName",
            "label": "Trade name",
            "type": "text"
          },
          {
            "id": "address",
            "label": "Address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "taxYear",
            "label": "Tax year",
            "type": "number",
            "required": true
          }
        ]
      },
      {
        "title": "Part 1 — State Unemployment Information",
        "fields": [
          {
            "id": "paidOneState",
            "label": "Paid state unemployment tax in only one state",
            "type": "select",
            "options": [
              "Yes",
              "No"
            ]
          },
          {
            "id": "state",
            "label": "State",
            "type": "text"
          },
          {
            "id": "multiStateEmployer",
            "label": "Multi-state employer",
            "type": "select",
            "options": [
              "Yes",
              "No"
            ]
          },
          {
            "id": "creditReductionState",
            "label": "Wages paid in a credit-reduction state",
            "type": "select",
            "options": [
              "Yes",
              "No"
            ]
          },
          {
            "id": "creditReductionStates",
            "label": "Credit reduction state details",
            "type": "table",
            "columns": [
              {
                "id": "state",
                "label": "State",
                "type": "text"
              },
              {
                "id": "futaWages",
                "label": "FUTA taxable wages",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "rate",
                "label": "Reduction rate",
                "type": "number"
              },
              {
                "id": "creditReduction",
                "label": "Credit reduction",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Part 2 — FUTA Tax Before Adjustments",
        "fields": [
          {
            "id": "totalPayments",
            "label": "3. Total payments to all employees",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "exemptPayments",
            "label": "4. Payments exempt from FUTA tax",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "paymentsOverLimit",
            "label": "5. Payments over the FUTA wage limit",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "taxableFutaWages",
            "label": "7. Total taxable FUTA wages",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "futaTaxBeforeAdjustments",
            "label": "8. FUTA tax before adjustments",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "exemptPaymentDetails",
            "label": "4. Payments exempt from FUTA tax — categories",
            "type": "table",
            "columns": [
              {
                "id": "category",
                "label": "Category",
                "type": "select",
                "options": [
                  "Fringe benefits",
                  "Group-term life insurance",
                  "Retirement/pension",
                  "Dependent care",
                  "Other"
                ]
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Part 3–4 — Adjustments and Tax",
        "fields": [
          {
            "id": "allWagesExcludedAdjustment",
            "label": "9. Adjustment if all taxable FUTA wages were excluded from state unemployment tax",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "someWagesExcludedAdjustment",
            "label": "10. Adjustment if some taxable FUTA wages were excluded or state tax paid late",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "creditReductionAdjustment",
            "label": "11. Credit reduction adjustment",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalFutaTax",
            "label": "12. Total FUTA tax after adjustments",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Part 5 — Tax Liability by Quarter",
        "fields": [
          {
            "id": "q1Liability",
            "label": "16a. First quarter",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "q2Liability",
            "label": "16b. Second quarter",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "q3Liability",
            "label": "16c. Third quarter",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "q4Liability",
            "label": "16d. Fourth quarter",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalLiability",
            "label": "17. Total liability",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Part 6–7 — Designee and Signature",
        "fields": [
          {
            "id": "designeeAllowed",
            "label": "Allow third-party designee",
            "type": "select",
            "options": [
              "Yes",
              "No"
            ]
          },
          {
            "id": "designeeName",
            "label": "Designee name",
            "type": "text"
          },
          {
            "id": "signerName",
            "label": "Authorized signer name",
            "type": "text"
          },
          {
            "id": "signerTitle",
            "label": "Signer title",
            "type": "text"
          },
          {
            "id": "signatureDate",
            "label": "Date",
            "type": "date"
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "ss4": {
    "group": "Business Registration",
    "agency": "Internal Revenue Service",
    "formNumber": "Form SS-4",
    "title": "Application for Employer Identification Number",
    "shortTitle": "SS-4 — EIN Application",
    "revision": "Current revision — verify before filing",
    "purpose": "Used to apply for an employer identification number.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-ss-4",
    "instructionsUrl": "https://www.irs.gov/instructions/iss4",
    "sections": [
      {
        "title": "Entity",
        "fields": [
          {
            "id": "legalName",
            "label": "1. Legal name of entity or individual",
            "type": "text",
            "required": true,
            "wide": true
          },
          {
            "id": "tradeName",
            "label": "2. Trade name",
            "type": "text"
          },
          {
            "id": "executorTrusteeName",
            "label": "3. Executor, administrator, trustee, or care-of name",
            "type": "text"
          },
          {
            "id": "mailingAddress",
            "label": "4a–4b. Mailing address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "streetAddress",
            "label": "5a–5b. Street address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "countyState",
            "label": "6. County and state where principal business is located",
            "type": "text"
          }
        ]
      },
      {
        "title": "Responsible Party",
        "fields": [
          {
            "id": "responsiblePartyName",
            "label": "7a. Responsible party name",
            "type": "text",
            "required": true
          },
          {
            "id": "responsiblePartyTin",
            "label": "7b. Responsible party SSN, ITIN, or EIN",
            "type": "password",
            "sensitive": true,
            "required": true
          }
        ]
      },
      {
        "title": "Entity Type and Reason",
        "fields": [
          {
            "id": "entityType",
            "label": "9a. Type of entity",
            "type": "select",
            "options": [
              "Sole proprietor",
              "Partnership",
              "Corporation",
              "Personal service corporation",
              "Church or church-controlled organization",
              "Other nonprofit organization",
              "Estate",
              "Trust",
              "Plan administrator",
              "Government entity",
              "LLC",
              "Other"
            ],
            "required": true
          },
          {
            "id": "stateForeignCountry",
            "label": "9b. State or foreign country of incorporation",
            "type": "text"
          },
          {
            "id": "reasonApplying",
            "label": "10. Reason for applying",
            "type": "select",
            "options": [
              "Started new business",
              "Hired employees",
              "Banking purpose",
              "Changed type of organization",
              "Purchased active business",
              "Created a trust",
              "Created a pension plan",
              "Compliance with IRS withholding regulations",
              "Other"
            ]
          },
          {
            "id": "businessStartDate",
            "label": "11. Date business started or acquired",
            "type": "date"
          },
          {
            "id": "closingMonth",
            "label": "12. Closing month of accounting year",
            "type": "text"
          }
        ]
      },
      {
        "title": "Employment and Activity",
        "fields": [
          {
            "id": "agriculturalEmployees",
            "label": "13. Agricultural employees expected",
            "type": "number"
          },
          {
            "id": "householdEmployees",
            "label": "13. Household employees expected",
            "type": "number"
          },
          {
            "id": "otherEmployees",
            "label": "13. Other employees expected",
            "type": "number"
          },
          {
            "id": "firstWageDate",
            "label": "15. First date wages or annuities were paid",
            "type": "date"
          },
          {
            "id": "principalActivity",
            "label": "16. Principal activity",
            "type": "text",
            "wide": true
          },
          {
            "id": "productsServices",
            "label": "17. Principal products, services, merchandise, or construction work",
            "type": "table",
            "columns": [
              {
                "id": "description",
                "label": "Product or service",
                "type": "text"
              },
              {
                "id": "percentage",
                "label": "Percentage of activity",
                "type": "number"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "previousEin",
            "label": "18. Has the applicant ever applied for and received an EIN?",
            "type": "select",
            "options": [
              "Yes",
              "No"
            ]
          },
          {
            "id": "previousEinNumber",
            "label": "Previous EIN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "highestEmployeesExpected",
            "label": "14. Highest number of employees expected in next 12 months",
            "type": "number"
          },
          {
            "id": "priorEinDetails",
            "label": "18. Prior EIN details, if any",
            "type": "text",
            "wide": true
          }
        ]
      },
      {
        "title": "Third Party Designee",
        "fields": [
          {
            "id": "designeeName",
            "label": "Designee name",
            "type": "text"
          },
          {
            "id": "designeePhone",
            "label": "Phone",
            "type": "text"
          },
          {
            "id": "designeeAddress",
            "label": "Address",
            "type": "textarea",
            "wide": true
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "w7": {
    "group": "Taxpayer Identification",
    "agency": "Internal Revenue Service",
    "formNumber": "Form W-7",
    "title": "Application for IRS Individual Taxpayer Identification Number",
    "shortTitle": "W-7 — ITIN Application",
    "revision": "Current revision — verify before filing",
    "purpose": "Used by eligible individuals to apply for or renew an IRS individual taxpayer identification number.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-w-7",
    "instructionsUrl": "https://www.irs.gov/instructions/iw7",
    "sections": [
      {
        "title": "Application Reason",
        "fields": [
          {
            "id": "reason",
            "label": "Reason for submitting Form W-7",
            "type": "select",
            "wide": true,
            "options": [
              "Nonresident alien required to get ITIN to claim tax treaty benefit",
              "Nonresident alien filing a U.S. federal tax return",
              "U.S. resident alien filing a U.S. federal tax return",
              "Dependent of U.S. citizen/resident alien",
              "Spouse of U.S. citizen/resident alien",
              "Nonresident alien student, professor, or researcher",
              "Dependent/spouse of nonresident alien holding U.S. visa",
              "Other"
            ],
            "required": true
          },
          {
            "id": "otherReason",
            "label": "Other reason, exception, or treaty details",
            "type": "table",
            "columns": [
              {
                "id": "exceptionNumber",
                "label": "Exception number",
                "type": "text"
              },
              {
                "id": "treatyCountry",
                "label": "Treaty country",
                "type": "text"
              },
              {
                "id": "treatyArticle",
                "label": "Treaty article",
                "type": "text"
              },
              {
                "id": "explanation",
                "label": "Explanation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Applicant Information",
        "fields": [
          {
            "id": "legalName",
            "label": "1a. Legal name",
            "type": "text",
            "required": true,
            "wide": true
          },
          {
            "id": "birthName",
            "label": "1b. Name at birth, if different",
            "type": "text",
            "wide": true
          },
          {
            "id": "mailingAddress",
            "label": "2. Mailing address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "foreignAddress",
            "label": "3. Foreign address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "dateOfBirth",
            "label": "4. Date of birth",
            "type": "date",
            "required": true
          },
          {
            "id": "countryOfBirth",
            "label": "4. Country of birth",
            "type": "text"
          },
          {
            "id": "cityStateBirth",
            "label": "4. City and state/province of birth",
            "type": "text"
          },
          {
            "id": "gender",
            "label": "4. Gender",
            "type": "select",
            "options": [
              "Male",
              "Female"
            ]
          },
          {
            "id": "countriesCitizenship",
            "label": "5. Country or countries of citizenship",
            "type": "text"
          },
          {
            "id": "passportNumber",
            "label": "Passport number",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "passportExpiration",
            "label": "Passport expiration date",
            "type": "date"
          }
        ]
      },
      {
        "title": "Documentation",
        "fields": [
          {
            "id": "documentType",
            "label": "6d. Identification document",
            "type": "select",
            "options": [
              "Passport",
              "National identification card",
              "U.S. driver’s license",
              "Civil birth certificate",
              "Foreign driver’s license",
              "USCIS documentation",
              "Medical records",
              "School records",
              "Other"
            ]
          },
          {
            "id": "documentNumber",
            "label": "Document number",
            "type": "text"
          },
          {
            "id": "issuedBy",
            "label": "Issued by",
            "type": "text"
          },
          {
            "id": "expirationDate",
            "label": "Expiration date",
            "type": "date"
          },
          {
            "id": "entryDateUs",
            "label": "6d. Date of entry into the U.S.",
            "type": "date"
          },
          {
            "id": "visaTypeNumber",
            "label": "6c. U.S. visa type and number",
            "type": "text"
          },
          {
            "id": "visaExpiration",
            "label": "Visa expiration date",
            "type": "date"
          },
          {
            "id": "previousItin",
            "label": "6e. Previously received an ITIN or IRSN",
            "type": "select",
            "options": [
              "Yes",
              "No"
            ]
          },
          {
            "id": "previousItinNumber",
            "label": "Previous ITIN / IRSN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "collegeCompanyAgency",
            "label": "6g. College, university, or company name",
            "type": "text"
          },
          {
            "id": "cityState",
            "label": "6g. City and state",
            "type": "text"
          },
          {
            "id": "lengthOfStay",
            "label": "6g. Length of stay",
            "type": "text"
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "f4506t": {
    "group": "Records and Authorizations",
    "agency": "Internal Revenue Service",
    "formNumber": "Form 4506-T",
    "title": "Request for Transcript of Tax Return",
    "shortTitle": "4506-T — Tax Transcript Request",
    "revision": "Current revision — verify before filing",
    "purpose": "Used to request specified tax return transcripts and related tax records.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-4506-t",
    "instructionsUrl": "https://www.irs.gov/forms-pubs/about-form-4506-t",
    "sections": [
      {
        "title": "Taxpayer",
        "fields": [
          {
            "id": "taxpayerName",
            "label": "1a. Taxpayer name",
            "type": "text",
            "required": true
          },
          {
            "id": "taxpayerId",
            "label": "1b. SSN or EIN",
            "type": "password",
            "sensitive": true,
            "required": true
          },
          {
            "id": "spouseName",
            "label": "2a. Spouse name",
            "type": "text"
          },
          {
            "id": "spouseSsn",
            "label": "2b. Spouse SSN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "currentAddress",
            "label": "3. Current address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "previousAddress",
            "label": "4. Previous address shown on last return",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "customerFileNumber",
            "label": "Customer file number",
            "type": "text"
          }
        ]
      },
      {
        "title": "Transcript Request",
        "fields": [
          {
            "id": "transcriptType",
            "label": "6. Transcript requested",
            "type": "select",
            "options": [
              "Return transcript",
              "Account transcript",
              "Record of account",
              "Verification of nonfiling",
              "Form W-2 / 1099 / 1098 / 5498 transcript",
              "Other"
            ],
            "required": true
          },
          {
            "id": "taxFormNumber",
            "label": "6. Tax form number",
            "type": "text"
          },
          {
            "id": "taxPeriods",
            "label": "9. Year or period requested",
            "type": "text",
            "wide": true
          }
        ]
      },
      {
        "title": "Attestation",
        "fields": [
          {
            "id": "authorityToSign",
            "label": "I have authority to sign and request this information",
            "type": "checkbox",
            "value": true
          },
          {
            "id": "phone",
            "label": "Telephone number",
            "type": "text"
          },
          {
            "id": "signatureDate",
            "label": "Date",
            "type": "date"
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "f2848": {
    "group": "Records and Authorizations",
    "agency": "Internal Revenue Service",
    "formNumber": "Form 2848",
    "title": "Power of Attorney and Declaration of Representative",
    "shortTitle": "2848 — Tax Power of Attorney",
    "revision": "Current revision — verify before filing",
    "purpose": "Used to authorize eligible individuals to represent a taxpayer before the IRS and receive tax information.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-2848",
    "instructionsUrl": "https://www.irs.gov/instructions/i2848",
    "sections": [
      {
        "title": "Taxpayer Information",
        "fields": [
          {
            "id": "taxpayerName",
            "label": "Taxpayer name",
            "type": "text",
            "required": true
          },
          {
            "id": "taxpayerAddress",
            "label": "Address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "taxpayerId",
            "label": "Taxpayer identification number",
            "type": "password",
            "sensitive": true,
            "required": true
          },
          {
            "id": "planNumber",
            "label": "Plan number, if applicable",
            "type": "text"
          },
          {
            "id": "daytimePhone",
            "label": "Daytime phone",
            "type": "text"
          }
        ]
      },
      {
        "title": "Representative(s)",
        "fields": [
          {
            "id": "representatives",
            "label": "Representative(s)",
            "type": "table",
            "columns": [
              {
                "id": "name",
                "label": "Name",
                "type": "text"
              },
              {
                "id": "address",
                "label": "Address",
                "type": "text"
              },
              {
                "id": "caf",
                "label": "CAF number",
                "type": "text"
              },
              {
                "id": "ptin",
                "label": "PTIN",
                "type": "text"
              },
              {
                "id": "phone",
                "label": "Phone",
                "type": "text"
              },
              {
                "id": "fax",
                "label": "Fax",
                "type": "text"
              },
              {
                "id": "email",
                "label": "Email",
                "type": "email"
              },
              {
                "id": "receiveNotices",
                "label": "Receive notices",
                "type": "checkbox"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Acts Authorized",
        "fields": [
          {
            "id": "taxMatters",
            "label": "Tax matters authorized",
            "type": "table",
            "columns": [
              {
                "id": "description",
                "label": "Description of matter",
                "type": "text"
              },
              {
                "id": "formNumber",
                "label": "Tax form number",
                "type": "text"
              },
              {
                "id": "yearsPeriods",
                "label": "Year(s) / period(s)",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "specificUse",
            "label": "Specific-use limitations or additional acts authorized",
            "type": "table",
            "columns": [
              {
                "id": "type",
                "label": "Type",
                "type": "text"
              },
              {
                "id": "details",
                "label": "Details",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "retainPriorPoa",
            "label": "Prior powers of attorney to retain",
            "type": "table",
            "columns": [
              {
                "id": "representative",
                "label": "Representative",
                "type": "text"
              },
              {
                "id": "matter",
                "label": "Matter",
                "type": "text"
              },
              {
                "id": "period",
                "label": "Period",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "copiesToRetain",
            "label": "List prior powers of attorney to retain",
            "type": "textarea",
            "wide": true
          }
        ]
      },
      {
        "title": "Taxpayer Signature",
        "fields": [
          {
            "id": "taxpayerSignatureName",
            "label": "Printed name of signer",
            "type": "text"
          },
          {
            "id": "signerTitle",
            "label": "Title, if applicable",
            "type": "text"
          },
          {
            "id": "signatureDate",
            "label": "Date",
            "type": "date"
          }
        ]
      },
      {
        "title": "Declaration of Representative",
        "fields": [
          {
            "id": "representativeDeclarations",
            "label": "Declaration of representative",
            "type": "table",
            "columns": [
              {
                "id": "representativeName",
                "label": "Representative name",
                "type": "text"
              },
              {
                "id": "designation",
                "label": "Designation",
                "type": "select",
                "options": [
                  "Attorney",
                  "Certified public accountant",
                  "Enrolled agent",
                  "Officer",
                  "Full-time employee",
                  "Family member",
                  "Enrolled actuary",
                  "Unenrolled return preparer",
                  "Other"
                ]
              },
              {
                "id": "jurisdiction",
                "label": "Jurisdiction / licensing authority",
                "type": "text"
              },
              {
                "id": "licenseNumber",
                "label": "License / enrollment number",
                "type": "text"
              },
              {
                "id": "signatureDate",
                "label": "Date",
                "type": "date"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "f9465": {
    "group": "Payments and Collections",
    "agency": "Internal Revenue Service",
    "formNumber": "Form 9465",
    "title": "Installment Agreement Request",
    "shortTitle": "9465 — Installment Agreement Request",
    "revision": "Current revision — verify before filing",
    "purpose": "Used to request a monthly installment agreement for qualifying federal tax liabilities.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-9465",
    "instructionsUrl": "https://www.irs.gov/instructions/i9465",
    "sections": [
      {
        "title": "Taxpayer",
        "fields": [
          {
            "id": "name",
            "label": "Taxpayer name",
            "type": "text",
            "required": true
          },
          {
            "id": "ssnEin",
            "label": "SSN or EIN",
            "type": "password",
            "sensitive": true,
            "required": true
          },
          {
            "id": "spouseName",
            "label": "Spouse name",
            "type": "text"
          },
          {
            "id": "spouseSsn",
            "label": "Spouse SSN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "address",
            "label": "Address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "phone",
            "label": "Phone",
            "type": "text"
          },
          {
            "id": "bankruptcy",
            "label": "Currently in bankruptcy",
            "type": "checkbox"
          }
        ]
      },
      {
        "title": "Tax Liability",
        "fields": [
          {
            "id": "taxForms",
            "label": "Tax return form(s)",
            "type": "text"
          },
          {
            "id": "taxPeriods",
            "label": "Tax period(s)",
            "type": "text"
          },
          {
            "id": "amountOwed",
            "label": "Amount owed",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "paymentNow",
            "label": "Payment submitted now",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "remainingBalance",
            "label": "Remaining balance",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Proposed Agreement",
        "fields": [
          {
            "id": "monthlyPayment",
            "label": "Proposed monthly payment",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "paymentDay",
            "label": "Requested payment day of month",
            "type": "number"
          },
          {
            "id": "directDebit",
            "label": "Use direct debit",
            "type": "checkbox"
          },
          {
            "id": "payrollDeduction",
            "label": "Use payroll deduction",
            "type": "checkbox"
          },
          {
            "id": "routingNumber",
            "label": "Bank routing number",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "accountNumber",
            "label": "Bank account number",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "accountType",
            "label": "Account type",
            "type": "select",
            "options": [
              "Checking",
              "Savings"
            ]
          },
          {
            "id": "paymentMethod",
            "label": "Payment method",
            "type": "select",
            "options": [
              "Direct debit",
              "Payroll deduction",
              "Online payment",
              "Check or money order",
              "Other"
            ]
          }
        ]
      },
      {
        "title": "Financial Information",
        "fields": [
          {
            "id": "wages",
            "label": "Monthly wages",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "selfEmploymentIncome",
            "label": "Monthly self-employment income",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherIncome",
            "label": "Other monthly income",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "livingExpenses",
            "label": "Monthly living expenses",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherPayments",
            "label": "Other monthly debt payments",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "w8ben": {
    "group": "International",
    "agency": "Internal Revenue Service",
    "formNumber": "Form W-8BEN",
    "title": "Certificate of Foreign Status of Beneficial Owner for United States Tax Withholding and Reporting (Individuals)",
    "shortTitle": "W-8BEN — Foreign Individual Status",
    "revision": "Current revision — verify before filing",
    "purpose": "Used by a foreign individual to establish foreign status and, when applicable, claim tax treaty benefits.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-w-8-ben",
    "instructionsUrl": "https://www.irs.gov/instructions/iw8ben",
    "sections": [
      {
        "title": "Part I — Beneficial Owner",
        "fields": [
          {
            "id": "name",
            "label": "1. Name of individual",
            "type": "text",
            "required": true
          },
          {
            "id": "citizenship",
            "label": "2. Country of citizenship",
            "type": "text",
            "required": true
          },
          {
            "id": "permanentAddress",
            "label": "3. Permanent residence address",
            "type": "textarea",
            "wide": true,
            "required": true
          },
          {
            "id": "mailingAddress",
            "label": "4. Mailing address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "usTin",
            "label": "5. U.S. TIN, if required",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "foreignTin",
            "label": "6a. Foreign TIN",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "foreignTinNotRequired",
            "label": "6b. Foreign TIN not legally required",
            "type": "checkbox"
          },
          {
            "id": "referenceNumbers",
            "label": "7. Reference number(s)",
            "type": "text"
          },
          {
            "id": "dateOfBirth",
            "label": "8. Date of birth",
            "type": "date"
          }
        ]
      },
      {
        "title": "Part II — Treaty Benefits",
        "fields": [
          {
            "id": "treatyCountry",
            "label": "9. Treaty country",
            "type": "text"
          },
          {
            "id": "specialRates",
            "label": "10. Special rates and conditions",
            "type": "table",
            "columns": [
              {
                "id": "article",
                "label": "Treaty article / paragraph",
                "type": "text"
              },
              {
                "id": "withholdingRate",
                "label": "Withholding rate",
                "type": "number"
              },
              {
                "id": "incomeType",
                "label": "Type of income",
                "type": "text"
              },
              {
                "id": "conditions",
                "label": "Additional conditions and explanation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Part III — Certification",
        "fields": [
          {
            "id": "capacity",
            "label": "Capacity in which acting",
            "type": "text"
          },
          {
            "id": "signatureDate",
            "label": "Date",
            "type": "date"
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "f1065": {
    "group": "Business Returns",
    "agency": "Internal Revenue Service",
    "formNumber": "Form 1065",
    "title": "U.S. Return of Partnership Income",
    "shortTitle": "1065 — Partnership Return",
    "revision": "Current tax-year revision — verify before filing",
    "purpose": "Used by partnerships to report income, gains, losses, deductions, credits, and partner information.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-1065",
    "instructionsUrl": "https://www.irs.gov/instructions/i1065",
    "sections": [
      {
        "title": "Partnership Information",
        "fields": [
          {
            "id": "taxYear",
            "label": "Tax year",
            "type": "text"
          },
          {
            "id": "partnershipName",
            "label": "Partnership name",
            "type": "text",
            "required": true
          },
          {
            "id": "address",
            "label": "Address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "ein",
            "label": "EIN",
            "type": "password",
            "sensitive": true,
            "required": true
          },
          {
            "id": "businessActivity",
            "label": "Principal business activity",
            "type": "text"
          },
          {
            "id": "productService",
            "label": "Principal product or service",
            "type": "text"
          },
          {
            "id": "businessCode",
            "label": "Business code number",
            "type": "text"
          },
          {
            "id": "dateBusinessStarted",
            "label": "Date business started",
            "type": "date"
          },
          {
            "id": "totalAssets",
            "label": "Total assets",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "numberSchedulesK1",
            "label": "Number of Schedules K-1",
            "type": "number"
          },
          {
            "id": "accountingMethod",
            "label": "Accounting method",
            "type": "select",
            "options": [
              "Cash",
              "Accrual",
              "Other"
            ]
          }
        ]
      },
      {
        "title": "Income",
        "fields": [
          {
            "id": "grossReceipts",
            "label": "1a. Gross receipts or sales",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "returnsAllowances",
            "label": "1b. Returns and allowances",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "cogs",
            "label": "2. Cost of goods sold",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "grossProfit",
            "label": "3. Gross profit",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "ordinaryIncomeOtherPartnerships",
            "label": "4. Ordinary income from other partnerships",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "netFarmProfit",
            "label": "5. Net farm profit or loss",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "netGain4797",
            "label": "6. Net gain from Form 4797",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherIncome",
            "label": "7. Other income",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalIncome",
            "label": "8. Total income",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Deductions",
        "fields": [
          {
            "id": "salariesWages",
            "label": "9. Salaries and wages",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "guaranteedPayments",
            "label": "10. Guaranteed payments to partners",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "repairsMaintenance",
            "label": "11. Repairs and maintenance",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "badDebts",
            "label": "12. Bad debts",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "rent",
            "label": "13. Rent",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "taxesLicenses",
            "label": "14. Taxes and licenses",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "interest",
            "label": "15. Interest",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "depreciation",
            "label": "16. Depreciation",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "retirementPlans",
            "label": "18. Retirement plans",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "employeeBenefits",
            "label": "19. Employee benefit programs",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "energyDeduction",
            "label": "20. Energy efficient commercial buildings deduction",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherDeductions",
            "label": "21. Other deductions",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalDeductions",
            "label": "22. Total deductions",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "ordinaryBusinessIncome",
            "label": "23. Ordinary business income or loss",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Schedule B and Partner Information",
        "fields": [
          {
            "id": "scheduleBAnswers",
            "label": "Schedule B — Other information",
            "type": "table",
            "columns": [
              {
                "id": "question",
                "label": "Question / line",
                "type": "text"
              },
              {
                "id": "answer",
                "label": "Answer",
                "type": "select",
                "options": [
                  "Yes",
                  "No",
                  "N/A"
                ]
              },
              {
                "id": "explanation",
                "label": "Explanation / attachment reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 6
          },
          {
            "id": "partnerSummary",
            "label": "Partner and Schedule K-1 information",
            "type": "table",
            "columns": [
              {
                "id": "name",
                "label": "Partner name",
                "type": "text"
              },
              {
                "id": "tin",
                "label": "TIN",
                "type": "password",
                "sensitive": true
              },
              {
                "id": "type",
                "label": "Partner type",
                "type": "select",
                "options": [
                  "Individual",
                  "Estate/trust",
                  "Corporation",
                  "Partnership",
                  "Exempt organization",
                  "Foreign partner",
                  "Other"
                ]
              },
              {
                "id": "profitPct",
                "label": "Profit %",
                "type": "number"
              },
              {
                "id": "lossPct",
                "label": "Loss %",
                "type": "number"
              },
              {
                "id": "capitalPct",
                "label": "Capital %",
                "type": "number"
              },
              {
                "id": "beginningCapital",
                "label": "Beginning capital",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "contributions",
                "label": "Contributions",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "currentYearIncome",
                "label": "Current-year income/loss",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "withdrawals",
                "label": "Withdrawals/distributions",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "endingCapital",
                "label": "Ending capital",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "scheduleKItems",
            "label": "Schedule K — Partners’ distributive share items",
            "type": "table",
            "columns": [
              {
                "id": "line",
                "label": "Line / code",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Description",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 5
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "f1120": {
    "group": "Business Returns",
    "agency": "Internal Revenue Service",
    "formNumber": "Form 1120",
    "title": "U.S. Corporation Income Tax Return",
    "shortTitle": "1120 — C Corporation Return",
    "revision": "Current tax-year revision — verify before filing",
    "purpose": "Used by domestic corporations to report income, gains, losses, deductions, credits, and income tax liability.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-1120",
    "instructionsUrl": "https://www.irs.gov/instructions/i1120",
    "sections": [
      {
        "title": "Corporation Information",
        "fields": [
          {
            "id": "taxYear",
            "label": "Tax year",
            "type": "text"
          },
          {
            "id": "corporationName",
            "label": "Corporation name",
            "type": "text",
            "required": true
          },
          {
            "id": "address",
            "label": "Address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "ein",
            "label": "EIN",
            "type": "password",
            "sensitive": true,
            "required": true
          },
          {
            "id": "dateIncorporated",
            "label": "Date incorporated",
            "type": "date"
          },
          {
            "id": "totalAssets",
            "label": "Total assets",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "initialReturn",
            "label": "Initial return",
            "type": "checkbox"
          },
          {
            "id": "finalReturn",
            "label": "Final return",
            "type": "checkbox"
          },
          {
            "id": "nameChange",
            "label": "Name change",
            "type": "checkbox"
          },
          {
            "id": "addressChange",
            "label": "Address change",
            "type": "checkbox"
          }
        ]
      },
      {
        "title": "Income",
        "fields": [
          {
            "id": "grossReceipts",
            "label": "1a. Gross receipts or sales",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "returnsAllowances",
            "label": "1b. Returns and allowances",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "cogs",
            "label": "2. Cost of goods sold",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "dividends",
            "label": "4. Dividends",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "interest",
            "label": "5. Interest",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "grossRents",
            "label": "6. Gross rents",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "grossRoyalties",
            "label": "7. Gross royalties",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "capitalGain",
            "label": "8. Capital gain net income",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "form4797Gain",
            "label": "9. Net gain or loss from Form 4797",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherIncome",
            "label": "10. Other income",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalIncome",
            "label": "11. Total income",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Deductions",
        "fields": [
          {
            "id": "officerComp",
            "label": "12. Compensation of officers",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "salariesWages",
            "label": "13. Salaries and wages",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "repairsMaintenance",
            "label": "14. Repairs and maintenance",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "badDebts",
            "label": "15. Bad debts",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "rents",
            "label": "16. Rents",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "taxesLicenses",
            "label": "17. Taxes and licenses",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "interestExpense",
            "label": "18. Interest",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "charitableContributions",
            "label": "19. Charitable contributions",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "depreciation",
            "label": "20. Depreciation",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "advertising",
            "label": "22. Advertising",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "pensionProfitSharing",
            "label": "23. Pension and profit-sharing plans",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "employeeBenefits",
            "label": "24. Employee benefit programs",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherDeductions",
            "label": "26. Other deductions",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalDeductions",
            "label": "27. Total deductions",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "taxableIncomeBeforeNol",
            "label": "28. Taxable income before NOL and special deductions",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Tax, Credits, and Payments",
        "fields": [
          {
            "id": "incomeTax",
            "label": "31. Total tax",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "overpaymentPriorYear",
            "label": "32a. Prior-year overpayment",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "estimatedPayments",
            "label": "32b. Estimated tax payments",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "refundClaimed",
            "label": "32c. Refund claimed on Form 4466",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "taxDepositedExtension",
            "label": "32d. Tax deposited with Form 7004",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "creditOther",
            "label": "32e. Credit from other forms",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalPayments",
            "label": "33. Total payments",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "estimatedTaxPenalty",
            "label": "34. Estimated tax penalty",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "amountOwed",
            "label": "35. Amount owed",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "overpayment",
            "label": "36. Overpayment",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Schedules",
        "fields": [
          {
            "id": "scheduleC",
            "label": "Schedule C — Dividends, inclusions, and special deductions",
            "type": "table",
            "columns": [
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Description",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "deduction",
                "label": "Special deduction",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 3
          },
          {
            "id": "scheduleJ",
            "label": "Schedule J — Tax computation and payment",
            "type": "table",
            "columns": [
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Description",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 3
          },
          {
            "id": "scheduleK",
            "label": "Schedule K — Other information",
            "type": "table",
            "columns": [
              {
                "id": "question",
                "label": "Question / line",
                "type": "text"
              },
              {
                "id": "answer",
                "label": "Answer",
                "type": "select",
                "options": [
                  "Yes",
                  "No",
                  "N/A"
                ]
              },
              {
                "id": "details",
                "label": "Details",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 5
          },
          {
            "id": "scheduleL",
            "label": "Schedule L — Balance sheets per books",
            "type": "table",
            "columns": [
              {
                "id": "account",
                "label": "Account / line",
                "type": "text"
              },
              {
                "id": "beginningAssets",
                "label": "Beginning assets",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "beginningLiabilitiesEquity",
                "label": "Beginning liabilities/equity",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "endingAssets",
                "label": "Ending assets",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "endingLiabilitiesEquity",
                "label": "Ending liabilities/equity",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 6
          },
          {
            "id": "scheduleM1M2",
            "label": "Schedules M-1 and M-2 reconciliation",
            "type": "table",
            "columns": [
              {
                "id": "schedule",
                "label": "Schedule",
                "type": "select",
                "options": [
                  "M-1",
                  "M-2"
                ]
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Description",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 4
          },
          {
            "id": "officers",
            "label": "Schedule E — Compensation of officers",
            "type": "table",
            "columns": [
              {
                "id": "name",
                "label": "Officer name",
                "type": "text"
              },
              {
                "id": "ssn",
                "label": "SSN",
                "type": "password",
                "sensitive": true
              },
              {
                "id": "timePct",
                "label": "Time devoted %",
                "type": "number"
              },
              {
                "id": "stockCommonPct",
                "label": "Common stock %",
                "type": "number"
              },
              {
                "id": "stockPreferredPct",
                "label": "Preferred stock %",
                "type": "number"
              },
              {
                "id": "compensation",
                "label": "Compensation",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "f1120s": {
    "group": "Business Returns",
    "agency": "Internal Revenue Service",
    "formNumber": "Form 1120-S",
    "title": "U.S. Income Tax Return for an S Corporation",
    "shortTitle": "1120-S — S Corporation Return",
    "revision": "Current tax-year revision — verify before filing",
    "purpose": "Used by qualifying S corporations to report income, deductions, credits, and shareholder information.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-1120-s",
    "instructionsUrl": "https://www.irs.gov/instructions/i1120s",
    "sections": [
      {
        "title": "Corporation Information",
        "fields": [
          {
            "id": "taxYear",
            "label": "Tax year",
            "type": "text"
          },
          {
            "id": "corporationName",
            "label": "S corporation name",
            "type": "text",
            "required": true
          },
          {
            "id": "address",
            "label": "Address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "ein",
            "label": "EIN",
            "type": "password",
            "sensitive": true,
            "required": true
          },
          {
            "id": "dateIncorporated",
            "label": "Date incorporated",
            "type": "date"
          },
          {
            "id": "sElectionDate",
            "label": "S election effective date",
            "type": "date"
          },
          {
            "id": "businessActivityCode",
            "label": "Business activity code",
            "type": "text"
          },
          {
            "id": "totalAssets",
            "label": "Total assets",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "numberShareholders",
            "label": "Number of shareholders",
            "type": "number"
          }
        ]
      },
      {
        "title": "Income",
        "fields": [
          {
            "id": "grossReceipts",
            "label": "1a. Gross receipts or sales",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "returnsAllowances",
            "label": "1b. Returns and allowances",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "cogs",
            "label": "2. Cost of goods sold",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "grossProfit",
            "label": "3. Gross profit",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "netGain4797",
            "label": "4. Net gain or loss from Form 4797",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherIncome",
            "label": "5. Other income",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalIncome",
            "label": "6. Total income",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Deductions",
        "fields": [
          {
            "id": "officerComp",
            "label": "7. Compensation of officers",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "salariesWages",
            "label": "8. Salaries and wages",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "repairsMaintenance",
            "label": "9. Repairs and maintenance",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "badDebts",
            "label": "10. Bad debts",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "rents",
            "label": "11. Rents",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "taxesLicenses",
            "label": "12. Taxes and licenses",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "interest",
            "label": "13. Interest",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "depreciation",
            "label": "14. Depreciation",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "depletion",
            "label": "15. Depletion",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "advertising",
            "label": "16. Advertising",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "pensionProfitSharing",
            "label": "17. Pension and profit-sharing plans",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "employeeBenefits",
            "label": "18. Employee benefit programs",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "energyDeduction",
            "label": "19. Energy efficient buildings deduction",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherDeductions",
            "label": "20. Other deductions",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalDeductions",
            "label": "21. Total deductions",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "ordinaryBusinessIncome",
            "label": "22. Ordinary business income or loss",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Tax and Payments",
        "fields": [
          {
            "id": "excessNetPassiveIncomeTax",
            "label": "Excess net passive income or LIFO recapture tax",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "builtInGainsTax",
            "label": "Built-in gains tax",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalTax",
            "label": "Total tax",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "estimatedPayments",
            "label": "Estimated tax payments",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "extensionPayment",
            "label": "Payment with extension",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "amountOwed",
            "label": "Amount owed",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "overpayment",
            "label": "Overpayment",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Schedules and Shareholders",
        "fields": [
          {
            "id": "scheduleB",
            "label": "Schedule B — Other information",
            "type": "table",
            "columns": [
              {
                "id": "question",
                "label": "Question / line",
                "type": "text"
              },
              {
                "id": "answer",
                "label": "Answer",
                "type": "select",
                "options": [
                  "Yes",
                  "No",
                  "N/A"
                ]
              },
              {
                "id": "details",
                "label": "Details",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 5
          },
          {
            "id": "scheduleK",
            "label": "Schedule K — Shareholders’ pro rata share items",
            "type": "table",
            "columns": [
              {
                "id": "lineCode",
                "label": "Line / code",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Description",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 5
          },
          {
            "id": "scheduleL",
            "label": "Schedule L — Balance sheets per books",
            "type": "table",
            "columns": [
              {
                "id": "account",
                "label": "Account / line",
                "type": "text"
              },
              {
                "id": "beginningAssets",
                "label": "Beginning assets",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "beginningLiabilitiesEquity",
                "label": "Beginning liabilities/equity",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "endingAssets",
                "label": "Ending assets",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "endingLiabilitiesEquity",
                "label": "Ending liabilities/equity",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 6
          },
          {
            "id": "scheduleM",
            "label": "Schedules M-1, M-2, and M-3",
            "type": "table",
            "columns": [
              {
                "id": "schedule",
                "label": "Schedule",
                "type": "select",
                "options": [
                  "M-1",
                  "M-2",
                  "M-3"
                ]
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Description",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 4
          },
          {
            "id": "shareholderSummary",
            "label": "Shareholder and Schedule K-1 information",
            "type": "table",
            "columns": [
              {
                "id": "name",
                "label": "Shareholder name",
                "type": "text"
              },
              {
                "id": "tin",
                "label": "TIN",
                "type": "password",
                "sensitive": true
              },
              {
                "id": "ownershipPct",
                "label": "Ownership %",
                "type": "number"
              },
              {
                "id": "stockBasisBeginning",
                "label": "Beginning stock basis",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "debtBasisBeginning",
                "label": "Beginning debt basis",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "incomeLoss",
                "label": "Income/loss",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "distributions",
                "label": "Distributions",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "stockBasisEnding",
                "label": "Ending stock basis",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "debtBasisEnding",
                "label": "Ending debt basis",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "f990": {
    "group": "Exempt Organizations",
    "agency": "Internal Revenue Service",
    "formNumber": "Form 990",
    "title": "Return of Organization Exempt From Income Tax",
    "shortTitle": "990 — Exempt Organization Return",
    "revision": "Current tax-year revision — verify before filing",
    "purpose": "Used by many tax-exempt organizations to report activities, governance, revenue, expenses, assets, liabilities, and compensation.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-990",
    "instructionsUrl": "https://www.irs.gov/instructions/i990",
    "sections": [
      {
        "title": "Organization",
        "fields": [
          {
            "id": "taxYear",
            "label": "Tax year",
            "type": "text"
          },
          {
            "id": "organizationName",
            "label": "Organization name",
            "type": "text",
            "required": true
          },
          {
            "id": "address",
            "label": "Address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "ein",
            "label": "EIN",
            "type": "password",
            "sensitive": true,
            "required": true
          },
          {
            "id": "website",
            "label": "Website",
            "type": "url"
          },
          {
            "id": "groupExemptionNumber",
            "label": "Group exemption number",
            "type": "text"
          },
          {
            "id": "formationYear",
            "label": "Year of formation",
            "type": "number"
          },
          {
            "id": "stateDomicile",
            "label": "State of legal domicile",
            "type": "text"
          },
          {
            "id": "returnType",
            "label": "Return status",
            "type": "select",
            "options": [
              "Initial return",
              "Final return / terminated",
              "Amended return",
              "Application pending",
              "Regular return"
            ]
          }
        ]
      },
      {
        "title": "Summary",
        "fields": [
          {
            "id": "mission",
            "label": "Mission or most significant activities",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "votingMembers",
            "label": "Voting members of governing body",
            "type": "number"
          },
          {
            "id": "independentVotingMembers",
            "label": "Independent voting members",
            "type": "number"
          },
          {
            "id": "employees",
            "label": "Number of employees",
            "type": "number"
          },
          {
            "id": "volunteers",
            "label": "Number of volunteers",
            "type": "number"
          },
          {
            "id": "unrelatedBusinessRevenue",
            "label": "Unrelated business revenue",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "contributions",
            "label": "Contributions and grants",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "programServiceRevenue",
            "label": "Program service revenue",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "investmentIncome",
            "label": "Investment income",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherRevenue",
            "label": "Other revenue",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalRevenue",
            "label": "Total revenue",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "grantsBenefits",
            "label": "Grants and similar amounts paid",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "salariesCompensation",
            "label": "Salaries and compensation",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "fundraisingExpenses",
            "label": "Fundraising expenses",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherExpenses",
            "label": "Other expenses",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalExpenses",
            "label": "Total expenses",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "netAssetsBeginning",
            "label": "Net assets beginning of year",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "netAssetsEnd",
            "label": "Net assets end of year",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Governance and Compliance",
        "fields": [
          {
            "id": "officersDirectors",
            "label": "Officers, directors, trustees, key employees, and highest compensated employees",
            "type": "table",
            "columns": [
              {
                "id": "nameTitle",
                "label": "Name and title",
                "type": "text"
              },
              {
                "id": "hoursPerWeek",
                "label": "Hours/week",
                "type": "number"
              },
              {
                "id": "position",
                "label": "Position",
                "type": "text"
              },
              {
                "id": "organizationComp",
                "label": "Compensation from organization",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "relatedComp",
                "label": "Compensation from related organizations",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "otherComp",
                "label": "Other compensation",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "governanceAnswers",
            "label": "Governance, management, disclosure, and compliance questions",
            "type": "table",
            "columns": [
              {
                "id": "partLine",
                "label": "Part / line",
                "type": "text"
              },
              {
                "id": "question",
                "label": "Question",
                "type": "text"
              },
              {
                "id": "answer",
                "label": "Answer",
                "type": "select",
                "options": [
                  "Yes",
                  "No",
                  "N/A"
                ]
              },
              {
                "id": "explanation",
                "label": "Explanation / schedule reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 8
          },
          {
            "id": "programAccomplishments",
            "label": "Program service accomplishments",
            "type": "table",
            "columns": [
              {
                "id": "program",
                "label": "Program / activity",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Accomplishment description",
                "type": "text"
              },
              {
                "id": "expenses",
                "label": "Expenses",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "grants",
                "label": "Grants",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "revenue",
                "label": "Revenue",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 3
          }
        ]
      },
      {
        "title": "Schedules",
        "fields": [
          {
            "id": "requiredSchedules",
            "label": "Required Form 990 schedules and supporting attachments",
            "type": "table",
            "columns": [
              {
                "id": "schedule",
                "label": "Schedule",
                "type": "select",
                "options": [
                  "A",
                  "B",
                  "C",
                  "D",
                  "E",
                  "F",
                  "G",
                  "H",
                  "I",
                  "J",
                  "K",
                  "L",
                  "M",
                  "N",
                  "O",
                  "R",
                  "Other"
                ]
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not started",
                  "In progress",
                  "Complete",
                  "Not applicable"
                ]
              },
              {
                "id": "description",
                "label": "Description / attachment reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 4
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "f1041": {
    "group": "Estates and Trusts",
    "agency": "Internal Revenue Service",
    "formNumber": "Form 1041",
    "title": "U.S. Income Tax Return for Estates and Trusts",
    "shortTitle": "1041 — Estate and Trust Return",
    "revision": "Current tax-year revision — verify before filing",
    "purpose": "Used to report income, deductions, gains, losses, and distributions of estates and trusts.",
    "officialUrl": "https://www.irs.gov/forms-pubs/about-form-1041",
    "instructionsUrl": "https://www.irs.gov/instructions/i1041",
    "sections": [
      {
        "title": "Estate or Trust",
        "fields": [
          {
            "id": "taxYear",
            "label": "Tax year",
            "type": "text"
          },
          {
            "id": "entityName",
            "label": "Name of estate or trust",
            "type": "text",
            "required": true
          },
          {
            "id": "ein",
            "label": "EIN",
            "type": "password",
            "sensitive": true,
            "required": true
          },
          {
            "id": "fiduciaryNameTitle",
            "label": "Name and title of fiduciary",
            "type": "text",
            "required": true
          },
          {
            "id": "address",
            "label": "Address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "entityType",
            "label": "Type of entity",
            "type": "select",
            "options": [
              "Decedent’s estate",
              "Simple trust",
              "Complex trust",
              "Qualified disability trust",
              "ESBT",
              "Grantor type trust",
              "Bankruptcy estate — Chapter 7",
              "Bankruptcy estate — Chapter 11",
              "Pooled income fund"
            ]
          },
          {
            "id": "dateCreated",
            "label": "Date entity created",
            "type": "date"
          },
          {
            "id": "numberK1",
            "label": "Number of Schedules K-1 attached",
            "type": "number"
          }
        ]
      },
      {
        "title": "Income",
        "fields": [
          {
            "id": "interestIncome",
            "label": "1. Interest income",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "ordinaryDividends",
            "label": "2a. Total ordinary dividends",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "qualifiedDividends",
            "label": "2b. Qualified dividends",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "businessIncome",
            "label": "3. Business income or loss",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "capitalGain",
            "label": "4. Capital gain or loss",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "rentsRoyalties",
            "label": "5. Rents, royalties, partnerships, other estates and trusts",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "farmIncome",
            "label": "6. Farm income or loss",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "ordinaryGain",
            "label": "7. Ordinary gain or loss",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherIncome",
            "label": "8. Other income",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalIncome",
            "label": "9. Total income",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Deductions",
        "fields": [
          {
            "id": "interestExpense",
            "label": "10. Interest",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "taxes",
            "label": "11. Taxes",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "fiduciaryFees",
            "label": "12. Fiduciary fees",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "charitableDeduction",
            "label": "13. Charitable deduction",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "attorneyAccountantFees",
            "label": "14. Attorney, accountant, and return preparer fees",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "otherDeductions",
            "label": "15. Other deductions",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "incomeDistributionDeduction",
            "label": "18. Income distribution deduction",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "estateTaxDeduction",
            "label": "19. Estate tax deduction",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "exemption",
            "label": "20. Exemption",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "totalDeductions",
            "label": "21. Total deductions",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "taxableIncome",
            "label": "23. Taxable income",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Tax and Payments",
        "fields": [
          {
            "id": "totalTax",
            "label": "Total tax",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "payments",
            "label": "Payments and refundable credits",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "estimatedTaxPenalty",
            "label": "Estimated tax penalty",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "amountOwed",
            "label": "Amount owed",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "overpayment",
            "label": "Overpayment",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Beneficiaries and Schedules",
        "fields": [
          {
            "id": "beneficiarySummary",
            "label": "Beneficiaries, distributions, and Schedule K-1 information",
            "type": "table",
            "columns": [
              {
                "id": "name",
                "label": "Beneficiary name",
                "type": "text"
              },
              {
                "id": "tin",
                "label": "TIN",
                "type": "password",
                "sensitive": true
              },
              {
                "id": "address",
                "label": "Address",
                "type": "text"
              },
              {
                "id": "type",
                "label": "Type",
                "type": "select",
                "options": [
                  "Individual",
                  "Estate/trust",
                  "Corporation",
                  "Partnership",
                  "Exempt organization",
                  "Foreign beneficiary",
                  "Other"
                ]
              },
              {
                "id": "incomeDistribution",
                "label": "Income distribution",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "principalDistribution",
                "label": "Principal distribution",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "taxWithheld",
                "label": "Tax withheld",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "scheduleG",
            "label": "Schedule G — Tax computation and payments",
            "type": "table",
            "columns": [
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Description",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 4
          },
          {
            "id": "otherSchedules",
            "label": "Other required schedules and attachments",
            "type": "table",
            "columns": [
              {
                "id": "scheduleForm",
                "label": "Schedule / form",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Description",
                "type": "text"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not started",
                  "In progress",
                  "Complete",
                  "Not applicable"
                ]
              },
              {
                "id": "attachmentReference",
                "label": "Attachment reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 2
          }
        ]
      },
      {
        "title": "Additional Official Lines and Attachments",
        "fields": [
          {
            "id": "additionalOfficialLines",
            "label": "Additional official lines or boxes",
            "type": "table",
            "columns": [
              {
                "id": "lineBox",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Official description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry / answer",
                "type": "text"
              },
              {
                "id": "amount",
                "label": "Amount",
                "type": "number",
                "format": "currency"
              },
              {
                "id": "source",
                "label": "Source / calculation",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "calculationWorksheets",
            "label": "Calculation and worksheet entries",
            "type": "table",
            "columns": [
              {
                "id": "worksheet",
                "label": "Worksheet / schedule",
                "type": "text"
              },
              {
                "id": "line",
                "label": "Line",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation",
                "type": "text"
              },
              {
                "id": "result",
                "label": "Result",
                "type": "number",
                "format": "currency"
              }
            ],
            "wide": true,
            "minRows": 1
          },
          {
            "id": "supportingAttachments",
            "label": "Supporting schedules, statements, and attachments",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Attachment / statement",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "File name / reference",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "officialRevisionUsed",
            "label": "Official form revision / tax year used",
            "type": "text",
            "required": true
          },
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  },
  "governmentCustom": {
    "group": "State, Local, and Other Government",
    "agency": "User-selected government agency",
    "formNumber": "Custom Government Form",
    "title": "Custom Government Tax Form Workspace",
    "shortTitle": "Custom — State, Local, or Other Tax Form",
    "revision": "User must verify current official revision",
    "purpose": "Flexible workspace for a state, local, territorial, tribal, or other government tax form not included in the federal library.",
    "officialUrl": "https://www.irs.gov/forms-instructions-and-publications",
    "instructionsUrl": "https://www.irs.gov/forms-instructions-and-publications",
    "sections": [
      {
        "title": "Official Form Identification",
        "fields": [
          {
            "id": "agency",
            "label": "Government agency",
            "type": "text",
            "required": true
          },
          {
            "id": "jurisdiction",
            "label": "Jurisdiction",
            "type": "text",
            "required": true
          },
          {
            "id": "formNumber",
            "label": "Official form number",
            "type": "text",
            "required": true
          },
          {
            "id": "formTitle",
            "label": "Official form title",
            "type": "text",
            "required": true,
            "wide": true
          },
          {
            "id": "revision",
            "label": "Revision / tax year",
            "type": "text"
          },
          {
            "id": "officialSource",
            "label": "Official source URL",
            "type": "url",
            "wide": true
          }
        ]
      },
      {
        "title": "Taxpayer or Entity",
        "fields": [
          {
            "id": "subjectName",
            "label": "Taxpayer / entity name",
            "type": "text",
            "required": true
          },
          {
            "id": "subjectTin",
            "label": "Tax identification number",
            "type": "password",
            "sensitive": true
          },
          {
            "id": "address",
            "label": "Address",
            "type": "textarea",
            "wide": true
          },
          {
            "id": "email",
            "label": "Email",
            "type": "email"
          },
          {
            "id": "phone",
            "label": "Phone",
            "type": "tel"
          }
        ]
      },
      {
        "title": "Tax Period and Filing",
        "fields": [
          {
            "id": "taxPeriod",
            "label": "Tax period",
            "type": "text"
          },
          {
            "id": "filingType",
            "label": "Filing type",
            "type": "select",
            "options": [
              "Original",
              "Amended",
              "Extension",
              "Estimated payment",
              "Information return",
              "Registration / application",
              "Other"
            ]
          },
          {
            "id": "dueDate",
            "label": "Due date",
            "type": "date"
          },
          {
            "id": "taxableAmount",
            "label": "Taxable amount",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "taxDue",
            "label": "Tax due",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "paymentsCredits",
            "label": "Payments / credits",
            "type": "number",
            "format": "currency"
          },
          {
            "id": "balance",
            "label": "Balance or refund",
            "type": "number",
            "format": "currency"
          }
        ]
      },
      {
        "title": "Form Details",
        "fields": [
          {
            "id": "lineItems",
            "label": "Official line items and calculations",
            "type": "table",
            "columns": [
              {
                "id": "line",
                "label": "Line / box",
                "type": "text"
              },
              {
                "id": "description",
                "label": "Description",
                "type": "text"
              },
              {
                "id": "entry",
                "label": "Entry",
                "type": "text"
              },
              {
                "id": "calculation",
                "label": "Calculation / source",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 5
          },
          {
            "id": "attachments",
            "label": "Required attachments and supporting documents",
            "type": "table",
            "columns": [
              {
                "id": "document",
                "label": "Document / schedule",
                "type": "text"
              },
              {
                "id": "required",
                "label": "Required",
                "type": "checkbox"
              },
              {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                  "Not attached",
                  "Attached",
                  "Not applicable"
                ]
              },
              {
                "id": "reference",
                "label": "Reference / notes",
                "type": "text"
              }
            ],
            "wide": true,
            "minRows": 2
          },
          {
            "id": "notes",
            "label": "Preparation notes and review log",
            "type": "table",
            "columns": [
              {
                "id": "date",
                "label": "Date",
                "type": "date"
              },
              {
                "id": "author",
                "label": "Prepared/reviewed by",
                "type": "text"
              },
              {
                "id": "note",
                "label": "Note",
                "type": "text"
              },
              {
                "id": "resolved",
                "label": "Resolved",
                "type": "checkbox"
              }
            ],
            "wide": true,
            "minRows": 1
          }
        ]
      },
      {
        "title": "Filing, Review, and Submission",
        "fields": [
          {
            "id": "filingMethod",
            "label": "Intended filing method",
            "type": "select",
            "options": [
              "Electronic filing",
              "Mail",
              "Provide to requester/employer/payer",
              "Keep for records",
              "Other"
            ]
          },
          {
            "id": "filingJurisdiction",
            "label": "Filing jurisdiction / service center / recipient",
            "type": "text",
            "wide": true
          },
          {
            "id": "filingDueDate",
            "label": "Filing or delivery due date",
            "type": "date"
          },
          {
            "id": "reviewedBy",
            "label": "Reviewed by",
            "type": "text"
          },
          {
            "id": "reviewDate",
            "label": "Review date",
            "type": "date"
          },
          {
            "id": "reviewComplete",
            "label": "All required entries and attachments have been reviewed",
            "type": "checkbox"
          },
          {
            "id": "submissionNotes",
            "label": "Submission notes / confirmation number",
            "type": "textarea",
            "wide": true
          }
        ]
      }
    ],
    "completionMode": "in-generator",
    "completionNote": "All listed lines, schedules, repeatable parties, certifications, and signature data are entered and retained inside this generator."
  }
};
