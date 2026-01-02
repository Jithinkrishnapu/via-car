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
  from_name?: string;
  to_name?: string;
  from_user_type?: 'driver' | 'customer';
  to_user_type?: 'driver' | 'customer';
  from_profile_image?: string | null;
  to_profile_image?: string | null;
}

export function useMessages(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    console.log(`chats/${chatId}/messages`)
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
