import { db } from '../firebase';
import { doc, collection, writeBatch, serverTimestamp, orderBy, query, onSnapshot } from 'firebase/firestore';

export async function sendMessage(chatId: string, fromId: string, toId: string, text: string) {
    const chatRef = doc(db, `chats/${chatId}`);
    const messagesRef = collection(chatRef, 'messages');
    const batch = writeBatch(db);

    const newMsgRef = doc(messagesRef); // auto id
    batch.set(newMsgRef, {
        from: fromId,
        to: toId,
        text,
        createdAt: serverTimestamp(),
    });

    batch.set(chatRef, {
        participants: [fromId, toId],
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
    }, { merge: true });

    await batch.commit();
}

export function listenMessages(chatId: string, callback: (messages: any[]) => void) {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    return onSnapshot(q, snap => {
        const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(msgs);
    });
}

export function makeChatId(userId1: string, userId2: string) {
    return userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`;
}

