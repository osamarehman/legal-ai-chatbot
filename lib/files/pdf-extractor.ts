import type { FileProcessingResult } from "./types";

export async function extractTextFromPDF(
  fileBuffer: Buffer
): Promise<FileProcessingResult> {
  try {
    // Dynamic import to avoid Next.js bundling issues with pdf-parse test files
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(fileBuffer);

    return {
      success: true,
      extractedContent: data.text,
      metadata: {
        pageCount: data.numpages,
        size: fileBuffer.length,
      },
    };
  } catch (error) {
    console.error("PDF extraction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to extract text from PDF",
    };
  }
}
