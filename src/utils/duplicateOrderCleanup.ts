// Utility to remove duplicate orders from Firestore database
// This can be run in the browser console or as a utility function

import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Order } from '../types';

interface DuplicateGroup {
  key: string;
  count: number;
  orders: (Order & { id: string })[];
}

export class DuplicateOrderCleanup {
  static async findDuplicateOrders(): Promise<DuplicateGroup[]> {
    try {
      console.log('🔍 Fetching all orders from database...');
      
      // Get all orders
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const orders: (Order & { id: string })[] = [];
      
      ordersSnapshot.forEach(doc => {
        orders.push({
          id: doc.id,
          ...doc.data()
        } as Order & { id: string });
      });
      
      console.log(`📊 Found ${orders.length} total orders`);
      
      // Group orders by potential duplicates
      const duplicateGroups = new Map<string, (Order & { id: string })[]>();
      
      orders.forEach(order => {
        // Create a key based on order characteristics
        const key = `${order.buyerId}_${order.farmerId}_${order.cropId}_${order.quantity}_${order.totalAmount}_${order.status}`;
        
        if (!duplicateGroups.has(key)) {
          duplicateGroups.set(key, []);
        }
        duplicateGroups.get(key)!.push(order);
      });
      
      // Find groups with duplicates
      const duplicates: DuplicateGroup[] = [];
      duplicateGroups.forEach((group, key) => {
        if (group.length > 1) {
          duplicates.push({
            key,
            count: group.length,
            orders: group
          });
        }
      });
      
      console.log(`🔍 Found ${duplicates.length} groups of duplicate orders`);
      
      return duplicates;
    } catch (error) {
      console.error('❌ Error finding duplicate orders:', error);
      return [];
    }
  }
  
  static async displayDuplicates(duplicates: DuplicateGroup[]): Promise<void> {
    if (duplicates.length === 0) {
      console.log('✅ No duplicate orders found!');
      return;
    }
    
    console.log('\n📋 Duplicate Orders Found:');
    duplicates.forEach((duplicate, index) => {
      console.log(`\n${index + 1}. Group Key: ${duplicate.key}`);
      console.log(`   Count: ${duplicate.count} orders`);
      duplicate.orders.forEach((order, orderIndex) => {
        console.log(`   ${orderIndex + 1}. Order ID: ${order.id}`);
        console.log(`      Buyer: ${order.buyerName} (${order.buyerId})`);
        console.log(`      Farmer: ${order.farmerName} (${order.farmerId})`);
        console.log(`      Crop: ${order.cropName}`);
        console.log(`      Quantity: ${order.quantity} ${order.unit}`);
        console.log(`      Amount: $${order.totalAmount}`);
        console.log(`      Status: ${order.status}`);
        console.log(`      Date: ${order.orderDate}`);
      });
    });
  }
  
  static async removeDuplicates(duplicates: DuplicateGroup[], keepMostRecent: boolean = true): Promise<number> {
    let totalDeleted = 0;
    
    for (const duplicate of duplicates) {
      let ordersToDelete: (Order & { id: string })[];
      
      if (keepMostRecent) {
        // Sort orders by date (most recent first)
        const sortedOrders = duplicate.orders.sort((a, b) => {
          const dateA = new Date(a.orderDate);
          const dateB = new Date(b.orderDate);
          return dateB.getTime() - dateA.getTime();
        });
        
        // Keep the first (most recent) order, delete the rest
        ordersToDelete = sortedOrders.slice(1);
      } else {
        // Keep the first order, delete the rest
        ordersToDelete = duplicate.orders.slice(1);
      }
      
      console.log(`\n🗑️  Deleting ${ordersToDelete.length} duplicate orders for group: ${duplicate.key}`);
      
      for (const orderToDelete of ordersToDelete) {
        try {
          await deleteDoc(doc(db, 'orders', orderToDelete.id));
          console.log(`   ✅ Deleted order: ${orderToDelete.id}`);
          totalDeleted++;
        } catch (error: any) {
          console.error(`   ❌ Failed to delete order ${orderToDelete.id}:`, error.message);
        }
      }
    }
    
    return totalDeleted;
  }
  
  static async cleanup(): Promise<void> {
    try {
      console.log('🚀 Starting duplicate order cleanup...');
      
      // Find duplicates
      const duplicates = await this.findDuplicateOrders();
      
      if (duplicates.length === 0) {
        console.log('✅ No duplicate orders found!');
        return;
      }
      
      // Display duplicates
      await this.displayDuplicates(duplicates);
      
      // Confirm cleanup
      console.log('\n⚠️  WARNING: This will delete duplicate orders!');
      console.log('📝 Strategy: Keep the most recent order, delete older duplicates');
      
      // Remove duplicates
      const totalDeleted = await this.removeDuplicates(duplicates, true);
      
      console.log(`\n🎉 Cleanup complete! Deleted ${totalDeleted} duplicate orders.`);
      
      // Verify cleanup
      console.log('\n🔍 Verifying cleanup...');
      const finalSnapshot = await getDocs(collection(db, 'orders'));
      console.log(`📊 Final order count: ${finalSnapshot.size}`);
      
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }
}

// Export for use in browser console
(window as any).DuplicateOrderCleanup = DuplicateOrderCleanup;
