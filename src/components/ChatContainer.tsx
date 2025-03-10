import React, { useState, useRef, useEffect } from "react";
import ChatMessage, { MessageType } from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Eye, EyeOff, Download, Edit2 } from "lucide-react";
import { analyzeDocument, AnalysisResponse } from "../services/api";
import { useToast } from "./ui/toast-context";
import { downloadJson } from "../lib/utils";
import ReactConfetti from "react-confetti";
import { 
  getConversation, 
  createConversation, 
  updateConversation,
  renameConversation,
  saveActiveConversationId,
  getOrCreateActiveConversation
} from "../services/conversationService";
import ConversationSidebar from "./ConversationSidebar";
import { Input } from "./ui/input";

interface Message {
  id: string;
  type: MessageType;
  content: string | React.ReactNode;
  timestamp: Date;
}

const WELCOME_MESSAGE = `
  Welcome to the Healthcare Document Analysis System. 
  You can upload a PDF document for analysis or ask a question about a previously uploaded document.
`;

const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRawResponses, setShowRawResponses] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [conversationTitle, setConversationTitle] = useState<string>("");
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize by loading the active conversation
  useEffect(() => {
    // Only initialize once on component mount
    if (activeConversationId === null) {
      const activeConversation = getOrCreateActiveConversation();
      
      // Set the active conversation ID
      setActiveConversationId(activeConversation.id);
      
      // Set the conversation title
      setConversationTitle(activeConversation.title);
      
      // Convert stored messages to the format used by the component
      const convertedMessages = activeConversation.messages.map(msg => {
        // Check if content is a stringified JSON object that represents a React node
        let content: string | React.ReactNode = msg.content;
        if (typeof content === 'string' && content.startsWith('{"type":')) {
          try {
            // For system messages that might contain analysis data, parse and format properly
            if (msg.type === 'system') {
              const parsedContent = JSON.parse(content);
              if (parsedContent && typeof parsedContent === 'object') {
                content = formatResponse(parsedContent);
              }
            }
          } catch (e) {
            // If parsing fails, keep the original content
            console.error('Error parsing message content:', e);
          }
        }
        
        return {
          id: msg.id,
          type: msg.type as MessageType,
          content: content,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
        };
      });
      
      setMessages(convertedMessages);
    }
  }, []);

  // Load conversation when activeConversationId changes
  useEffect(() => {
    if (activeConversationId) {
      // Save the active conversation ID to localStorage
      saveActiveConversationId(activeConversationId);
      
      // Load the conversation
      const conversation = getConversation(activeConversationId);
      if (conversation) {
        // Set the conversation title
        setConversationTitle(conversation.title);
        
        // Convert stored messages to the format used by the component
        const convertedMessages = conversation.messages.map(msg => {
          // Check if content is a stringified JSON object that represents a React node
          let content: string | React.ReactNode = msg.content;
          if (typeof content === 'string' && content.startsWith('{"type":')) {
            try {
              // For system messages that might contain analysis data, parse and format properly
              if (msg.type === 'system') {
                const parsedContent = JSON.parse(content);
                if (parsedContent && typeof parsedContent === 'object') {
                  content = formatResponse(parsedContent);
                }
              }
            } catch (e) {
              // If parsing fails, keep the original content
              console.error('Error parsing message content:', e);
            }
          }
          
          return {
            id: msg.id,
            type: msg.type as MessageType,
            content: content,
            timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
          };
        });
        
        setMessages(convertedMessages);
      }
    }
  }, [activeConversationId]);

  // Focus the title input when editing
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  const handleNewConversation = () => {
    // Create a welcome message
    const welcomeMessageId = generateId();
    const welcomeMessage: Message = {
      id: welcomeMessageId,
      type: "system",
      content: WELCOME_MESSAGE,
      timestamp: new Date(),
    };

    // Create a new conversation in storage
    const newConversation = createConversation({
      id: welcomeMessageId,
      type: "system",
      content: WELCOME_MESSAGE,
      timestamp: new Date(),
    });

    // Update UI
    setMessages([welcomeMessage]);
    setActiveConversationId(newConversation.id);
    setConversationTitle(newConversation.title);
    
    // Show toast notification
    toast({
      title: "New Conversation Created",
      description: `Started ${newConversation.title}`,
      variant: "blue",
    });
    
    // Show confetti
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleStartEditTitle = () => {
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    if (activeConversationId && conversationTitle.trim()) {
      renameConversation(activeConversationId, conversationTitle);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      // Reset to the original title
      const conversation = getConversation(activeConversationId!);
      if (conversation) {
        setConversationTitle(conversation.title);
      }
      setIsEditingTitle(false);
    }
  };

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const saveMessagesToConversation = (messageList: Message[]) => {
    if (!activeConversationId) return;
    
    // Convert messages to the format used by the storage
    const convertedMessages = messageList.map(msg => ({
      id: msg.id,
      type: msg.type,
      content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
      timestamp: msg.timestamp
    }));
    
    // Get the current conversation
    const conversation = getConversation(activeConversationId);
    if (conversation) {
      // Update the conversation with new messages
      updateConversation({
        ...conversation,
        messages: convertedMessages,
        lastUpdated: new Date()
      });
    }
  };

  const handleSendMessage = async (message: string) => {
    // Add user message to chat
    const userMessageId = generateId();
    const updatedMessages: Message[] = [
      ...messages,
      {
        id: userMessageId,
        type: "user",
        content: message,
        timestamp: new Date(),
      },
    ];
    
    setMessages(updatedMessages);
    saveMessagesToConversation(updatedMessages);

    // If there's a file, add a message about it
    if (selectedFile) {
      const fileMessage: Message = {
        id: generateId(),
        type: "user",
        content: `Uploaded file: ${selectedFile.name}`,
        timestamp: new Date(),
      };
      
      updatedMessages.push(fileMessage);
      setMessages(updatedMessages);
      saveMessagesToConversation(updatedMessages);
    }

    // Add loading message
    const loadingMessageId = generateId();
    const withLoadingMessage: Message[] = [
      ...updatedMessages,
      {
        id: loadingMessageId,
        type: "loading",
        content: "",
        timestamp: new Date(),
      },
    ];
    
    setMessages(withLoadingMessage);

    setIsLoading(true);

    try {
      // Send both the message and file (if any) to the Lambda function
      const response = await analyzeDocument({ 
        message, 
        file: selectedFile || undefined 
      });
      
      // Log the raw response to console for debugging
      console.log("Lambda Response:", response);
      
      // Remove loading message and add response
      const responseMessages: Message[] = [
        {
          id: generateId(),
          type: "system",
          content: formatResponse(response),
          timestamp: new Date(),
        },
        {
          id: generateId(),
          type: "system",
          content: (
            <div className={`mt-4 p-3 bg-muted/30 rounded-md overflow-auto ${!showRawResponses ? 'hidden' : ''}`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold">Raw Lambda Response:</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => downloadJson(response, `lambda-response-${Date.now()}.json`)}
                  title="Download response as JSON"
                >
                  <Download size={14} />
                </Button>
              </div>
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          ),
          timestamp: new Date(),
        }
      ];
      
      const finalMessages: Message[] = updatedMessages
        .filter(msg => msg.id !== loadingMessageId)
        .concat(responseMessages);
      
      setMessages(finalMessages);
      saveMessagesToConversation(finalMessages);
      
      // Clear the selected file after sending
      setSelectedFile(null);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Remove loading message and add error message
      const errorMessage: Message = {
        id: generateId(),
        type: "system",
        content: "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      
      const finalMessages: Message[] = updatedMessages
        .filter(msg => msg.id !== loadingMessageId)
        .concat([errorMessage]);
      
      setMessages(finalMessages);
      saveMessagesToConversation(finalMessages);
      
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Store the file for later use when sending a message
    setSelectedFile(file);
    
    // Notify the user that a file has been selected
    toast({
      title: "File selected",
      description: `${file.name} is ready to send with your next message.`,
    });
  };

  // Add a function to handle file removal
  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const formatResponse = (response: AnalysisResponse): React.ReactNode => {
    if (response.error) {
      return (
        <div className="text-destructive">
          <p className="font-semibold">Error:</p>
          <p>{response.error}</p>
        </div>
      );
    }

    if (!response.analysis) {
      return <p>{response.message}</p>;
    }

    return (
      <div className="space-y-4">
        <p>{response.message}</p>
        
        {response.analysis.summary && (
          <div>
            <h3 className="text-md font-semibold mb-1">Summary</h3>
            <p>{response.analysis.summary}</p>
          </div>
        )}
        
        {response.analysis.keyFindings && response.analysis.keyFindings.length > 0 && (
          <div>
            <h3 className="text-md font-semibold mb-1">Key Findings</h3>
            <ul className="list-disc pl-5 space-y-1">
              {response.analysis.keyFindings.map((finding, index) => (
                <li key={index}>{finding}</li>
              ))}
            </ul>
          </div>
        )}
        
        {response.analysis.recommendations && response.analysis.recommendations.length > 0 && (
          <div>
            <h3 className="text-md font-semibold mb-1">Recommendations</h3>
            <ul className="list-disc pl-5 space-y-1">
              {response.analysis.recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>
        )}
        
        {response.analysis.followUp && (
          <div>
            <h3 className="text-md font-semibold mb-1">Follow-up</h3>
            <p>{response.analysis.followUp}</p>
          </div>
        )}
      </div>
    );
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}
      
      {isSidebarOpen && (
        <ConversationSidebar 
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />
      )}
      
      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="mr-2"
            >
              {isSidebarOpen ? "≪" : "≫"}
            </Button>
            
            {isEditingTitle ? (
              <div className="flex items-center">
                <Input
                  ref={titleInputRef}
                  value={conversationTitle}
                  onChange={(e) => setConversationTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={handleTitleKeyDown}
                  className="h-8 text-sm font-medium"
                  placeholder="Conversation title"
                />
              </div>
            ) : (
              <div className="flex items-center">
                <h2 className="text-sm font-medium">{conversationTitle}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartEditTitle}
                  className="ml-2 h-6 w-6 p-0"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRawResponses(!showRawResponses)}
            title={showRawResponses ? "Hide raw responses" : "Show raw responses"}
          >
            {showRawResponses ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className="ml-2 text-xs">{showRawResponses ? "Hide Raw" : "Show Raw"}</span>
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              type={message.type}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <ChatInput
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          onFileRemove={handleFileRemove}
          selectedFile={selectedFile}
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
};

export default ChatContainer; 