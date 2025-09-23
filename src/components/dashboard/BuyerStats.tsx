import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, TrendingDown, Clock, Package } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Contract, Crop } from '../../types';

interface StatItem {
  label: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
}

const BuyerStats: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<StatItem[]>([
    { label: 'Active Orders', value: 0, icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Cost Savings', value: '$0', icon: TrendingDown, color: 'bg-green-500' },
    { label: 'Pending Contracts', value: 0, icon: Clock, color: 'bg-orange-500' },
    { label: 'Total Purchases', value: 0, icon: Package, color: 'bg-purple-500' }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // Listen to contracts created by buyer
    const contractsQuery = query(
      collection(db, 'contracts'),
      where('buyerId', '==', currentUser.uid)
    );

    const contractsUnsubscribe = onSnapshot(contractsQuery, async (contractsSnapshot) => {
      const contracts = contractsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        requiredBy: doc.data().requiredBy?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Contract[];

      // Listen to crops to calculate purchases
      const cropsQuery = query(
        collection(db, 'crops'),
        where('status', '==', 'sold')
      );

      const cropsUnsubscribe = onSnapshot(cropsQuery, (cropsSnapshot) => {
        const crops = cropsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          harvestDate: doc.data().harvestDate?.toDate() || new Date(),
          expiryDate: doc.data().expiryDate?.toDate() || new Date(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })) as Crop[];

        // Calculate stats
        const activeOrders = contracts.filter(contract => 
          contract.status === 'open' || contract.status === 'negotiating'
        ).length;

        // Calculate cost savings (simplified - difference between market price and contract price)
        const costSavings = contracts
          .filter(contract => contract.status === 'closed')
          .reduce((sum, contract) => {
            const acceptedResponse = contract.responses.find(response => response.status === 'accepted');
            if (acceptedResponse) {
              const savings = (contract.maxPricePerUnit - acceptedResponse.pricePerUnit) * contract.quantity;
              return sum + Math.max(0, savings);
            }
            return sum;
          }, 0);

        const pendingContracts = contracts.filter(contract => 
          contract.status === 'open' && 
          contract.responses.some(response => response.status === 'pending')
        ).length;

        const totalPurchases = contracts.filter(contract => 
          contract.status === 'closed'
        ).length;

        setStats([
          { label: 'Active Orders', value: activeOrders, icon: ShoppingCart, color: 'bg-blue-500' },
          { label: 'Cost Savings', value: `$${costSavings.toLocaleString()}`, icon: TrendingDown, color: 'bg-green-500' },
          { label: 'Pending Contracts', value: pendingContracts, icon: Clock, color: 'bg-orange-500' },
          { label: 'Total Purchases', value: totalPurchases, icon: Package, color: 'bg-purple-500' }
        ]);

        setLoading(false);
      });

      return () => cropsUnsubscribe();
    });

    return () => contractsUnsubscribe();
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

export default BuyerStats;
