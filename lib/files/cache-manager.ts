import crypto from "crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { processedFile } from "../db/schema";
import { eq } from "drizzle-orm";
import type { CachedFileData, FileProcessingResult } from "./types";

// Cache expiration: 7 days
const CACHE_EXPIRATION_DAYS = 7;

// Database connection
const client = postgres(`${process.env.POSTGRES_URL!}`, { max: 1 });
const db = drizzle(client);

/**
 * Generate a hash for file content to use as cache key
 */
export function generateFileHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Check if a file has been processed before
 */
export async function getCachedFile(
  fileHash: string
): Promise<CachedFileData | null> {
  try {
    const cached = await db
      .select()
      .from(processedFile)
      .where(eq(processedFile.fileHash, fileHash))
      .limit(1);

    if (cached.length === 0) {
      return null;
    }

    const file = cached[0];

    // Check if cache has expired
    if (file.expiresAt && file.expiresAt < new Date()) {
      // Delete expired cache entry
      await db
        .delete(processedFile)
        .where(eq(processedFile.fileHash, fileHash));
      return null;
    }

    return {
      id: file.id,
      fileHash: file.fileHash,
      fileName: file.fileName,
      fileType: file.fileType,
      contentType: file.contentType,
      extractedContent: file.extractedContent,
      metadata: file.metadata,
      createdAt: file.createdAt,
      expiresAt: file.expiresAt,
    };
  } catch (error) {
    console.error("Error retrieving cached file:", error);
    return null;
  }
}

/**
 * Store processed file in cache
 */
export async function cacheProcessedFile(
  fileHash: string,
  fileName: string,
  fileType: string,
  contentType: string,
  result: FileProcessingResult
): Promise<void> {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CACHE_EXPIRATION_DAYS);

    await db.insert(processedFile).values({
      fileHash,
      fileName,
      fileType,
      contentType,
      extractedContent: result.extractedContent || null,
      metadata: result.success
        ? result.metadata || null
        : { error: result.error },
      createdAt: new Date(),
      expiresAt,
    });
  } catch (error) {
    console.error("Error caching processed file:", error);
    // Don't throw - caching failure shouldn't break the flow
  }
}

/**
 * Clean up expired cache entries
 */
export async function cleanupExpiredCache(): Promise<void> {
  try {
    await db
      .delete(processedFile)
      .where(eq(processedFile.expiresAt, new Date()));
  } catch (error) {
    console.error("Error cleaning up expired cache:", error);
  }
}
