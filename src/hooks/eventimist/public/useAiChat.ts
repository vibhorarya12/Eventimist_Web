// src/hooks/eventimist/public/useAiChat.ts

import { useState, useCallback, useRef } from "react";
import {
  discoverEventsAi,
  AiChatEvent,
} from "@/services/eventimist/public/aiChat.service";
import { Console } from "console";

export interface AiChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  events?: AiChatEvent[];
}

export function useAiChat() {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hey! 👋 I'm your event concierge. Ask me anything — try \"Find Music events near me\" or \"Show Art workshops this month\".",
    },
  ]);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache coords so we only geolocate once per session
  const coordsRef = useRef<{ latitude: number; longitude: number } | null>(null);

  const getCoords = useCallback((): Promise<{ latitude: number; longitude: number }> => {
    if (coordsRef.current) return Promise.resolve(coordsRef.current);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          coordsRef.current = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          resolve(coordsRef.current);
        },
        () => {
          // Fallback — Pune
          coordsRef.current = { latitude: 18.5204, longitude: 73.8567 };
          resolve(coordsRef.current);
        }
      );
    });
  }, []);

  const sendMessage = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed || thinking) return;

      // Add user message
      const userMsg: AiChatMessage = {
        id: Date.now().toString(),
        role: "user",
        text: trimmed,
      };
      setMessages((prev) => [...prev, userMsg]);
      setThinking(true);
      setError(null);

      try {
        const coords = await getCoords();
        const data = await discoverEventsAi({
          prompt: trimmed,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
         
        console.log("data <<<<<<<<<<<<<<<<<<<< ", data);
        const count = data.events.length;
        const reply =
          count > 0
            ? `Found ${count} event${count !== 1 ? "s" : ""} for you:`
            : "No events found for that. Try a different search!";

        const assistantMsg: AiChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: reply,
          events: data.events,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        setError("Something went wrong. Please try again.");
        const errMsg: AiChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: "Sorry, I couldn't fetch events right now. Please try again.",
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setThinking(false);
      }
    },
    [thinking, getCoords]
  );

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        text: "Hey! 👋 I'm your event concierge. Ask me anything — try \"Find Music events near me\" or \"Show Art workshops this month\".",
      },
    ]);
    setError(null);
  }, []);

  return { messages, thinking, error, sendMessage, clearMessages };
}