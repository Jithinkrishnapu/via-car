import React, { createContext, useContext, useState, ReactNode } from 'react';

type ChatContextType = {
  currentUser: any;
  setUser: (user: any) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  // You'll pass user info from your existing auth system
  const [currentUser, setCurrentUser] = useState<any>(null);

  const setUser = (user: any) => {
    setCurrentUser(user);
  };

  return (
    <ChatContext.Provider value={{ currentUser, setUser }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};