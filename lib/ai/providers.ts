import { anthropic } from "@ai-sdk/anthropic";
import { gateway } from "@ai-sdk/gateway";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

// Alternative provider imports (uncomment to enable):
// import { openai } from "@ai-sdk/openai";
// import { createOpenRouter } from "@ai-sdk/openrouter";

// For OpenRouter (uncomment to enable):
// const openrouter = createOpenRouter({
//   apiKey: process.env.OPENROUTER_API_KEY,
// });

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
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : customProvider({
      languageModels: {
        // Anthropic Claude Models (Active)
        "claude-sonnet": anthropic("claude-4-5-sonnet-20250929"),
        "claude-haiku": anthropic("claude-3-5-haiku-20241022"),
        "claude-opus": anthropic("claude-3-opus-20240229"),
        
        // XAI Grok Models (Kept for compatibility)
        "chat-model": gateway.languageModel("xai/grok-2-vision-1212"),
        "chat-model-reasoning": wrapLanguageModel({
          model: gateway.languageModel("xai/grok-3-mini"),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        
        // Title and Artifact Generation
        "title-model": anthropic("claude-3-5-haiku-20241022"),
        "artifact-model": anthropic("claude-3-5-sonnet-20241022"),
        
        // OpenAI Models (Commented - uncomment to enable)
        // "gpt-4": openai("gpt-4-turbo"),
        // "gpt-4o": openai("gpt-4o"),
        // "gpt-35": openai("gpt-3.5-turbo"),
        
        // OpenRouter Models (Commented - uncomment to enable)
        // Requires: pnpm add @ai-sdk/openrouter
        // "or-gpt4": openrouter("openai/gpt-4-turbo"),
        // "or-claude": openrouter("anthropic/claude-3.5-sonnet"),
        // "or-llama": openrouter("meta-llama/llama-3.1-70b-instruct"),
      },
    });
