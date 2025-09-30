import { gateway } from "@ai-sdk/gateway";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          // XAI Grok Models (Test)
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
          
          // Anthropic Claude Models (Test)
          "anthropic/claude-sonnet-4": chatModel,
          "anthropic/claude-sonnet-4.5": chatModel,
          
          // OpenAI Models (Test)
          "openai/gpt-5": chatModel,
          
        // Google Models (Test)
        "google/gemini-2.5-flash-lite": chatModel,
        "google/gemini-2.5-flash-image-preview": chatModel,
      },
    });
  })()
  : customProvider({
      languageModels: {
        // XAI Grok Models (Production)
        "chat-model": gateway.languageModel("xai/grok-4-fast-non-reasoning"),
        "chat-model-reasoning": wrapLanguageModel({
          model: gateway.languageModel("xai/grok-4-fast-reasoning"),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        "title-model": gateway.languageModel("xai/grok-4"),
        "artifact-model": gateway.languageModel("xai/grok-4"),
        
        // Anthropic Claude Models (Production)
        "anthropic/claude-sonnet-4": gateway.languageModel("anthropic/claude-sonnet-4-20250514"),
        "anthropic/claude-sonnet-4.5": gateway.languageModel("anthropic/claude-sonnet-4-5-20250928"),
        
        // OpenAI Models (Production)
        "openai/gpt-5": gateway.languageModel("openai/gpt-5"),
        
        // Google Models (Production)
        "google/gemini-2.5-flash-lite": gateway.languageModel("google/gemini-2.5-flash"),
        "google/gemini-2.5-flash-image-preview": gateway.languageModel("google/gemini-2.5-flash-image-preview"),
      },
    });
