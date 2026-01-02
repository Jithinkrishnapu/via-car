import { db } from '../firebase';
import { doc, collection, writeBatch, serverTimestamp, orderBy, query, onSnapshot } from 'firebase/firestore';

export async function sendMessage(
  chatId: string, 
  fromId: string, 
  toId: string, 
  text: string, 
  from_name: string, 
  to_name: string,
  fromUserType?: 'driver' | 'customer',
  toUserType?: 'driver' | 'customer',
  fromProfileImage?: string | null,
  toProfileImage?: string | null
) {
    // Prevent self-messaging
    if (String(fromId) === String(toId)) {
        throw new Error("Cannot send message to yourself");
    }

    const chatRef = doc(db, `chats/${chatId}`);
    const messagesRef = collection(chatRef, 'messages');
    const batch = writeBatch(db);

    const newMsgRef = doc(messagesRef); // auto id
    batch.set(newMsgRef, {
        from: fromId,
        to: toId,
        text,
        createdAt: serverTimestamp(),
        from_name,
        to_name,
        from_user_type: fromUserType || 'customer',
        to_user_type: toUserType || 'customer',
        from_profile_image: fromProfileImage || null,
        to_profile_image: toProfileImage || null
    });

    // Create/update the chat document with consistent field names
    batch.set(chatRef, {
        participants: [fromId, toId], // Keep participants for querying
        userNames: {
            [fromId]: from_name,
            [toId]: to_name
        },
        userTypes: {
            [fromId]: fromUserType || 'customer',
            [toId]: toUserType || 'customer'
        },
        userProfileImages: {
            [fromId]: fromProfileImage || null,
            [toId]: toProfileImage || null
        },
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        from_id: fromId,
        to_id: toId,
        from_name,
        to_name,
        from_user_type: fromUserType || 'customer',
        to_user_type: toUserType || 'customer',
        from_profile_image: fromProfileImage || null,
        to_profile_image: toProfileImage || null
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

export function makeChatId(userId1: string | number, userId2: string | number) {
    // Convert to strings and ensure consistent ordering
    const id1 = String(userId1);
    const id2 = String(userId2);
    return id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
}

export function getUserType(userDetails: any): 'driver' | 'customer' {
    return userDetails?.account?.is_driver === 1 ? 'driver' : 'customer';
}

export function canUsersChat(user1Id: string | number, user2Id: string | number): boolean {
    return String(user1Id) !== String(user2Id);
}

export function generateInitials(name: string | null | undefined): string {
    if (!name || typeof name !== 'string') return 'U';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }
    
    // Take first letter of first and last word
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

