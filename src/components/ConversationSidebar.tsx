import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ConversationSummary } from "../lib/types";
import { 
  getConversationSummaries, 
  searchConversations, 
  renameConversation, 
  deleteConversation
} from "../services/conversationService";

interface ConversationSidebarProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  activeConversationId,
  onSelectConversation,
  onNewConversation
}) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Load conversations on mount and when they change
  useEffect(() => {
    const loadConversations = () => {
      if (searchQuery.trim()) {
        setConversations(searchConversations(searchQuery));
      } else {
        setConversations(getConversationSummaries());
      }
    };

    loadConversations();

    // Set up a listener for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "healthcare-doc-analysis-conversations") {
        loadConversations();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStartRename = (conversation: ConversationSummary, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleRename = (id: string) => {
    if (editTitle.trim()) {
      renameConversation(id, editTitle);
      setConversations(getConversationSummaries());
    }
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      deleteConversation(id);
      setConversations(getConversationSummaries());
      
      // If the active conversation was deleted, create a new one
      if (id === activeConversationId) {
        onNewConversation();
      }
    }
  };

  const handleCreateNew = () => {
    onNewConversation();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="w-64 h-full flex flex-col border-r bg-background">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-2">Conversations</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-8"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No conversations found
          </div>
        ) : (
          <ul className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <li 
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`
                  rounded-md p-2 cursor-pointer flex items-start group
                  ${activeConversationId === conversation.id ? 'bg-primary/10' : 'hover:bg-secondary/20'}
                `}
              >
                <MessageSquare className="h-5 w-5 mr-2 mt-0.5 shrink-0 text-primary/70" />
                <div className="flex-1 min-w-0">
                  {editingId === conversation.id ? (
                    <div className="flex items-center">
                      <Input
                        value={editTitle}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTitle(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === 'Enter') handleRename(conversation.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        onBlur={() => handleRename(conversation.id)}
                        autoFocus
                        className="h-7 py-1"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="font-medium truncate flex items-center">
                        <span className="flex-1 truncate">{conversation.title}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-1 opacity-0 group-hover:opacity-100"
                          onClick={(e) => handleStartRename(conversation, e)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                        <span>{formatDate(conversation.lastUpdated)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100"
                          onClick={(e) => handleDelete(conversation.id, e)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="p-4 border-t">
        <Button 
          onClick={handleCreateNew} 
          className="w-full flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </div>
    </div>
  );
};

export default ConversationSidebar; 