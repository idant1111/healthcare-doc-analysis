import React, { useState, useRef, useEffect } from "react";
import ChatMessage, { MessageType } from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Card } from "./ui/card";
import { analyzeDocument, AnalysisResponse } from "../services/api";
import { useToast } from "./ui/toast-context";

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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "system",
      content: WELCOME_MESSAGE,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const handleSendMessage = async (message: string) => {
    // Add user message to chat
    const userMessageId = generateId();
    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        type: "user",
        content: message,
        timestamp: new Date(),
      },
    ]);

    // Add loading message
    const loadingMessageId = generateId();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingMessageId,
        type: "loading",
        content: "",
        timestamp: new Date(),
      },
    ]);

    setIsLoading(true);

    try {
      const response = await analyzeDocument({ message });
      
      // Remove loading message and add response
      setMessages((prev) => 
        prev.filter((msg) => msg.id !== loadingMessageId).concat({
          id: generateId(),
          type: "system",
          content: formatResponse(response),
          timestamp: new Date(),
        })
      );
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Remove loading message and add error message
      setMessages((prev) => 
        prev.filter((msg) => msg.id !== loadingMessageId).concat({
          id: generateId(),
          type: "system",
          content: "Sorry, there was an error processing your request. Please try again.",
          timestamp: new Date(),
        })
      );
      
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
    // Add user message about file upload
    const userMessageId = generateId();
    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        type: "user",
        content: `Uploaded file: ${file.name}`,
        timestamp: new Date(),
      },
    ]);

    // Add loading message
    const loadingMessageId = generateId();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingMessageId,
        type: "loading",
        content: "",
        timestamp: new Date(),
      },
    ]);

    setIsLoading(true);

    try {
      const response = await analyzeDocument({ file });
      
      // Remove loading message and add response
      setMessages((prev) => 
        prev.filter((msg) => msg.id !== loadingMessageId).concat({
          id: generateId(),
          type: "system",
          content: formatResponse(response),
          timestamp: new Date(),
        })
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      
      // Remove loading message and add error message
      setMessages((prev) => 
        prev.filter((msg) => msg.id !== loadingMessageId).concat({
          id: generateId(),
          type: "system",
          content: "Sorry, there was an error processing your file. Please try again.",
          timestamp: new Date(),
        })
      );
      
      toast({
        title: "Error",
        description: "Failed to process your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatResponse = (response: AnalysisResponse): React.ReactNode => {
    if (response.error) {
      return <p className="text-destructive">{response.error}</p>;
    }

    if (response.analysis) {
      return (
        <div className="space-y-4">
          {response.message && <p>{response.message}</p>}
          
          {response.analysis.summary && (
            <div>
              <h3 className="text-lg font-semibold">Summary</h3>
              <p>{response.analysis.summary}</p>
            </div>
          )}
          
          {response.analysis.keyFindings && response.analysis.keyFindings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold">Key Findings</h3>
              <ul className="list-disc pl-5">
                {response.analysis.keyFindings.map((finding, index) => (
                  <li key={index}>{finding}</li>
                ))}
              </ul>
            </div>
          )}
          
          {response.analysis.recommendations && response.analysis.recommendations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold">Recommendations</h3>
              <ul className="list-disc pl-5">
                {response.analysis.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          )}
          
          {response.analysis.followUp && (
            <div>
              <h3 className="text-lg font-semibold">Follow-up</h3>
              <p>{response.analysis.followUp}</p>
            </div>
          )}
        </div>
      );
    }

    return <p>{response.message}</p>;
  };

  return (
    <Card className="flex h-[calc(100vh-2rem)] flex-col overflow-hidden">
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
        isLoading={isLoading}
      />
    </Card>
  );
};

export default ChatContainer; 