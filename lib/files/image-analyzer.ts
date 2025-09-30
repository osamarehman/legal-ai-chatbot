import { generateText } from "ai";
import { myProvider } from "../ai/providers";
import type { FileProcessingResult } from "./types";

const VISION_MODEL_ID = "google/gemini-2.5-flash-image-preview";

export async function analyzeImage(
  imageBuffer: Buffer,
  contentType: string
): Promise<FileProcessingResult> {
  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString("base64");
    const dataUrl = `data:${contentType};base64,${base64Image}`;

    // Get the vision model from provider
    const model = myProvider.languageModel(VISION_MODEL_ID);

    // Analyze the image using the vision model
    const { text } = await generateText({
      model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: dataUrl,
            },
            {
              type: "text",
              text: "Please analyze this image in detail. Describe what you see, including any text, objects, people, scenes, or important elements. Be thorough and specific in your description.",
            },
          ],
        },
      ],
    });

    return {
      success: true,
      extractedContent: text,
      metadata: {
        size: imageBuffer.length,
      },
    };
  } catch (error) {
    console.error("Image analysis error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to analyze image",
    };
  }
}
