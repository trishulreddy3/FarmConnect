import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Award, Calendar, Phone, Star, Package } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { User, Crop } from '../../types';

interface FarmerDetailsModalProps {
  farmerId: string;
  farmerName: string;
  onClose: () => void;
}

const FarmerDetailsModal: React.FC<FarmerDetailsModalProps> = ({
  farmerId,
  farmerName,
  onClose
}) => {
  const [farmer, setFarmer] = useState<User | null>(null);
  const [farmerCrops, setFarmerCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarmerDetails = async () => {
      try {
        // Fetch farmer profile
        const farmerDoc = await getDoc(doc(db, 'users', farmerId));
        if (farmerDoc.exists()) {
          setFarmer({ id: farmerDoc.id, ...farmerDoc.data() } as User);
        }

        // Fetch farmer's crops
        const cropsQuery = query(
          collection(db, 'crops'),
          where('farmerId', '==', farmerId),
          where('status', '==', 'available')
        );
        const cropsSnapshot = await getDocs(cropsQuery);
        const crops = cropsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          harvestDate: doc.data().harvestDate?.toDate() || new Date(),
          expiryDate: doc.data().expiryDate?.toDate() || new Date(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })) as Crop[];
        setFarmerCrops(crops);
      } catch (error) {
        console.error('Error fetching farmer details:', error);
      }
      setLoading(false);
    };

    fetchFarmerDetails();
  }, [farmerId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!farmer) {
    return null;
  }

  const profile = farmer.profile as any; // Assuming it's a farmer profile

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Farmer Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Farmer Info */}
            <div className="lg:col-span-1">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {farmer.displayName?.charAt(0) || 'F'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{farmer.displayName}</h3>
                <p className="text-gray-600">{profile.farmName}</p>
                <div className="flex items-center justify-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">4.8 (24 reviews)</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-gray-600 text-sm">{profile.location?.address || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Farm Size</p>
                    <p className="text-gray-600 text-sm">{profile.farmSize || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Experience</p>
                    <p className="text-gray-600 text-sm">{profile.experience || 0} years</p>
                  </div>
                </div>

                {profile.certifications && profile.certifications.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Certifications</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profile.certifications.map((cert: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {profile.bio && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="font-medium text-gray-900 mb-2">About</p>
                    <p className="text-gray-600 text-sm">{profile.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Crops */}
            <div className="lg:col-span-2">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Available Crops ({farmerCrops.length})
              </h4>

              {farmerCrops.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No crops available at the moment</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {farmerCrops.map((crop) => (
                    <div key={crop.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold text-gray-900">{crop.cropName}</h5>
                        {crop.isOrganic && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Organic
                          </span>
                        )}
                      </div>
                      {crop.variety && (
                        <p className="text-gray-600 text-sm mb-2">{crop.variety}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {crop.quantity} {crop.unit}
                        </span>
                        <span className="font-bold text-green-600">
                          ${crop.pricePerUnit}/{crop.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FarmerDetailsModal;