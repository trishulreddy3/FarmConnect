import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Search } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, or } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { ChatRoom } from '../../types';
import { format } from 'date-fns';
import ChatWindow from './ChatWindow';

const ChatsList: React.FC = () => {
  const { currentUser } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'chatRooms'),
      or(
        where('participants.farmerId', '==', currentUser.uid),
        where('participants.buyerId', '==', currentUser.uid)
      ),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatRoomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        lastMessage: doc.data().lastMessage ? {
          ...doc.data().lastMessage,
          timestamp: doc.data().lastMessage.timestamp?.toDate() || new Date()
        } : undefined
      })) as ChatRoom[];
      
      setChatRooms(chatRoomsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const filteredChatRooms = chatRooms.filter(chatRoom => {
    const otherParticipant = currentUser?.role === 'farmer' 
      ? chatRoom.participants.buyerName 
      : chatRoom.participants.farmerName;
    return otherParticipant.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (selectedChatRoom) {
    return (
      <ChatWindow
        chatRoom={selectedChatRoom}
        onBack={() => setSelectedChatRoom(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {filteredChatRooms.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No conversations yet</h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'No conversations match your search' 
              : 'Start browsing crops or contracts to begin conversations!'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredChatRooms.map((chatRoom, index) => {
            const otherParticipant = currentUser?.role === 'farmer' 
              ? { name: chatRoom.participants.buyerName, role: 'buyer' }
              : { name: chatRoom.participants.farmerName, role: 'farmer' };

            return (
              <motion.div
                key={chatRoom.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedChatRoom(chatRoom)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {otherParticipant.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{otherParticipant.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          otherParticipant.role === 'farmer'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {otherParticipant.role}
                        </span>
                      </div>
                      {chatRoom.lastMessage && (
                        <p className="text-gray-600 text-sm truncate mt-1">
                          {chatRoom.lastMessage.text}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {chatRoom.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {format(chatRoom.lastMessage.timestamp, 'MMM dd')}
                      </span>
                    )}
                    <div className="w-3 h-3 bg-blue-500 rounded-full opacity-0"></div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatsList;