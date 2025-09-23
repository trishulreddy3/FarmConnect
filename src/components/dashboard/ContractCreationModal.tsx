import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Package, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Leaf, 
  User, 
  FileText,
  Send
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Crop, Contract } from '../../types';
import toast from 'react-hot-toast';

interface ContractCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  crop?: Crop; // Optional crop for direct contract
  targetFarmerId?: string; // Optional specific farmer
  targetFarmerName?: string;
}

const ContractCreationModal: React.FC<ContractCreationModalProps> = ({
  isOpen,
  onClose,
  crop,
  targetFarmerId,
  targetFarmerName
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cropType: crop?.cropName || '',
    variety: crop?.variety || '',
    quantity: crop?.quantity || 0,
    unit: crop?.unit || 'kg',
    maxPricePerUnit: crop?.pricePerUnit || 0,
    requiredBy: addDays(new Date(), 7).toISOString().split('T')[0],
    isOrganicRequired: crop?.isOrganic || false,
    location: crop?.location?.address || '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Please sign in to create contracts');
      return;
    }

    if (!formData.cropType || !formData.quantity || !formData.maxPricePerUnit) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const contractData: Omit<Contract, 'id'> = {
        buyerId: currentUser.uid,
        buyerName: currentUser.displayName,
        cropType: formData.cropType,
        variety: formData.variety,
        quantity: formData.quantity,
        unit: formData.unit,
        maxPricePerUnit: formData.maxPricePerUnit,
        requiredBy: new Date(formData.requiredBy),
        isOrganicRequired: formData.isOrganicRequired,
        location: {
          address: formData.location,
          coordinates: crop?.location?.coordinates || { lat: 0, lng: 0 }
        },
        description: formData.description,
        status: 'open',
        responses: [],
        isDirectContract: !!targetFarmerId,
        targetFarmerId: targetFarmerId,
        targetFarmerName: targetFarmerName,
        cropId: crop?.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'contracts'), {
        ...contractData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast.success(
        targetFarmerId 
          ? `Direct contract sent to ${targetFarmerName}!` 
          : 'Contract created successfully!'
      );
      onClose();
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error('Failed to create contract');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {targetFarmerId ? 'Create Direct Contract' : 'Create Contract'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {targetFarmerId 
                    ? `Send a direct contract to ${targetFarmerName}` 
                    : 'Post a contract for farmers to respond'
                  }
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Crop Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-green-600" />
                Crop Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Type *
                  </label>
                  <input
                    type="text"
                    value={formData.cropType}
                    onChange={(e) => handleInputChange('cropType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Tomatoes, Wheat, Apples"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variety
                  </label>
                  <input
                    type="text"
                    value={formData.variety}
                    onChange={(e) => handleInputChange('variety', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Cherry, Durum, Red Delicious"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="100"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="lbs">Pounds (lbs)</option>
                    <option value="tons">Tons</option>
                    <option value="boxes">Boxes</option>
                    <option value="bags">Bags</option>
                    <option value="pieces">Pieces</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Pricing
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Price Per Unit *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.maxPricePerUnit}
                    onChange={(e) => handleInputChange('maxPricePerUnit', parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="2.50"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Maximum price you're willing to pay per {formData.unit}
                </p>
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-600" />
                Requirements
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required By *
                  </label>
                  <input
                    type="date"
                    value={formData.requiredBy}
                    onChange={(e) => handleInputChange('requiredBy', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="organic"
                    checked={formData.isOrganicRequired}
                    onChange={(e) => handleInputChange('isOrganicRequired', e.target.checked)}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="organic" className="flex items-center text-sm font-medium text-gray-700">
                    <Leaf className="w-4 h-4 mr-2 text-green-600" />
                    Organic Required
                  </label>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                Location
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter delivery address or city"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-600" />
                Additional Details
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                  placeholder="Add any specific requirements, quality standards, or additional information..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="w-5 h-5 mr-2" />
                )}
                {loading ? 'Creating...' : (targetFarmerId ? 'Send Direct Contract' : 'Create Contract')}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContractCreationModal;
