// Script to remove duplicate orders from Firestore database
// Run this script with: node scripts/removeDuplicateOrders.js

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // You'll need to add your service account key

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://farmconnect-9484b-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

async function removeDuplicateOrders() {
  try {
    console.log('🔍 Fetching all orders from database...');
    
    // Get all orders
    const ordersSnapshot = await db.collection('orders').get();
    const orders = [];
    
    ordersSnapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`📊 Found ${orders.length} total orders`);
    
    // Group orders by potential duplicates
    const duplicateGroups = new Map();
    
    orders.forEach(order => {
      // Create a key based on order characteristics
      const key = `${order.buyerId}_${order.farmerId}_${order.cropId}_${order.quantity}_${order.totalAmount}_${order.status}`;
      
      if (!duplicateGroups.has(key)) {
        duplicateGroups.set(key, []);
      }
      duplicateGroups.get(key).push(order);
    });
    
    // Find groups with duplicates
    const duplicates = [];
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
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate orders found!');
      return;
    }
    
    // Display duplicates
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
        console.log(`      Date: ${order.orderDate?.toDate?.() || order.orderDate}`);
      });
    });
    
    // Ask for confirmation (in a real scenario, you'd want user input)
    console.log('\n⚠️  WARNING: This will delete duplicate orders!');
    console.log('📝 Strategy: Keep the most recent order, delete older duplicates');
    
    let totalDeleted = 0;
    
    for (const duplicate of duplicates) {
      // Sort orders by date (most recent first)
      const sortedOrders = duplicate.orders.sort((a, b) => {
        const dateA = a.orderDate?.toDate?.() || a.orderDate || new Date(0);
        const dateB = b.orderDate?.toDate?.() || b.orderDate || new Date(0);
        return dateB - dateA;
      });
      
      // Keep the first (most recent) order, delete the rest
      const ordersToDelete = sortedOrders.slice(1);
      
      console.log(`\n🗑️  Deleting ${ordersToDelete.length} duplicate orders for group: ${duplicate.key}`);
      
      for (const orderToDelete of ordersToDelete) {
        try {
          await db.collection('orders').doc(orderToDelete.id).delete();
          console.log(`   ✅ Deleted order: ${orderToDelete.id}`);
          totalDeleted++;
        } catch (error) {
          console.error(`   ❌ Failed to delete order ${orderToDelete.id}:`, error.message);
        }
      }
    }
    
    console.log(`\n🎉 Cleanup complete! Deleted ${totalDeleted} duplicate orders.`);
    
    // Verify cleanup
    console.log('\n🔍 Verifying cleanup...');
    const finalSnapshot = await db.collection('orders').get();
    console.log(`📊 Final order count: ${finalSnapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error removing duplicate orders:', error);
  } finally {
    process.exit(0);
  }
}

// Run the cleanup
removeDuplicateOrders();
