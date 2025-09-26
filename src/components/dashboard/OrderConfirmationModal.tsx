import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Package, 
  User, 
  MapPin, 
  Calendar, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Crop, Order } from '../../types';
import NotificationService from '../../services/notificationService';
import toast from 'react-hot-toast';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  crop: Crop;
}

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  crop
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState({
    quantity: 1,
    deliveryDate: addDays(new Date(), 3).toISOString().split('T')[0],
    notes: '',
    deliveryAddress: ''
  });

  const totalAmount = orderData.quantity * crop.pricePerUnit;

  // Helper function to clean data for Firebase
  const cleanFirestoreData = (data: any): any => {
    const cleaned = { ...data };
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined) {
        cleaned[key] = null;
      } else if (typeof cleaned[key] === 'object' && cleaned[key] !== null) {
        cleaned[key] = cleanFirestoreData(cleaned[key]);
      }
    });
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) {
      console.log('Order submission already in progress, ignoring duplicate request');
      return;
    }
    
    if (!currentUser) {
      toast.error('Please sign in to place orders');
      return;
    }

    if (orderData.quantity > crop.quantity) {
      toast.error('Quantity exceeds available stock');
      return;
    }

    if (orderData.quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    // Validate required fields
    if (!currentUser.displayName) {
      toast.error('User display name is required');
      return;
    }

    if (!crop.farmerName) {
      toast.error('Farmer name is required');
      return;
    }

    setLoading(true);

    try {
      // Debug: Log crop data to check for undefined values
      console.log('Crop data:', crop);
      console.log('Order data:', orderData);
      console.log('Current user:', currentUser);
      
      // Validate crop data
      if (!crop.id || !crop.farmerId || !crop.cropName) {
        throw new Error('Invalid crop data: missing required fields');
      }
      
      // Validate user authentication
      if (!currentUser || !currentUser.uid) {
        throw new Error('User not authenticated');
      }
      
      // Create order
      const orderData_firestore: Omit<Order, 'id'> = {
        buyerId: currentUser.uid,
        buyerName: currentUser.displayName || currentUser.email || 'Unknown Buyer',
        farmerId: crop.farmerId,
        farmerName: crop.farmerName,
        cropId: crop.id,
        cropName: crop.cropName,
        variety: crop.variety,
        quantity: orderData.quantity,
        unit: crop.unit,
        pricePerUnit: crop.pricePerUnit,
        totalAmount: totalAmount,
        status: 'pending',
        orderDate: new Date(),
        deliveryDate: new Date(orderData.deliveryDate),
        location: {
          address: orderData.deliveryAddress || crop.location.address || 'Address not specified',
          coordinates: crop.location.coordinates || { lat: 0, lng: 0 }
        },
        notes: orderData.notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const cleanedOrderData = cleanFirestoreData(orderData_firestore);
      
      console.log('Creating order with data:', cleanedOrderData);
      
      const orderRef = await addDoc(collection(db, 'orders'), {
        ...cleanedOrderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('Order created successfully with ID:', orderRef.id);

      // Send notification to farmer (with error handling)
      try {
        await NotificationService.notifyOrderPlaced({
          farmerId: crop.farmerId,
          buyerName: currentUser.displayName,
          cropName: crop.cropName,
          quantity: orderData.quantity,
          unit: crop.unit,
          totalAmount: totalAmount,
          orderId: orderRef.id
        });
        console.log('Notification sent successfully');
      } catch (notificationError) {
        console.error('Failed to send notification, but order was created:', notificationError);
        // Don't fail the entire order creation if notification fails
      }

      // Update crop quantity
      const newQuantity = crop.quantity - orderData.quantity;
      if (newQuantity <= 0) {
        await updateDoc(doc(db, 'crops', crop.id), {
          status: 'sold',
          quantity: 0,
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(doc(db, 'crops', crop.id), {
          quantity: newQuantity,
          updatedAt: serverTimestamp()
        });
      }

      toast.success('Order placed successfully! The farmer will be notified.');
      onClose();
    } catch (error: any) {
      console.error('Error placing order:', error);
      
      // Show more specific error messages
      if (error.message?.includes('Missing or insufficient permissions')) {
        toast.error('Permission denied. Please make sure you are logged in and try again.');
      } else if (error.message?.includes('invalid data')) {
        toast.error('Invalid order data. Please check all fields and try again.');
      } else if (error.message?.includes('Invalid crop data')) {
        toast.error('Invalid crop information. Please refresh and try again.');
      } else if (error.message?.includes('User not authenticated')) {
        toast.error('Please sign in to place orders.');
      } else {
        toast.error('Failed to place order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setOrderData(prev => ({
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
                <h2 className="text-2xl font-bold text-gray-900">Place Order</h2>
                <p className="text-gray-600 mt-1">Confirm your order details</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Crop Information */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{crop.cropName}</h3>
                  {crop.variety && (
                    <p className="text-gray-600 text-sm">{crop.variety}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      <span>{crop.farmerName}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{crop.location.address}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">${crop.pricePerUnit}</p>
                  <p className="text-sm text-gray-500">per {crop.unit}</p>
                  <p className="text-sm text-gray-600 mt-1">{crop.quantity} {crop.unit} available</p>
                </div>
              </div>
            </div>

            {/* Order Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity ({crop.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={crop.quantity}
                  value={orderData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximum available: {crop.quantity} {crop.unit}
                </p>
              </div>

              {/* Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Delivery Date *
                </label>
                <input
                  type="date"
                  value={orderData.deliveryDate}
                  onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address
                </label>
                <input
                  type="text"
                  value={orderData.deliveryAddress}
                  onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                  placeholder="Enter delivery address (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  If not specified, will use farmer's location
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={orderData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any special requirements or notes for the farmer..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Order Summary */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-green-800 mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{orderData.quantity} {crop.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price per {crop.unit}:</span>
                    <span className="font-medium">${crop.pricePerUnit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Date:</span>
                    <span className="font-medium">{format(new Date(orderData.deliveryDate), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="border-t border-green-300 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold text-green-800">
                      <span>Total Amount:</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
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
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Place Order
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderConfirmationModal;
