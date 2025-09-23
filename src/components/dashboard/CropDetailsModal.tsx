import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Calendar, 
  Leaf, 
  User, 
  MessageCircle, 
  Package, 
  DollarSign,
  Clock,
  Star,
  Phone,
  Mail,
  Building,
  Award,
  TrendingUp,
  Heart,
  Share2,
  Download,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { doc, getDoc, getDocs, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Crop, User as UserType, Contract } from '../../types';
import toast from 'react-hot-toast';
import ContractCreationModal from './ContractCreationModal';

interface CropDetailsModalProps {
  crop: Crop;
  isOpen: boolean;
  onClose: () => void;
}

const CropDetailsModal: React.FC<CropDetailsModalProps> = ({ crop, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [farmer, setFarmer] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContractForm, setShowContractForm] = useState(false);
  const [showContractCreation, setShowContractCreation] = useState(false);
  const [contractData, setContractData] = useState({
    quantity: crop.quantity,
    maxPricePerUnit: crop.pricePerUnit,
    requiredBy: '',
    message: ''
  });

  useEffect(() => {
    if (isOpen && crop.farmerId) {
      fetchFarmerDetails();
    }
  }, [isOpen, crop.farmerId]);

  const fetchFarmerDetails = async () => {
    try {
      const farmerDoc = await getDoc(doc(db, 'users', crop.farmerId));
      if (farmerDoc.exists()) {
        const farmerData = farmerDoc.data();
        setFarmer({
          ...farmerData,
          createdAt: farmerData.createdAt?.toDate ? farmerData.createdAt.toDate() : new Date(),
          updatedAt: farmerData.updatedAt?.toDate ? farmerData.updatedAt.toDate() : new Date()
        } as UserType);
      }
    } catch (error) {
      console.error('Error fetching farmer details:', error);
      toast.error('Failed to load farmer details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async () => {
    if (!currentUser || currentUser.role !== 'buyer') {
      toast.error('Only buyers can create contracts');
      return;
    }

    try {
      const contract: Omit<Contract, 'id'> = {
        buyerId: currentUser.uid,
        buyerName: currentUser.displayName,
        cropType: crop.cropName,
        variety: crop.variety,
        quantity: contractData.quantity,
        unit: crop.unit,
        maxPricePerUnit: contractData.maxPricePerUnit,
        requiredBy: new Date(contractData.requiredBy),
        isOrganicRequired: crop.isOrganic,
        location: crop.location,
        description: contractData.message,
        status: 'open',
        responses: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'contracts'), {
        ...contract,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast.success('Contract created successfully!');
      setShowContractForm(false);
      onClose();
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error('Failed to create contract');
    }
  };

  const handleContactFarmer = async () => {
    if (!currentUser) {
      toast.error('Please sign in to contact farmers');
      return;
    }

    try {
      // Check if chat room already exists
      const chatQuery = query(
        collection(db, 'chatRooms'),
        where('participants.farmerId', '==', crop.farmerId),
        where('participants.buyerId', '==', currentUser.uid)
      );

      const chatSnapshot = await getDocs(chatQuery);
      
      if (chatSnapshot.empty) {
        // Create new chat room
        await addDoc(collection(db, 'chatRooms'), {
          participants: {
            farmerId: crop.farmerId,
            farmerName: crop.farmerName,
            buyerId: currentUser.uid,
            buyerName: currentUser.displayName
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      toast.success('Chat room created! You can now message the farmer.');
      onClose();
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to start conversation');
    }
  };

  const isExpiringSoon = () => {
    const daysUntilExpiry = Math.ceil((crop.expiryDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiry <= 7;
  };

  const getDaysUntilExpiry = () => {
    const daysUntilExpiry = Math.ceil((crop.expiryDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiry;
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
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{crop.cropName}</h2>
              {crop.variety && (
                <p className="text-gray-600">{crop.variety}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Crop Details */}
                <div className="space-y-6">
                  {/* Crop Image */}
                  <div className="relative">
                    <div className="h-64 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                      <Package className="w-20 h-20 text-white opacity-80" />
                    </div>
                    
                    <div className="absolute top-4 left-4 flex flex-col space-y-2">
                      {crop.isOrganic && (
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                          <Leaf className="w-4 h-4 mr-1" />
                          Organic
                        </div>
                      )}
                      
                      {isExpiringSoon() && (
                        <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                          <Clock className="w-4 h-4 mr-1 inline" />
                          Expires in {getDaysUntilExpiry()} days
                        </div>
                      )}
                    </div>

                    <div className="absolute top-4 right-4">
                      <div className="flex space-x-2">
                        <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                          <Heart className="w-5 h-5 text-gray-600" />
                        </button>
                        <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                          <Share2 className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Crop Information */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">Crop Information</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Package className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Available Quantity</p>
                          <p className="font-semibold">{crop.quantity} {crop.unit}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Price per {crop.unit}</p>
                          <p className="font-semibold text-green-600">${crop.pricePerUnit}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Harvest Date</p>
                          <p className="font-semibold">{format(crop.harvestDate, 'MMM dd, yyyy')}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Expiry Date</p>
                          <p className="font-semibold">{format(crop.expiryDate, 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                    </div>

                    {crop.description && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                        <p className="text-gray-600">{crop.description}</p>
                      </div>
                    )}

                    {crop.certifications && crop.certifications.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Certifications</h4>
                        <div className="flex flex-wrap gap-2">
                          {crop.certifications.map((cert, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                              <Award className="w-3 h-3 mr-1 inline" />
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Farmer Details & Actions */}
                <div className="space-y-6">
                  {/* Farmer Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Farmer Information</h3>
                    
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                      </div>
                    ) : farmer ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            {farmer.photoURL ? (
                              <img 
                                src={farmer.photoURL} 
                                alt={farmer.displayName}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-8 h-8 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{farmer.displayName}</h4>
                            <p className="text-gray-600">{farmer.profile.farmName}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{farmer.profile.location.address}</span>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Farm Size: {farmer.profile.farmSize}</span>
                          </div>

                          <div className="flex items-center space-x-3">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{farmer.profile.experience} years experience</span>
                          </div>

                          {farmer.profile.phone && (
                            <div className="flex items-center space-x-3">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{farmer.profile.phone}</span>
                            </div>
                          )}

                          {farmer.email && (
                            <div className="flex items-center space-x-3">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{farmer.email}</span>
                            </div>
                          )}
                        </div>

                        {farmer.profile.bio && (
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-2">About the Farmer</h5>
                            <p className="text-sm text-gray-600">{farmer.profile.bio}</p>
                          </div>
                        )}

                        {farmer.profile.certifications && farmer.profile.certifications.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-2">Farm Certifications</h5>
                            <div className="flex flex-wrap gap-2">
                              {farmer.profile.certifications.map((cert, index) => (
                                <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                                  <Award className="w-3 h-3 mr-1 inline" />
                                  {cert}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">Failed to load farmer details</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">Actions</h3>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={handleContactFarmer}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>Message Farmer</span>
                      </button>

                      {currentUser?.role === 'buyer' && (
                        <button
                          onClick={() => setShowContractCreation(true)}
                          className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                        >
                          <FileText className="w-5 h-5" />
                          <span>Create Direct Contract</span>
                        </button>
                      )}

                      <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                        <Download className="w-5 h-5" />
                        <span>Download Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Form Modal */}
          {showContractForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-white rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Create Contract</h3>
                <button
                  onClick={() => setShowContractForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity Required ({crop.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={crop.quantity}
                    value={contractData.quantity}
                    onChange={(e) => setContractData({...contractData, quantity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Price per {crop.unit} ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={contractData.maxPricePerUnit}
                    onChange={(e) => setContractData({...contractData, maxPricePerUnit: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required By
                  </label>
                  <input
                    type="date"
                    value={contractData.requiredBy}
                    onChange={(e) => setContractData({...contractData, requiredBy: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message to Farmer
                  </label>
                  <textarea
                    value={contractData.message}
                    onChange={(e) => setContractData({...contractData, message: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe your requirements..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleCreateContract}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Create Contract
                  </button>
                  <button
                    onClick={() => setShowContractForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Contract Creation Modal */}
      <ContractCreationModal
        isOpen={showContractCreation}
        onClose={() => setShowContractCreation(false)}
        crop={crop}
        targetFarmerId={crop.farmerId}
        targetFarmerName={crop.farmerName}
      />
    </AnimatePresence>
  );
};

export default CropDetailsModal;
