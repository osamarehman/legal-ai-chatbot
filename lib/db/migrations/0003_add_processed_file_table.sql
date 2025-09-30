-- Add ProcessedFile table for caching file processing results
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
