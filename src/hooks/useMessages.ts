// hooks/useMessages.ts
import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase";

export interface Message {
  id: string;
  from: string;
  to: string;
  text: string;
  createdAt: any;
}

export function useMessages(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!chatId) return;
    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Message, "id">;
        return {
          ...data,
          id: doc.id,
        };
      });
      setMessages(msgs);
    });

    return () => unsub();
  }, [chatId]);

  return messages;
}
