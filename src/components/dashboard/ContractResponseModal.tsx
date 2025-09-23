import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, DollarSign, Package } from 'lucide-react';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Contract } from '../../types';
import toast from 'react-hot-toast';

interface ContractResponseModalProps {
  contract: Contract;
  onClose: () => void;
}

const ContractResponseModal: React.FC<ContractResponseModalProps> = ({ contract, onClose }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pricePerUnit: '',
    availableQuantity: contract.quantity.toString(),
    message: `Hi! I can supply ${contract.cropType} as per your requirements. Let me know if you'd like to discuss further.`
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      const response = {
        id: Date.now().toString(),
        farmerId: currentUser.uid,
        farmerName: currentUser.displayName || 'Unknown Farmer',
        pricePerUnit: parseFloat(formData.pricePerUnit),
        availableQuantity: parseInt(formData.availableQuantity),
        message: formData.message,
        status: 'pending',
        createdAt: new Date()
      };

      await updateDoc(doc(db, 'contracts', contract.id), {
        responses: arrayUnion(response),
        status: 'negotiating',
        updatedAt: serverTimestamp()
      });

      toast.success('Response sent successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to send response');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Respond to Contract</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Contract Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{contract.cropType}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>Required: {contract.quantity} {contract.unit}</div>
              <div>Max Price: ${contract.maxPricePerUnit}/{contract.unit}</div>
              <div>Organic: {contract.isOrganicRequired ? 'Required' : 'Not required'}</div>
              <div>Location: {contract.location.address}</div>
            </div>
            {contract.description && (
              <p className="text-gray-600 text-sm mt-2">{contract.description}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Price per {contract.unit} ($) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pricePerUnit}
                    onChange={(e) => setFormData({...formData, pricePerUnit: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                    max={contract.maxPricePerUnit}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Max accepted: ${contract.maxPricePerUnit}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Quantity ({contract.unit}) *
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={formData.availableQuantity}
                    onChange={(e) => setFormData({...formData, availableQuantity: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                    max={contract.quantity}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Requested: {contract.quantity} {contract.unit}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message to Buyer *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Introduce yourself and provide details about your offer..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Your Offer Summary</h4>
              <div className="text-sm text-blue-800">
                <p>Quantity: {formData.availableQuantity} {contract.unit}</p>
                <p>Price: ${formData.pricePerUnit} per {contract.unit}</p>
                <p className="font-semibold mt-1">
                  Total: ${(parseFloat(formData.pricePerUnit || '0') * parseInt(formData.availableQuantity || '0')).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Sending...' : 'Send Response'}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ContractResponseModal;