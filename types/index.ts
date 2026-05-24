// ─── Message Types ────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system';

export interface SearchSource {
  title: string;
  url: string;
  description: string;
  favicon?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  sources?: SearchSource[];
  usedSearch?: boolean;
}

// ─── Voice Types ──────────────────────────────────────────────────────────────

export interface VoiceSettings {
  speed: number;       // 0.5 – 2.0
  volume: number;      // 0.0 – 1.0
  pitch: number;       // 0.0 – 2.0
  voiceIndex: number;  // index into speechSynthesis.getVoices()
}

// ─── Search Types ─────────────────────────────────────────────────────────────

export interface SearchResult {
  title: string;
  url: string;
  description: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  error?: string;
}

// ─── API Types ────────────────────────────────────────────────────────────────

export interface ChatRequest {
  messages: Array<{ role: MessageRole; content: string }>;
  useSearch?: boolean;
  searchQuery?: string;
}

export interface ChatApiMessage {
  role: MessageRole;
  content: string;
}

// ─── Store Types ──────────────────────────────────────────────────────────────

export interface JarvisState {
  // Chat
  messages: Message[];
  isLoading: boolean;
  currentStreamContent: string;

  // Voice
  isListening: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  voiceSettings: VoiceSettings;

  // UI
  sidebarOpen: boolean;
  currentStatus: JarvisStatus;

  // Actions
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string, done?: boolean) => void;
  appendToLastMessage: (chunk: string) => void;
  clearMessages: () => void;
  setLoading: (v: boolean) => void;
  setListening: (v: boolean) => void;
  setSpeaking: (v: boolean) => void;
  setMuted: (v: boolean) => void;
  setVoiceSettings: (s: Partial<VoiceSettings>) => void;
  setSidebarOpen: (v: boolean) => void;
  setStatus: (s: JarvisStatus) => void;
}

export type JarvisStatus =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'searching'
  | 'error';

// ─── Component Props ──────────────────────────────────────────────────────────

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  neonBorder?: boolean;
}

export interface MessageBubbleProps {
  message: Message;
}

export interface VoiceButtonProps {
  onTranscript: (text: string) => void;
}

export interface SourceCardsProps {
  sources: SearchSource[];
}
