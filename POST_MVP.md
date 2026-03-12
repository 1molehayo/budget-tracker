# POST_MVP Roadmap

This file documents features that will be implemented after the MVP is complete.

These features should NOT be implemented during MVP phases.

They are documented early to ensure architectural decisions remain compatible with future functionality.

---

# Priority Order

1. Single Image Upload (highest priority)
2. Batch Image Upload
3. CSV Review & Import Pipeline
4. OCR-assisted historical record digitization

---

# 1. Single Image Upload (Highest Priority)

Purpose:
Allow users to upload a photo of a handwritten monthly record and convert it into structured monthly budget data.

Use Case:
The household has handwritten monthly budget records for more than 5 years. Users should be able to digitize them using the application.

Workflow:

User uploads an image of a single handwritten monthly page.

System performs OCR extraction.

System attempts to identify:

- month
- incomes
- expenses
- savings
- tags

The extracted data is shown inside the **normal monthly budget form**.

The user reviews and edits the extracted data.

After confirmation, the data is saved as a normal Month record.

Requirements:

- Upload UI
- OCR extraction service
- editable preview before saving
- no automatic saving without confirmation

Important:
This feature must integrate directly with the existing monthly form workflow.

---

# 2. Batch Image Upload

Purpose:
Allow users to upload multiple images representing many months of handwritten records.

Workflow:

User uploads multiple images.

System performs OCR on all images.

System extracts structured records.

Instead of saving directly to database:

System generates a CSV file.

CSV contains extracted rows such as:

Month
Type
Label
Amount
Tag

Example:

Mar 2024,income,Husband Salary,2500,HUSBAND_SALARY
Mar 2024,saving,Ajo Contribution,300,AJO_CONTRIBUTION

User downloads the CSV.

User reviews and edits the CSV offline.

User re-uploads the corrected CSV.

System validates the CSV.

If valid:
records are inserted into the database.

---

# 3. CSV Import Pipeline

CSV upload must:

- validate structure
- validate tags
- validate months
- reject invalid rows

User must be shown validation errors before import.

No partial imports should occur.

---

# 4. OCR Tag Detection

OCR system should attempt to infer tags automatically.

Examples:

Salary → HUSBAND_SALARY / WIFE_SALARY
Ajo → AJO_CONTRIBUTION
Ajo payout → AJO_PAYOUT

However, extracted tags must remain editable before final save.

---

# Design Goals

The OCR pipeline must:

- never automatically modify financial records
- always require user confirmation
- produce transparent intermediate data (CSV)

This ensures historical handwritten records remain trustworthy after digitization.

---

# Future Extensions

Possible improvements:

- ML-assisted handwriting recognition
- recurring transaction detection
- smart tag suggestions

---

## Data Safety Rules

OCR-generated records must never be inserted directly into the database.

All extracted records must go through a user review step.

Batch imports must:
- produce a CSV preview
- allow offline editing
- validate tags and months before saving
- reject invalid rows with clear error reporting