import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Calendar, Star, MessageCircle, User } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Crop } from '../../types';
import CropCard from './CropCard';

const CropSearch: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [filteredCrops, setFilteredCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    sortBy: 'newest',
    isOrganic: '',
    location: '',
    priceRange: { min: '', max: '' }
  });

  useEffect(() => {
    const q = query(
      collection(db, 'crops'),
      where('status', '==', 'available'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cropsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        harvestDate: doc.data().harvestDate?.toDate() || new Date(),
        expiryDate: doc.data().expiryDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Crop[];
      
      setCrops(cropsData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let filtered = crops.filter(crop => 
      crop.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop.farmerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filters.isOrganic !== '') {
      filtered = filtered.filter(crop => 
        crop.isOrganic === (filters.isOrganic === 'true')
      );
    }

    if (filters.location) {
      filtered = filtered.filter(crop => 
        crop.location.address.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.priceRange.min) {
      filtered = filtered.filter(crop => 
        crop.pricePerUnit >= parseFloat(filters.priceRange.min)
      );
    }

    if (filters.priceRange.max) {
      filtered = filtered.filter(crop => 
        crop.pricePerUnit <= parseFloat(filters.priceRange.max)
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
        break;
      case 'harvest-date':
        filtered.sort((a, b) => b.harvestDate.getTime() - a.harvestDate.getTime());
        break;
      default:
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    setFilteredCrops(filtered);
  }, [crops, searchTerm, filters]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search crops, varieties, or farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="harvest-date">Latest Harvest</option>
          </select>

          <select
            value={filters.isOrganic}
            onChange={(e) => setFilters({...filters, isOrganic: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Crops</option>
            <option value="true">Organic Only</option>
            <option value="false">Non-Organic</option>
          </select>

          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min $"
              value={filters.priceRange.min}
              onChange={(e) => setFilters({
                ...filters,
                priceRange: {...filters.priceRange, min: e.target.value}
              })}
              className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <input
              type="number"
              placeholder="Max $"
              value={filters.priceRange.max}
              onChange={(e) => setFilters({
                ...filters,
                priceRange: {...filters.priceRange, max: e.target.value}
              })}
              className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          {filteredCrops.length} crops found
        </h3>
      </div>

      {filteredCrops.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No crops found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop, index) => (
            <motion.div
              key={crop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CropCard crop={crop} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CropSearch;