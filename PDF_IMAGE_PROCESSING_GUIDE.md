# PDF and Image Processing Implementation Guide

This document provides a comprehensive guide for the PDF and image processing feature implemented in the Legal AI Chatbot.

## Overview

The application now automatically processes PDF files and images when they are attached to chat messages:
- **PDF files**: Text content is extracted and added to the AI context
- **Images**: Visual content is analyzed using Google's Gemini 2.5 Flash Image model and described in text form

## Architecture

### Components

1. **File Processor** (`lib/files/processor.ts`)
   - Main coordinator for file processing
   - Routes files to appropriate processors
   - Manages caching lookups

2. **PDF Extractor** (`lib/files/pdf-extractor.ts`)
   - Extracts text from PDF files using `pdf-parse`
   - Returns extracted text and metadata (page count, size)

3. **Image Analyzer** (`lib/files/image-analyzer.ts`)
   - Analyzes images using Gemini 2.5 Flash Image model
   - Describes visual content, objects, text, and scenes

4. **Cache Manager** (`lib/files/cache-manager.ts`)
   - Manages database caching of processed files
   - Generates SHA-256 hashes for deduplication
   - Handles cache expiration (7 days)

5. **Database Schema** (`lib/db/schema.ts`)
   - ProcessedFile table for storing cache
   - Tracks file hash, content, metadata, and expiration

## Setup Instructions

### 1. Install Dependencies

The `pdf-parse` package has already been added:

```bash
cd legal-ai-chatbot
pnpm install
```

### 2. Run Database Migration

Execute the migration to create the ProcessedFile table:

```bash
pnpm run db:migrate
```

Or manually run the SQL from `lib/db/migrations/0003_add_processed_file_table.sql`:

```sql
CREATE TABLE IF NOT EXISTS "ProcessedFile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fileHash" varchar(64) NOT NULL,
	"fileName" text NOT NULL,
	"fileType" varchar(50) NOT NULL,
	"contentType" varchar(100) NOT NULL,
	"extractedContent" text,
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp,
	CONSTRAINT "ProcessedFile_fileHash_unique" UNIQUE("fileHash")
);
```

### 3. Configure Environment Variables

Ensure your `.env.local` file has the required AI Gateway configuration:

```env
# AI Gateway (already configured)
OPENROUTER_API_KEY=your_key_here
```

The Gemini 2.5 Flash Image model is configured in `lib/ai/providers.ts` and will use your existing AI Gateway setup.

### 4. Restart Development Server

```bash
pnpm run dev
```

## How It Works

### Flow Diagram

```
User uploads PDF/Image
         ↓
File Upload API validates
         ↓
File stored in Vercel Blob
         ↓
User sends message with attachment
         ↓
Chat API detects file attachment
         ↓
Generate file hash (SHA-256)
         ↓
Check cache in database
         ↓
    Cache hit?
    ↙        ↘
  Yes         No
   ↓          ↓
Return      Process file
cached    (PDF or Image)
result         ↓
   ↓      Store in cache
   ↓          ↓
   └──────────┘
         ↓
Add extracted content to message
         ↓
Send to AI with full context
```

### Processing Details

**PDF Processing:**
1. Fetch PDF file from URL
2. Convert to Buffer
3. Use pdf-parse to extract text
4. Store text + metadata (pages, size)
5. Cache result in database
6. Append extracted text to message

**Image Processing:**
1. Fetch image file from URL
2. Convert to base64 data URL
3. Send to Gemini 2.5 Flash Image model
4. Model analyzes and describes image
5. Store description in database
6. Append description to message

## Testing Guide

### 1. Test PDF Processing

1. **Upload a PDF file:**
   - Go to the chat interface
   - Click the attachment button or drag & drop a PDF
   - Send a message like "What does this document say?"

2. **Expected behavior:**
   - Console log: "Processing [filename].pdf (application/pdf)"
   - Text is extracted from PDF
   - AI responds based on PDF content
   - Second upload of same PDF uses cache (check console)

3. **Test cases:**
   - Simple text PDF
   - Multi-page PDF
   - PDF with complex layout
   - Scanned PDF (will extract minimal text)

### 2. Test Image Processing

1. **Upload an image:**
   - Upload JPEG, PNG, GIF, or WebP
   - Send a message like "What's in this image?"

2. **Expected behavior:**
   - Console log: "Processing image (image/jpeg)"
   - Gemini model analyzes image
   - AI responds with image description
   - Cached for future use

3. **Test cases:**
   - Image with text (signs, documents)
   - Image with objects/scenes
   - Image with people
   - Complex images with multiple elements

### 3. Test Caching

1. **Upload the same file twice:**
   - Upload a PDF or image
   - Send a message
   - In a new chat, upload the exact same file
   - Check console logs

2. **Expected behavior:**
   - First upload: "Processing [filename]..."
   - Second upload: "Using cached result for file: [filename]"
   - Significantly faster on second upload

### 4. Test Error Handling

1. **Corrupted PDF:**
   - Upload a corrupted/invalid PDF
   - Expected: Warning in console, chat continues

2. **Large files:**
   - Upload very large PDF (near 10MB limit)
   - Expected: Processes successfully but may take longer

3. **Network errors:**
   - Disconnect internet during processing
   - Expected: Error logged, graceful fallback

## Monitoring & Debugging

### Console Logs

The system logs important events:

```javascript
// Successful processing
"Processing document.pdf (application/pdf)"
"Using cached result for file: document.pdf"

// Errors
"Failed to process document.pdf: [error message]"
"Error processing attachment: [error details]"
```

### Database Queries

Check processed files in PostgreSQL:

```sql
-- View all cached files
SELECT * FROM "ProcessedFile" ORDER BY "createdAt" DESC;

-- Check cache for specific file
SELECT * FROM "ProcessedFile" WHERE "fileHash" = 'hash_value';

-- Clean up expired cache
DELETE FROM "ProcessedFile" WHERE "expiresAt" < NOW();
```

### Performance Monitoring

Monitor processing times:
- PDF extraction: Usually < 1 second
- Image analysis: 2-5 seconds (API call)
- Cache lookup: < 100ms

## Troubleshooting

### Issue: "Cannot find module 'pdf-parse'"

**Solution:**
```bash
cd legal-ai-chatbot
pnpm install pdf-parse
```

### Issue: Database table doesn't exist

**Solution:**
Run the migration:
```bash
pnpm run db:migrate
```

### Issue: Image analysis fails

**Solution:**
1. Check AI Gateway configuration
2. Verify Gemini model is available
3. Check console for API errors
4. Ensure image size is within limits

### Issue: Processing takes too long

**Solution:**
1. Check file size (large files take longer)
2. Verify network connection
3. Check database connection
4. Consider increasing timeout if needed

## Limitations

1. **PDF Text Extraction:**
   - Works best with text-based PDFs
   - Scanned PDFs may not extract well
   - Complex layouts might lose formatting

2. **Image Analysis:**
   - Depends on Gemini model availability
   - Analysis quality varies by image complexity
   - Rate limits apply (shared with other AI calls)

3. **Caching:**
   - Cache expires after 7 days
   - Storage depends on database size limits
   - Only exact file matches use cache

## Future Improvements

Potential enhancements:
1. OCR for scanned PDFs
2. Document type detection
3. Multi-language support
4. Batch processing for multiple files
5. User-configurable cache duration
6. Processing progress indicators
7. Support for more file types (Excel, PowerPoint)

## API Reference

### Main Functions

```typescript
// Process any supported file
processFile(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<FileProcessingResult>

// Extract PDF text
extractTextFromPDF(
  fileBuffer: Buffer
): Promise<FileProcessingResult>

// Analyze image
analyzeImage(
  imageBuffer: Buffer,
  contentType: string
): Promise<FileProcessingResult>

// Cache management
getCachedFile(fileHash: string): Promise<CachedFileData | null>
cacheProcessedFile(...): Promise<void>
generateFileHash(buffer: Buffer): string
```

## Support

For issues or questions:
1. Check console logs for error messages
2. Verify database schema is up to date
3. Review environment variables
4. Check network connectivity
5. Consult BUG_FIXES_SUMMARY.md for related fixes

---

**Implementation Date:** September 30, 2025
**Version:** 1.0.0
**Status:** Production Ready ✅
