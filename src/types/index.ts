export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'farmer' | 'buyer';
  createdAt: Date;
  updatedAt: Date;
  profile: FarmerProfile | BuyerProfile;
}

export interface FarmerProfile {
  farmName: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  farmSize: string;
  certifications: string[];
  experience: number;
  bio: string;
  phone: string;
}

export interface BuyerProfile {
  companyName: string;
  businessType: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  bio: string;
  phone: string;
}

export interface Crop {
  id: string;
  farmerId: string;
  farmerName: string;
  cropName: string;
  variety: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  isOrganic: boolean;
  harvestDate: Date;
  expiryDate: Date;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  description: string;
  certifications: string[];
  status: 'available' | 'reserved' | 'sold';
  createdAt: Date;
  updatedAt: Date;
}

export interface Contract {
  id: string;
  buyerId: string;
  buyerName: string;
  cropType: string;
  variety?: string;
  quantity: number;
  unit: string;
  maxPricePerUnit: number;
  requiredBy: Date;
  isOrganicRequired: boolean;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  description: string;
  status: 'open' | 'negotiating' | 'closed';
  responses: ContractResponse[];
  // New fields for direct contracts
  isDirectContract: boolean;
  targetFarmerId?: string; // For direct contracts to specific farmer
  targetFarmerName?: string;
  cropId?: string; // Reference to specific crop if contract is for a crop
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractResponse {
  id: string;
  farmerId: string;
  farmerName: string;
  pricePerUnit: number;
  availableQuantity: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface ChatRoom {
  id: string;
  participants: {
    farmerId: string;
    farmerName: string;
    buyerId: string;
    buyerName: string;
  };
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderRole: 'farmer' | 'buyer';
  text: string;
  timestamp: Date;
  read: boolean;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  cropId: string;
  cropName: string;
  variety?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  deliveryDate?: Date;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string; // Farmer or buyer ID
  type: 'order_placed' | 'order_confirmed' | 'order_shipped' | 'order_delivered' | 'order_cancelled' | 'contract_created' | 'contract_response' | 'message_received';
  title: string;
  message: string;
  data?: {
    orderId?: string;
    contractId?: string;
    chatRoomId?: string;
    buyerId?: string;
    buyerName?: string;
    farmerId?: string;
    farmerName?: string;
    cropId?: string;
    cropName?: string;
    amount?: number;
  };
  isRead: boolean;
  createdAt: Date;
}