import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListGeminiMessagesQueryKey } from "@workspace/api-client-react";

interface StreamChunk {
  content?: string;
  done?: boolean;
}

export function useGeminiStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const sendMessage = useCallback(async (conversationId: number, content: string) => {
    setIsStreaming(true);
    setStreamedContent("");
    setError(null);

    // Optimistically update the cache to show the user's message immediately
    queryClient.setQueryData(
      getListGeminiMessagesQueryKey(conversationId),
      (old: any) => {
        const newMessage = {
          id: Date.now(), // temporary ID
          conversationId,
          role: "user",
          content,
          createdAt: new Date().toISOString(),
        };
        return Array.isArray(old) ? [...old, newMessage] : [newMessage];
      }
    );

    try {
      const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/api/gemini/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            try {
              const data: StreamChunk = JSON.parse(dataStr);
              if (data.done) {
                break;
              }
              if (data.content) {
                fullText += data.content;
                setStreamedContent(fullText);
              }
            } catch (e) {
              console.error("Failed to parse SSE chunk", e);
            }
          }
        }
      }

      // Once complete, invalidate the query to get the actual saved message from DB
      queryClient.invalidateQueries({
        queryKey: getListGeminiMessagesQueryKey(conversationId)
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsStreaming(false);
      setStreamedContent(""); // Clear local stream state as DB now has it
    }
  }, [queryClient]);

  return { sendMessage, isStreaming, streamedContent, error };
}
