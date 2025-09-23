import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Leaf, User, Package, Eye, Edit, Trash2, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { Crop } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import CropDetailsModal from './CropDetailsModal';
import OrderConfirmationModal from './OrderConfirmationModal';
import toast from 'react-hot-toast';

interface CropCardProps {
  crop: Crop;
}

const CropCard: React.FC<CropCardProps> = ({ crop }) => {
  const { currentUser } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Check if current user is the owner of this crop
  const isOwner = currentUser?.uid === crop.farmerId;

  const isExpiringSoon = () => {
    const daysUntilExpiry = Math.ceil((crop.expiryDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiry <= 7;
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowDetails(true)}
        className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border cursor-pointer"
      >
        <div className="relative">
          <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
            <Package className="w-16 h-16 text-white opacity-80" />
          </div>
          
          {crop.isOrganic && (
            <div className="absolute top-3 left-3 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <Leaf className="w-3 h-3 mr-1" />
              Organic
            </div>
          )}
          
          {isExpiringSoon() && (
            <div className="absolute top-3 right-3 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
              Expiring Soon
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{crop.cropName}</h3>
            {crop.variety && (
              <p className="text-gray-600 text-sm">{crop.variety}</p>
            )}
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center text-gray-600">
              <Package className="w-4 h-4 mr-2" />
              <span className="text-sm">{crop.quantity} {crop.unit} available</span>
            </div>

            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm truncate">{crop.location.address}</span>
            </div>

            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm">Harvested {format(crop.harvestDate, 'MMM dd, yyyy')}</span>
            </div>

            <div className="flex items-center text-gray-600">
              <User className="w-4 h-4 mr-2" />
              <span className="text-sm">By {crop.farmerName}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl font-bold text-green-600">
              ${crop.pricePerUnit}
              <span className="text-sm text-gray-500 font-normal">/{crop.unit}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-400">
              <Eye className="w-4 h-4" />
              <span className="text-sm">View Details</span>
            </div>
          </div>

          {crop.description && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-gray-600 text-sm line-clamp-2">{crop.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            {isOwner ? (
              // Farmer actions (edit, delete)
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info('Edit functionality coming soon!');
                  }}
                  className="flex-1 flex items-center justify-center px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info('Delete functionality coming soon!');
                  }}
                  className="flex-1 flex items-center justify-center px-3 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            ) : (
              // Buyer actions (view details, place order)
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(true);
                  }}
                  className="flex-1 flex items-center justify-center px-3 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOrderModal(true);
                  }}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Place Order
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {showDetails && (
        <CropDetailsModal
          crop={crop}
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
        />
      )}

      {showOrderModal && (
        <OrderConfirmationModal
          crop={crop}
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
        />
      )}
    </>
  );
};

export default CropCard;