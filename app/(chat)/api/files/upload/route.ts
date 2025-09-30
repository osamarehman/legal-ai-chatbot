import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/app/(auth)/auth";

// Supported file types
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const SUPPORTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];
const ALL_SUPPORTED_TYPES = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_DOCUMENT_TYPES];

// Different size limits for different file types
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

// Use Blob instead of File since File is not available in Node.js environment
const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => {
      const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);
      const isDocument = SUPPORTED_DOCUMENT_TYPES.includes(file.type);
      const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE;
      return file.size <= maxSize;
    }, {
      message: "File size too large. Images: max 5MB, Documents: max 10MB",
    })
    .refine((file) => ALL_SUPPORTED_TYPES.includes(file.type), {
      message: "File type not supported. Supported formats: JPEG, PNG, WebP, PDF, DOC, DOCX",
    }),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in to upload files." },
      { status: 401 }
    );
  }

  if (request.body === null) {
    return NextResponse.json(
      { error: "Request body is empty" },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Please select a file to upload." },
        { status: 400 }
      );
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(", ");

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Get filename from formData since Blob doesn't have name property
    const filename = (formData.get("file") as File).name;
    
    // Sanitize filename to prevent issues
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    const fileBuffer = await file.arrayBuffer();

    try {
      const data = await put(`${Date.now()}-${sanitizedFilename}`, fileBuffer, {
        access: "public",
      });

      return NextResponse.json(data);
    } catch (error: any) {
      console.error("Blob upload error:", error);
      return NextResponse.json(
        { error: "Upload failed. Please check your internet connection and try again." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("File upload processing error:", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
