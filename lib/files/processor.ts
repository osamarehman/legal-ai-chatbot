import { extractTextFromPDF } from "./pdf-extractor";
import { analyzeImage } from "./image-analyzer";
import {
  generateFileHash,
  getCachedFile,
  cacheProcessedFile,
} from "./cache-manager";
import type { FileProcessingResult } from "./types";

/**
 * Process a file (PDF or image) and extract/analyze its content
 * Uses caching to avoid reprocessing the same file
 */
export async function processFile(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<FileProcessingResult> {
  try {
    // Generate hash for caching
    const fileHash = generateFileHash(fileBuffer);

    // Check cache first
    const cached = await getCachedFile(fileHash);
    if (cached) {
      console.log(`Using cached result for file: ${fileName}`);
      return {
        success: true,
        extractedContent: cached.extractedContent || undefined,
        metadata: cached.metadata || undefined,
      };
    }

    let result: FileProcessingResult;
    const fileType = getFileType(contentType);

    // Process based on file type
    if (fileType === "pdf") {
      result = await extractTextFromPDF(fileBuffer);
    } else if (fileType === "image") {
      result = await analyzeImage(fileBuffer, contentType);
    } else {
      result = {
        success: false,
        error: `Unsupported file type: ${contentType}`,
      };
    }

    // Cache the result
    if (result.success) {
      await cacheProcessedFile(
        fileHash,
        fileName,
        fileType,
        contentType,
        result
      );
    }

    return result;
  } catch (error) {
    console.error("File processing error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to process file",
    };
  }
}

/**
 * Determine file type from content type
 */
function getFileType(contentType: string): string {
  if (contentType === "application/pdf") {
    return "pdf";
  }
  if (contentType.startsWith("image/")) {
    return "image";
  }
  return "unknown";
}

/**
 * Check if a file type is supported for processing
 */
export function isSupportedFileType(contentType: string): boolean {
  return (
    contentType === "application/pdf" ||
    contentType === "image/jpeg" ||
    contentType === "image/png" ||
    contentType === "image/gif" ||
    contentType === "image/webp"
  );
}
