"use client";

import { CedarCopilot } from 'cedar-os';

export default function CedarProvider({ children }) {
  return (
    <CedarCopilot
      llmProvider={{
        provider: 'mastra',
        baseURL: 'http://localhost:3000/api', // Your Mastra backend URL
        apiKey: process.env.MASTRA_API_KEY, // Optional: only if your backend requires auth
        chatPath: '/chat', // Base path - Cedar will append /stream automatically
        voiceRoute: '/chat/voice-execute', // Optional: voice endpoint route
      }}
    >
      {children}
    </CedarCopilot>
  );
}
