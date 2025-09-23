import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, DollarSign, Package, FileText, Clock, CheckCircle } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Contract } from '../../types';
import { format } from 'date-fns';
import ContractResponseModal from './ContractResponseModal';

interface ContractsListProps {
  userType: 'farmer' | 'buyer';
}

const ContractsList: React.FC<ContractsListProps> = ({ userType }) => {
  const { currentUser } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct' | 'all'>('direct');

  useEffect(() => {
    if (!currentUser) return;

    let q;
    if (userType === 'buyer') {
      q = query(
        collection(db, 'contracts'),
        where('buyerId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
    } else {
      // For farmers, show all open contracts
      q = query(
        collection(db, 'contracts'),
        where('status', '==', 'open'),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contractsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        requiredBy: doc.data().requiredBy?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Contract[];
      
      setContracts(contractsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, userType]);

  // Filter contracts based on active tab
  const filteredContracts = contracts.filter(contract => {
    if (activeTab === 'direct') {
      if (userType === 'farmer') {
        // Show direct contracts to this farmer
        return contract.isDirectContract && contract.targetFarmerId === currentUser?.uid;
      } else {
        // Show direct contracts created by this buyer
        return contract.isDirectContract;
      }
    } else {
      // Show all contracts
      return true;
    }
  });

  const handleContractClick = (contract: Contract) => {
    setSelectedContract(contract);
    if (userType === 'farmer') {
      setShowResponseModal(true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (filteredContracts.length === 0) {
    return (
      <>
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('direct')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'direct'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {userType === 'farmer' ? 'Direct Contracts to Me' : 'My Direct Contracts'}
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Contracts
              </button>
            </nav>
          </div>
        </div>

        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {activeTab === 'direct' 
              ? (userType === 'buyer' ? 'No direct contracts yet' : 'No direct contracts received')
              : (userType === 'buyer' ? 'No contracts posted yet' : 'No contracts available')
            }
          </h3>
          <p className="text-gray-500">
            {activeTab === 'direct'
              ? (userType === 'buyer' 
                  ? 'Create direct contracts to specific farmers!'
                  : 'Direct contracts from buyers will appear here!'
                )
              : (userType === 'buyer' 
                  ? 'Create your first contract to start connecting with farmers!'
                  : 'Check back later for new opportunities!'
                )
            }
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('direct')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'direct'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {userType === 'farmer' ? 'Direct Contracts to Me' : 'My Direct Contracts'}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Contracts
            </button>
          </nav>
        </div>
      </div>

      <div className="space-y-4">
        {filteredContracts.map((contract, index) => (
          <motion.div
            key={contract.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleContractClick(contract)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {contract.cropType}
                    {contract.variety && <span className="text-gray-600"> ({contract.variety})</span>}
                  </h3>
                  {contract.isOrganicRequired && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Organic Required
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    contract.status === 'open' 
                      ? 'bg-blue-100 text-blue-800'
                      : contract.status === 'negotiating'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <Package className="w-4 h-4" />
                    <span>{contract.quantity} {contract.unit}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>Up to ${contract.maxPricePerUnit}/{contract.unit}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>By {format(contract.requiredBy, 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{contract.location.address}</span>
                  </div>
                </div>

                {contract.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">{contract.description}</p>
                )}
              </div>

              <div className="flex items-center space-x-4 ml-4">
                {userType === 'buyer' && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {contract.responses.length} Response{contract.responses.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      Posted {format(contract.createdAt, 'MMM dd')}
                    </p>
                  </div>
                )}
                
                {userType === 'farmer' && (
                  <div className="flex flex-col items-center space-y-1">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="text-xs text-gray-600">Respond</span>
                  </div>
                )}
              </div>
            </div>

            {userType === 'buyer' && contract.responses.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-2">Recent responses:</p>
                <div className="flex -space-x-2">
                  {contract.responses.slice(0, 3).map((response, idx) => (
                    <div
                      key={response.id}
                      className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold border-2 border-white"
                      title={response.farmerName}
                    >
                      {response.farmerName.charAt(0)}
                    </div>
                  ))}
                  {contract.responses.length > 3 && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-semibold border-2 border-white">
                      +{contract.responses.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {showResponseModal && selectedContract && (
        <ContractResponseModal
          contract={selectedContract}
          onClose={() => {
            setShowResponseModal(false);
            setSelectedContract(null);
          }}
        />
      )}
    </>
  );
};

export default ContractsList;