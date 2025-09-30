export const DEFAULT_CHAT_MODEL: string = "claude-sonnet";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  // Anthropic Claude Models (Active)
  {
    id: "claude-sonnet",
    name: "Claude 3.5 Sonnet",
    description: "Best balance of intelligence, speed, and cost for legal tasks",
  },
  {
    id: "claude-opus",
    name: "Claude 3 Opus",
    description: "Most capable model for complex legal analysis and reasoning",
  },
  {
    id: "claude-haiku",
    name: "Claude 3.5 Haiku",
    description: "Fast and efficient for quick legal queries",
  },
  
  // XAI Grok Models (Optional)
  // {
  //   id: "chat-model",
  //   name: "Grok Vision",
  //   description: "Advanced multimodal model with vision and text capabilities",
  // },
  // {
  //   id: "chat-model-reasoning",
  //   name: "Grok Reasoning",
  //   description: "Uses advanced chain-of-thought reasoning for complex problems",
  // },
  
  // OpenAI Models (Commented - uncomment when enabled in providers.ts)
  // {
  //   id: "gpt-4",
  //   name: "GPT-4 Turbo",
  //   description: "Most capable OpenAI model for complex tasks",
  // },
  // {
  //   id: "gpt-4o",
  //   name: "GPT-4o",
  //   description: "Multimodal model with vision capabilities",
  // },
  // {
  //   id: "gpt-35",
  //   name: "GPT-3.5 Turbo",
  //   description: "Fast and efficient for most tasks",
  // },
  
  // OpenRouter Models (Commented - uncomment when enabled in providers.ts)
  // {
  //   id: "or-gpt4",
  //   name: "GPT-4 (via OpenRouter)",
  //   description: "OpenAI's GPT-4 through OpenRouter",
  // },
  // {
  //   id: "or-claude",
  //   name: "Claude 3.5 Sonnet (via OpenRouter)",
  //   description: "Anthropic's Claude through OpenRouter",
  // },
  // {
  //   id: "or-llama",
  //   name: "Llama 3.1 70B",
  //   description: "Meta's open-source model through OpenRouter",
  // },
];
