import { MessageType } from "../components/ChatMessage";

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
  createdAt: Date;
}

export interface ConversationSummary {
  id: string;
  title: string;
  lastMessage: string;
  lastUpdated: Date;
  createdAt: Date;
} 