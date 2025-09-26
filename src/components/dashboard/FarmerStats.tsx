import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sprout, DollarSign, Clock, FileText } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Crop, Contract } from '../../types';

interface StatItem {
  label: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
}

const FarmerStats: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<StatItem[]>([
    { label: 'Active Crops', value: 0, icon: Sprout, color: 'bg-green-500' },
    { label: 'Total Revenue', value: '$0', icon: DollarSign, color: 'bg-blue-500' },
    { label: 'Pending Orders', value: 0, icon: Clock, color: 'bg-orange-500' },
    { label: 'Active Contracts', value: 0, icon: FileText, color: 'bg-purple-500' }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // Listen to crops
    const cropsQuery = query(
      collection(db, 'crops'),
      where('farmerId', '==', currentUser.uid)
    );

    const cropsUnsubscribe = onSnapshot(cropsQuery, async (cropsSnapshot) => {
      const crops = cropsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        harvestDate: doc.data().harvestDate?.toDate() || new Date(),
        expiryDate: doc.data().expiryDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Crop[];

      // Listen to contracts
      const contractsQuery = query(
        collection(db, 'contracts'),
        where('responses', 'array-contains-any', [])
      );

      const contractsUnsubscribe = onSnapshot(contractsQuery, async (contractsSnapshot) => {
        const contracts = contractsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          requiredBy: doc.data().requiredBy?.toDate() || new Date(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })) as Contract[];

        // Calculate stats
        const activeCrops = crops.filter(crop => crop.status === 'available').length;
        const totalRevenue = crops
          .filter(crop => crop.status === 'sold')
          .reduce((sum, crop) => sum + (crop.pricePerUnit * crop.quantity), 0);
        
        const pendingOrders = crops.filter(crop => crop.status === 'reserved').length;
        
        const activeContracts = contracts.filter(contract => 
          contract.status === 'open' && 
          contract.responses.some(response => response.farmerId === currentUser.uid)
        ).length;

        setStats([
          { label: 'Active Crops', value: activeCrops, icon: Sprout, color: 'bg-green-500' },
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-blue-500' },
          { label: 'Pending Orders', value: pendingOrders, icon: Clock, color: 'bg-orange-500' },
          { label: 'Active Contracts', value: activeContracts, icon: FileText, color: 'bg-purple-500' }
        ]);

        setLoading(false);
      });

      return () => contractsUnsubscribe();
    });

    return () => cropsUnsubscribe();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + index * 0.1 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {stat.value}
              </p>
            </div>
            <motion.div 
              className={`p-4 rounded-xl ${stat.color} shadow-lg`}
              whileHover={{ rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <stat.icon className="w-6 h-6 text-white" />
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default FarmerStats;

