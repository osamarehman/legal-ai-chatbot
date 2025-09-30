# PDF & Image Processing Test Guide

## Overview
This guide provides step-by-step instructions for manually testing the PDF and image processing functionality in the Legal AI Chatbot.

## Prerequisites
- Application running locally (`pnpm run dev`)
- User account created and logged in
- Sample test files (see Test Files section)

## Test Files
Prepare the following test files:

### PDF Files
1. **Simple Legal Document** (5-10 pages)
   - Contract, agreement, or legal memo
   - Should contain clear, readable text

2. **Complex Legal Document** (20+ pages)
   - Court filing, detailed contract, or regulations
   - Tests performance with larger files

3. **Scanned PDF**
   - Image-based PDF without text layer
   - Tests OCR/image handling (should gracefully fail)

### Image Files
1. **Legal Diagram** (PNG/JPG)
   - Flowchart, organizational structure, or timeline

2. **Contract Screenshot** (PNG/WebP)
   - Screenshot of a contract or legal document

3. **Legal Form** (PNG/JPG)
   - Filled or blank legal form with text

## Test Scenarios

### 1. PDF Text Extraction

**Steps:**
1. Navigate to the chat interface
2. Click the paperclip icon or drag-and-drop a PDF file
3. Wait for upload completion (check for preview)
4. Type: "What is this document about?"
5. Send the message

**Expected Results:**
- ✅ File uploads successfully
- ✅ PDF icon appears in preview
- ✅ AI response references content from the PDF
- ✅ Response is contextually accurate

**Test Cases:**
- [ ] Simple PDF (5-10 pages)
- [ ] Complex PDF (20+ pages)
- [ ] PDF with special characters
- [ ] PDF with tables/formatting

---

### 2. Image Analysis

**Steps:**
1. Navigate to the chat interface
2. Upload an image file (PNG, JPG, or WebP)
3. Type: "Describe what you see in this image"
4. Send the message

**Expected Results:**
- ✅ Image uploads successfully
- ✅ Image preview appears
- ✅ AI describes image content accurately
- ✅ Text in image is recognized (if present)

**Test Cases:**
- [ ] Legal diagram/flowchart
- [ ] Contract screenshot
- [ ] Legal form with text
- [ ] Image with mixed text and graphics

---

### 3. Cache Functionality

**Purpose:** Verify that the same file isn't processed twice

**Steps:**
1. Upload a PDF and ask a question about it
2. Note the response time
3. Delete the message
4. Upload the **same exact PDF** again
5. Ask the same or similar question

**Expected Results:**
- ✅ Second upload is faster
- ✅ Response time is quicker
- ✅ Console shows "Using cached result for file: [filename]"
- ✅ Content is identical to first extraction

**Cache Verification:**
Check the database:
```sql
SELECT * FROM "ProcessedFile" ORDER BY "createdAt" DESC LIMIT 5;
```

---

### 4. Multiple File Upload

**Steps:**
1. Upload 2-3 different files (mix of PDFs and images)
2. Type: "Summarize all the documents"
3. Send the message

**Expected Results:**
- ✅ All files upload successfully
- ✅ All files show in preview
- ✅ AI references content from multiple files
- ✅ Response synthesizes information across files

---

### 5. Error Handling

**Test 5.1: Unsupported File Type**
1. Try to upload a .DOCX or .TXT file
2. Observe the error message

**Expected:**
- ✅ Clear error: "File type not supported. Supported formats: JPEG, PNG, WebP, PDF, DOC, DOCX"

**Test 5.2: Corrupted PDF**
1. Upload a corrupted/invalid PDF file
2. Send a question about it

**Expected:**
- ✅ File uploads but processing fails gracefully
- ✅ AI responds without extracted content
- ✅ Error logged in console

**Test 5.3: File Size Limits**
1. Try uploading a 15MB PDF (over 10MB limit)
2. Observe the error

**Expected:**
- ✅ Error: "File size too large. Images: max 5MB, Documents: max 10MB"

---

### 6. End-to-End Workflow

**Scenario:** User uploads legal contract and asks questions

**Steps:**
1. Upload a sample contract (PDF)
2. Ask: "What are the key terms in this contract?"
3. Follow up: "What is the termination clause?"
4. Follow up: "Are there any unusual provisions?"

**Expected Results:**
- ✅ Initial response summarizes key terms
- ✅ Follow-up questions reference the same document
- ✅ Specific clauses are accurately quoted
- ✅ Context is maintained across conversation

---

## Performance Benchmarks

Record timing for comparison:

| File Type | File Size | Upload Time | Processing Time | Cache Hit Time |
|-----------|-----------|-------------|-----------------|----------------|
| PDF (5 pages) | ~500KB | | | |
| PDF (20 pages) | ~2MB | | | |
| Image (PNG) | ~1MB | | | |
| Image (WebP) | ~500KB | | | |

---

## Database Verification

### Check ProcessedFile Table

```sql
-- View all processed files
SELECT
  "fileName",
  "fileType",
  "contentType",
  LENGTH("extractedContent") as content_length,
  "createdAt",
  "expiresAt"
FROM "ProcessedFile"
ORDER BY "createdAt" DESC;
```

### Verify Cache Expiration (7 days)

```sql
SELECT
  "fileName",
  "createdAt",
  "expiresAt",
  EXTRACT(DAY FROM ("expiresAt" - "createdAt")) as days_until_expiry
FROM "ProcessedFile"
WHERE "expiresAt" IS NOT NULL;
```

### Check for Duplicates (Should Not Exist)

```sql
SELECT "fileHash", COUNT(*) as count
FROM "ProcessedFile"
GROUP BY "fileHash"
HAVING COUNT(*) > 1;
```

---

## Troubleshooting

### Issue: PDF text not extracted
**Check:**
- Is it a scanned PDF? (image-based)
- Console errors?
- `pdf-parse` package installed?

### Issue: Image not analyzed
**Check:**
- Is Gemini API key configured?
- Image file size < 5MB?
- Network connectivity?

### Issue: Cache not working
**Check:**
- Same exact file (hash should match)?
- ProcessedFile table has entry?
- Cache hasn't expired (< 7 days)?

---

## Success Criteria

✅ **Pass:** All test scenarios complete successfully
⚠️ **Partial:** Some scenarios fail but core functionality works
❌ **Fail:** Critical functionality broken (text extraction or image analysis)

## Report Template

```markdown
## Test Report - [Date]

**Tester:** [Name]
**Environment:** Local / Staging / Production

### Results Summary
- PDF Text Extraction: ✅ / ❌
- Image Analysis: ✅ / ❌
- Cache Functionality: ✅ / ❌
- Error Handling: ✅ / ❌
- Performance: ✅ / ⚠️ / ❌

### Issues Found
1. [Description]
   - Steps to reproduce
   - Expected vs Actual
   - Screenshots (if applicable)

### Performance Notes
- [Any slowness or timeouts observed]

### Recommendations
- [Suggestions for improvements]
```
