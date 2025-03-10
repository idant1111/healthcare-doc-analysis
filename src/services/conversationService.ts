import { Conversation, ConversationSummary, Message } from "../lib/types";

const STORAGE_KEY = "healthcare-doc-analysis-conversations";
const ACTIVE_CONVERSATION_KEY = "healthcare-doc-analysis-active-conversation";

// Helper function to generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Get all conversations from localStorage
export const getConversations = (): Conversation[] => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (!storedData) return [];
  
  try {
    const parsed = JSON.parse(storedData);
    return parsed.map((conv: any) => ({
      ...conv,
      lastUpdated: new Date(conv.lastUpdated),
      createdAt: new Date(conv.createdAt),
      messages: conv.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }));
  } catch (error) {
    console.error("Error parsing conversations from localStorage:", error);
    return [];
  }
};

// Get conversation summaries (for sidebar)
export const getConversationSummaries = (): ConversationSummary[] => {
  const conversations = getConversations();
  
  return conversations.map(conv => {
    const lastMessage = conv.messages.length > 0 
      ? conv.messages[conv.messages.length - 1].content.toString().substring(0, 50) 
      : "No messages";
      
    return {
      id: conv.id,
      title: conv.title,
      lastMessage: typeof lastMessage === 'string' ? lastMessage : 'Complex content',
      lastUpdated: conv.lastUpdated,
      createdAt: conv.createdAt
    };
  }).sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
};

// Get a single conversation by ID
export const getConversation = (id: string): Conversation | null => {
  const conversations = getConversations();
  return conversations.find(conv => conv.id === id) || null;
};

// Create a new conversation
export const createConversation = (initialMessage?: Message): Conversation => {
  const conversations = getConversations();
  
  const newConversation: Conversation = {
    id: generateId(),
    title: `Conversation ${conversations.length + 1}`,
    messages: initialMessage ? [initialMessage] : [],
    lastUpdated: new Date(),
    createdAt: new Date()
  };
  
  saveConversation(newConversation);
  return newConversation;
};

// Update an existing conversation
export const updateConversation = (conversation: Conversation): void => {
  saveConversation({
    ...conversation,
    lastUpdated: new Date()
  });
};

// Rename a conversation
export const renameConversation = (id: string, newTitle: string): void => {
  const conversations = getConversations();
  const index = conversations.findIndex(conv => conv.id === id);
  
  if (index !== -1) {
    conversations[index].title = newTitle;
    conversations[index].lastUpdated = new Date();
    saveConversations(conversations);
  }
};

// Add a message to a conversation
export const addMessageToConversation = (conversationId: string, message: Message): Conversation => {
  const conversations = getConversations();
  const index = conversations.findIndex(conv => conv.id === conversationId);
  
  if (index !== -1) {
    conversations[index].messages.push(message);
    conversations[index].lastUpdated = new Date();
    saveConversations(conversations);
    return conversations[index];
  }
  
  // If conversation doesn't exist, create a new one
  return createConversation(message);
};

// Delete a conversation
export const deleteConversation = (id: string): void => {
  const conversations = getConversations();
  const updatedConversations = conversations.filter(conv => conv.id !== id);
  saveConversations(updatedConversations);
};

// Search conversations
export const searchConversations = (query: string): ConversationSummary[] => {
  if (!query.trim()) return getConversationSummaries();
  
  const conversations = getConversations();
  const searchTerm = query.toLowerCase();
  
  const matchingConversations = conversations.filter(conv => {
    // Search in title
    if (conv.title.toLowerCase().includes(searchTerm)) return true;
    
    // Search in messages
    return conv.messages.some(msg => {
      if (typeof msg.content === 'string') {
        return msg.content.toLowerCase().includes(searchTerm);
      }
      return false;
    });
  });
  
  return matchingConversations.map(conv => {
    const lastMessage = conv.messages.length > 0 
      ? conv.messages[conv.messages.length - 1].content.toString().substring(0, 50) 
      : "No messages";
      
    return {
      id: conv.id,
      title: conv.title,
      lastMessage: typeof lastMessage === 'string' ? lastMessage : 'Complex content',
      lastUpdated: conv.lastUpdated,
      createdAt: conv.createdAt
    };
  }).sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
};

// Private helper functions
const saveConversation = (conversation: Conversation): void => {
  const conversations = getConversations();
  const index = conversations.findIndex(conv => conv.id === conversation.id);
  
  if (index !== -1) {
    conversations[index] = conversation;
  } else {
    conversations.push(conversation);
  }
  
  saveConversations(conversations);
};

const saveConversations = (conversations: Conversation[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error("Error saving conversations to localStorage:", error);
  }
};

// Get the active conversation ID from localStorage
export const getActiveConversationId = (): string | null => {
  try {
    return localStorage.getItem(ACTIVE_CONVERSATION_KEY);
  } catch (error) {
    console.error("Error retrieving active conversation ID:", error);
    return null;
  }
};

// Save the active conversation ID to localStorage
export const saveActiveConversationId = (id: string | null): void => {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_CONVERSATION_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
    }
  } catch (error) {
    console.error("Error saving active conversation ID:", error);
  }
};

// Get the most recent conversation or create a new one if none exists
export const getOrCreateActiveConversation = (): Conversation => {
  const conversations = getConversations();
  
  // First try to get the saved active conversation
  const activeId = getActiveConversationId();
  if (activeId) {
    const activeConversation = conversations.find(conv => conv.id === activeId);
    if (activeConversation) {
      return activeConversation;
    }
  }
  
  // If no active conversation or it doesn't exist anymore, try to get the most recent one
  if (conversations.length > 0) {
    // Sort by last updated and return the most recent
    const mostRecent = [...conversations].sort((a, b) => 
      b.lastUpdated.getTime() - a.lastUpdated.getTime()
    )[0];
    
    saveActiveConversationId(mostRecent.id);
    return mostRecent;
  }
  
  // If no conversations exist, create a new one
  const newConversation = createConversation();
  saveActiveConversationId(newConversation.id);
  return newConversation;
}; 