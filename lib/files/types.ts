export interface FileProcessingResult {
  success: boolean;
  extractedContent?: string;
  error?: string;
  metadata?: {
    pageCount?: number;
    size?: number;
    dimensions?: { width: number; height: number };
  };
}

export interface CachedFileData {
  id: string;
  fileHash: string;
  fileName: string;
  fileType: string;
  contentType: string;
  extractedContent: string | null;
  metadata: {
    size?: number;
    pageCount?: number;
    error?: string;
  } | null;
  createdAt: Date;
  expiresAt: Date | null;
}
