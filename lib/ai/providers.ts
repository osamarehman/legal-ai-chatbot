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
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : customProvider({
      languageModels: {
        "chat-model": gateway.languageModel("xai/grok-4-fast-non-reasoning"),
        "chat-model-reasoning": wrapLanguageModel({
          model: gateway.languageModel("xai/grok-4-fast-reasoning"),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        "title-model": gateway.languageModel("xai/grok-4"),
        "artifact-model": gateway.languageModel("xai/grok-4"),
      },
    });





      // Anthropic Claude Models via AI Gateway (Testing)
        // "chat-model": gateway.languageModel("anthropic/claude-3-5-sonnet-20241022"),
        // "chat-model-reasoning": gateway.languageModel("anthropic/claude-3-5-sonnet-20241022"),
        // "title-model": gateway.languageModel("anthropic/claude-3-5-haiku-20241022"),
        // "artifact-model": gateway.languageModel("anthropic/claude-3-5-sonnet-20241022"),
        
        // // Direct Anthropic Models (Fallback - for model selector)
        // "claude-sonnet": anthropic("claude-3-5-sonnet-20241022"),
        // "claude-haiku": anthropic("claude-3-5-haiku-20241022"),
        // "claude-opus": anthropic("claude-3-opus-20240229"),