import { createAnthropic } from "@ai-sdk/anthropic";
import { gateway } from "@ai-sdk/gateway";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

// Configure Anthropic with API key
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Alternative provider imports (uncomment to enable):
// import { createOpenAI } from "@ai-sdk/openai";
// import { createOpenRouter } from "@ai-sdk/openrouter";

// For OpenAI (uncomment to enable):
// const openai = createOpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

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
        // Anthropic Claude Models via AI Gateway (Testing)
        "chat-model": gateway.languageModel("anthropic/claude-3-5-sonnet-20241022"),
        "chat-model-reasoning": gateway.languageModel("anthropic/claude-3-5-sonnet-20241022"),
        "title-model": gateway.languageModel("anthropic/claude-3-5-haiku-20241022"),
        "artifact-model": gateway.languageModel("anthropic/claude-3-5-sonnet-20241022"),
        
        // Direct Anthropic Models (Fallback - for model selector)
        "claude-sonnet": anthropic("claude-3-5-sonnet-20241022"),
        "claude-haiku": anthropic("claude-3-5-haiku-20241022"),
        "claude-opus": anthropic("claude-3-opus-20240229"),
        
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
