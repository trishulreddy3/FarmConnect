import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Edit, Trash2, Eye } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Crop } from '../../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import CropDetailsModal from './CropDetailsModal';

const CropList: React.FC = () => {
  const { currentUser } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'crops'),
      where('farmerId', '==', currentUser.uid),
      where('status', 'in', ['available', 'reserved', 'sold_out'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cropsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          harvestDate: data.harvestDate?.toDate ? data.harvestDate.toDate() : (data.harvestDate || new Date()),
          expiryDate: data.expiryDate?.toDate ? data.expiryDate.toDate() : (data.expiryDate || new Date()),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || new Date()),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt || new Date())
        };
      }) as Crop[];
      
      setCrops(cropsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const handleDeleteCrop = async (cropId: string) => {
    if (!confirm('Are you sure you want to delete this crop?')) return;

    try {
      await deleteDoc(doc(db, 'crops', cropId));
      toast.success('Crop deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete crop');
      console.error(error);
    }
  };

  const handleStatusChange = async (cropId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'crops', cropId), {
        status: newStatus,
        updatedAt: new Date()
      });
      toast.success('Crop status updated!');
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (crops.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No crops listed yet</h3>
        <p className="text-gray-500">Add your first crop to start selling!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {crops.map((crop, index) => (
        <motion.div
          key={crop.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{crop.cropName}</h3>
                {crop.variety && (
                  <span className="text-gray-600">({crop.variety})</span>
                )}
                {crop.isOrganic && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Organic
                  </span>
                )}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  crop.status === 'available' 
                    ? 'bg-green-100 text-green-800'
                    : crop.status === 'reserved'
                    ? 'bg-orange-100 text-orange-800'
                    : crop.status === 'sold_out'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {crop.status === 'sold_out' ? 'Sold Out' : crop.status.charAt(0).toUpperCase() + crop.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Quantity:</span> {crop.quantity} {crop.unit}
                </div>
                <div>
                  <span className="font-medium">Price:</span> ${crop.pricePerUnit}/{crop.unit}
                </div>
                <div>
                  <span className="font-medium">Harvested:</span> {format(crop.harvestDate, 'MMM dd, yyyy')}
                </div>
                <div>
                  <span className="font-medium">Expires:</span> {format(crop.expiryDate, 'MMM dd, yyyy')}
                </div>
              </div>

              {crop.description && (
                <p className="text-gray-600 text-sm mt-3 line-clamp-2">{crop.description}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <select
                value={crop.status}
                onChange={(e) => handleStatusChange(crop.id, e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={crop.status === 'sold_out'}
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
                <option value="sold_out" disabled>Sold Out</option>
              </select>

              <button
                onClick={() => setSelectedCrop(crop)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>

              <button
                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDeleteCrop(crop.id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
      
      {selectedCrop && (
        <CropDetailsModal
          crop={selectedCrop}
          isOpen={!!selectedCrop}
          onClose={() => setSelectedCrop(null)}
        />
      )}
    </div>
  );
};

export default CropList;