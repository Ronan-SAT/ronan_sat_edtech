"use client";

import { useEffect, useState } from "react";

import { API_PATHS } from "@/lib/apiPaths";
import api from "@/lib/axios";
import { readThroughClientCache, setClientCache } from "@/lib/clientCache";

const CHAT_HISTORY_TTL_MS = 10 * 60 * 1000;

export interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

function getChatHistoryCacheKey(questionId: string) {
  return `chat:history:${questionId}`;
}

export function useChatbot(questionId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchHistory = async () => {
      try {
        setIsFetchingHistory(true);

        const cachedMessages = await readThroughClientCache(
          getChatHistoryCacheKey(questionId),
          async () => {
            const res = await api.get(API_PATHS.getChatByQuestionId(questionId));
            return Array.isArray(res.data?.messages) ? (res.data.messages as Message[]) : [];
          },
          { ttlMs: CHAT_HISTORY_TTL_MS },
        );

        if (active) {
          setMessages(cachedMessages);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
        if (active) {
          setMessages([]);
        }
      } finally {
        if (active) {
          setIsFetchingHistory(false);
        }
      }
    };

    void fetchHistory();

    return () => {
      active = false;
    };
  }, [questionId]);

  const sendMessage = async (userMsg: string) => {
    const cacheKey = getChatHistoryCacheKey(questionId);
    const optimisticMessage: Message = { role: "user", parts: [{ text: userMsg }] };

    setMessages((prev) => {
      const nextMessages = [...prev, optimisticMessage];
      setClientCache(cacheKey, nextMessages, CHAT_HISTORY_TTL_MS);
      return nextMessages;
    });
    setIsLoading(true);

    try {
      const res = await api.post(API_PATHS.CHAT, { questionId, message: userMsg });
      const data = res.data;

      if (Array.isArray(data.messages)) {
        setMessages(data.messages);
        setClientCache(cacheKey, data.messages as Message[], CHAT_HISTORY_TTL_MS);
      } else if (data.response) {
        setMessages((prev) => {
          const nextMessages = [...prev, { role: "model" as const, parts: [{ text: data.response as string }] }];
          setClientCache(cacheKey, nextMessages, CHAT_HISTORY_TTL_MS);
          return nextMessages;
        });
      } else if (data.error) {
        throw new Error(data.error as string);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => {
        const nextMessages = [
          ...prev,
          {
            role: "model" as const,
            parts: [{ text: "Sorry, I ran into an error processing your request. Please try again." }],
          },
        ];
        setClientCache(cacheKey, nextMessages, CHAT_HISTORY_TTL_MS);
        return nextMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    isFetchingHistory,
    sendMessage,
  };
}
