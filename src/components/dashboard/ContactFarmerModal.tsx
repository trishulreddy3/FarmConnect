import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MessageCircle, Send } from 'lucide-react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Crop } from '../../types';
import toast from 'react-hot-toast';

interface ContactFarmerModalProps {
  crop: Crop;
  onClose: () => void;
}

const ContactFarmerModal: React.FC<ContactFarmerModalProps> = ({ crop, onClose }) => {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState(`Hi, I'm interested in your ${crop.cropName}. Could you provide more details about availability and delivery options?`);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!currentUser || !message.trim()) return;

    setLoading(true);
    try {
      // Check if chat room already exists
      const chatQuery = query(
        collection(db, 'chatRooms'),
        where('participants.farmerId', '==', crop.farmerId),
        where('participants.buyerId', '==', currentUser.uid)
      );
      
      const chatSnapshot = await getDocs(chatQuery);
      let chatRoomId;

      if (chatSnapshot.empty) {
        // Create new chat room
        const chatRoomDoc = await addDoc(collection(db, 'chatRooms'), {
          participants: {
            farmerId: crop.farmerId,
            farmerName: crop.farmerName,
            buyerId: currentUser.uid,
            buyerName: currentUser.displayName
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });
        chatRoomId = chatRoomDoc.id;
      } else {
        chatRoomId = chatSnapshot.docs[0].id;
      }

      // Send message
      await addDoc(collection(db, 'messages'), {
        chatRoomId,
        senderId: currentUser.uid,
        senderRole: 'buyer',
        text: message,
        timestamp: new Date(),
        read: false
      });

      toast.success('Message sent successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-md w-full"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Contact Farmer</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-900">{crop.cropName}</h3>
            <p className="text-gray-600 text-sm">From {crop.farmerName}</p>
            <p className="text-green-600 font-bold">${crop.pricePerUnit}/{crop.unit}</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendMessage}
              disabled={loading || !message.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Sending...' : 'Send Message'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactFarmerModal;