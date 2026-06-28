import { Type } from '@google/genai'

/** Canonical Gemini Live tool declarations (v3 configuration). */
export const LIVE_AGENT_TOOL_DECLARATIONS = [
  {
    name: 'callUser',
    description: 'Execute this to call the business owner or user by phone.',
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: 'emailUser',
    description: 'Execute this to send an email to the business owner or user.',
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: 'openVideos',
    description: 'Execute this to open YouTube intro videos based on a query.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Search query for videos' },
      },
    },
  },
  {
    name: 'saveContact',
    description: "Execute this to save the business owner's contact info (vCard) to the user's device.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: 'openNotepad',
    description: 'Execute this to open the notepad/guestbook section for leaving notes.',
    parameters: { type: Type.OBJECT, properties: {} },
  },
] as const

export function buildLiveAgentToolConfig() {
  return [{ functionDeclarations: [...LIVE_AGENT_TOOL_DECLARATIONS] }]
}
