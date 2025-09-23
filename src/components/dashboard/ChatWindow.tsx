import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, User } from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { ChatRoom, Message } from '../../types';
import { format, isToday, isYesterday } from 'date-fns';

interface ChatWindowProps {
  chatRoom: ChatRoom;
  onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatRoom, onBack }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherParticipant = currentUser?.role === 'farmer' 
    ? { name: chatRoom.participants.buyerName, role: 'buyer' }
    : { name: chatRoom.participants.farmerName, role: 'farmer' };

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      where('chatRoomId', '==', chatRoom.id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as Message[];
      
      setMessages(messagesData);
      setLoading(false);
      scrollToBottom();
    });

    return unsubscribe;
  }, [chatRoom.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newMessage.trim()) return;

    try {
      const messageData = {
        chatRoomId: chatRoom.id,
        senderId: currentUser.uid,
        senderRole: currentUser.role,
        text: newMessage.trim(),
        timestamp: new Date(),
        read: false
      };

      await addDoc(collection(db, 'messages'), messageData);

      // Update chat room's last message
      await updateDoc(doc(db, 'chatRooms', chatRoom.id), {
        lastMessage: {
          text: newMessage.trim(),
          senderId: currentUser.uid,
          timestamp: new Date()
        },
        updatedAt: new Date()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatMessageTime = (timestamp: Date) => {
    if (isToday(timestamp)) {
      return format(timestamp, 'HH:mm');
    } else if (isYesterday(timestamp)) {
      return 'Yesterday ' + format(timestamp, 'HH:mm');
    } else {
      return format(timestamp, 'MMM dd, HH:mm');
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const dateKey = format(message.timestamp, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM dd, yyyy');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {otherParticipant.name.charAt(0)}
          </span>
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{otherParticipant.name}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${
            otherParticipant.role === 'farmer'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {otherParticipant.role}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(messageGroups).map(([dateStr, dayMessages]) => (
          <div key={dateStr}>
            {/* Date Header */}
            <div className="flex justify-center mb-4">
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                {formatDateHeader(dateStr)}
              </span>
            </div>

            {/* Messages for this day */}
            <div className="space-y-2">
              {dayMessages.map((message, index) => {
                const isOwnMessage = message.senderId === currentUser?.uid;
                const showAvatar = index === 0 || dayMessages[index - 1].senderId !== message.senderId;

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                      isOwnMessage ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                    }`}>
                      {!isOwnMessage && showAvatar && (
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-xs">
                            {otherParticipant.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      {!isOwnMessage && !showAvatar && (
                        <div className="w-8 h-8 flex-shrink-0"></div>
                      )}
                      
                      <div className={`rounded-2xl px-4 py-2 ${
                        isOwnMessage 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatMessageTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;