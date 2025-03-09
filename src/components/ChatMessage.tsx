import React from "react";
import { User, Bot } from "lucide-react";
import { cn } from "../lib/utils";

export type MessageType = "user" | "system" | "loading";

export interface ChatMessageProps {
  type: MessageType;
  content: string | React.ReactNode;
  timestamp?: Date;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  type,
  content,
  timestamp = new Date(),
}) => {
  const isUser = type === "user";
  const isLoading = type === "loading";

  return (
    <div
      className={cn(
        "flex w-full gap-3 p-4",
        isUser ? "bg-secondary/20" : "bg-background"
      )}
    >
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <p className="font-semibold">
            {isUser ? "You" : "Healthcare Assistant"}
          </p>
          {!isLoading && (
            <p className="text-xs text-muted-foreground">
              {timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
        <div className="prose prose-sm max-w-none">
          {isLoading ? (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary/50 [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary/50 [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary/50"></div>
            </div>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 