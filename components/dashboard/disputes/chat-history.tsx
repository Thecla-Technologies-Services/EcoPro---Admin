"use client";

import * as React from "react";

import { formatTimestamp } from "@/lib/date";
import { Download, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/types/dispute";
import { StatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";

export type ChatRole = "Buyer" | "Seller";

interface ChatHistoryProps {
  messages: ChatMessage[];
  onExport?: () => void;
  className?: string;
  onSendMessage?: (message: string) => void | Promise<void>;
  showAdminInput?: boolean;
}

function AdminMessageInput({
  onSendMessage,
}: {
  onSendMessage?: (message: string) => void | Promise<void>;
}) {
  const [value, setValue] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);

  async function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || isSending) return;

    setValue(""); 
    setIsSending(true);
    try {
      await onSendMessage?.(trimmed);
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="pt-4 mt-2 border-t border-gray-100">
      <p className="text-sm font-medium text-gray-900 mb-2">
        Send Admin Message
      </p>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-gray-50 rounded-full px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#2D7A4F]/30"
        />
        <Button
          type="button"
          onClick={handleSend}
          disabled={!value.trim() || isSending}
          className="w-9 h-9 rounded-full bg-[#2D7A4F] hover:bg-[#235f3d] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 transition-colors"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 text-white" />
        </Button>
      </div>
    </div>
  );
}

function ChatMessageRow({ message }: { message: ChatMessage }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 shrink-0">
        <Avatar className="w-full h-full">
          <AvatarImage src={message.avatarUrl} alt={message.sender} />
          <AvatarFallback className="bg-gray-200 w-full h-full">
            {message.sender
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-semibold text-gray-900">
            {message.sender}
          </span>
          <span className="text-xs text-gray-400">
            {formatTimestamp(message.timestamp)}
          </span>
          <StatusBadge status={message.role} />
        </div>
        <div className="bg-gray-50 rounded-lg rounded-tl-none px-4 py-2.5 inline-block max-w-full">
          <p className="text-sm text-gray-700">{message.message}</p>
        </div>
      </div>
    </div>
  );
}

export function ChatHistory({
  messages,
  onExport,
  className,
  onSendMessage,
  showAdminInput = true,
}: ChatHistoryProps) {
  return (
    <div className={cn("bg-white rounded-lg p-4", className)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-gray-900">Chat History</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full text-xs font-medium text-gray-600 gap-1.5"
          onClick={onExport}
        >
          <Download className="w-3.5 h-3.5" />
          Export Chat
        </Button>
      </div>

      {messages.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          No messages yet.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {messages.map((msg) => (
            <ChatMessageRow key={msg.id} message={msg} />
          ))}
        </div>
      )}
      {showAdminInput && <AdminMessageInput onSendMessage={onSendMessage} />}
    </div>
  );
}
