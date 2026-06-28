import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Subscription from '@/models/Subscription'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Check if users already exist
    const existingUsers = await User.countDocuments()
    if (existingUsers > 0) {
      return NextResponse.json({ 
        message: 'Database already seeded',
        usersCount: existingUsers 
      })
    }

    // Create subscriptions
    const basicSubscription = await Subscription.create({
      name: 'Basic',
      description: 'Perfect for small restaurants getting started',
      price: 29,
      billingPeriod: 'monthly',
      features: {
        maxRestaurants: 1,
        maxStaffPerRestaurant: 5,
        maxOrdersPerMonth: 500,
        storageGB: 5,
        features: [
          'Basic menu management',
          'Order management',
          'Basic reports',
          'Email support',
          '1 restaurant location',
        ],
      },
      isActive: true,
    })

    const proSubscription = await Subscription.create({
      name: 'Professional',
      description: 'For growing restaurants with multiple locations',
      price: 79,
      billingPeriod: 'monthly',
      features: {
        maxRestaurants: 3,
        maxStaffPerRestaurant: 20,
        maxOrdersPerMonth: 5000,
        storageGB: 20,
        features: [
          'Advanced menu management',
          'Table management',
          'Advanced analytics & reports',
          'Priority support',
          '3 restaurant locations',
          'Staff management',
          'Inventory tracking',
          'Customer database',
        ],
      },
      isActive: true,
      isPopular: true,
    })

    const premiumSubscription = await Subscription.create({
      name: 'Premium',
      description: 'Unlimited features for restaurant chains',
      price: 149,
      billingPeriod: 'monthly',
      features: {
        maxRestaurants: -1,
        maxStaffPerRestaurant: -1,
        maxOrdersPerMonth: -1,
        storageGB: 100,
        features: [
          'All Professional features',
          'Unlimited restaurants',
          'Unlimited staff',
          'Custom integrations',
          'Dedicated account manager',
          'API access',
          'White-label options',
          'Advanced security features',
          'Custom reporting',
        ],
      },
      isActive: true,
    })

    // Create users (password will be hashed by the User model's pre-save hook)
    const users = [
      {
        name: 'Super Admin',
        email: 'super@admin.com',
        password: 'password123',
        role: 'super_admin',
        phone: '+1 234 567 8900',
        address: '123 Admin Street, City, State 12345',
      },
      {
        name: 'Restaurant Owner',
        email: 'owner@restaurant.com',
        password: 'password123',
        role: 'restaurant_owner',
        phone: '+1 234 567 8901',
        address: '456 Owner Avenue, City, State 12345',
      },
      {
        name: 'Staff Member',
        email: 'staff@restaurant.com',
        password: 'password123',
        role: 'staff',
        phone: '+1 234 567 8902',
        address: '789 Staff Lane, City, State 12345',
      },
      {
        name: 'John Customer',
        email: 'customer@email.com',
        password: 'password123',
        role: 'customer',
        phone: '+1 234 567 8903',
        address: '321 Customer Road, City, State 12345',
      },
    ]

    const createdUsers = await User.insertMany(users)

    // Create a sample restaurant for the owner
    const Restaurant = (await import('@/models/Restaurant')).default
    const restaurant = await Restaurant.create({
      name: 'Delicious Bites Restaurant',
      ownerId: createdUsers[1]._id, // Restaurant Owner
      email: 'info@deliciousbites.com',
      phone: '+1 234 567 8901',
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      description: 'A modern restaurant serving delicious food with fresh ingredients',
      cuisine: ['Italian', 'American', 'Continental'],
      subscriptionId: proSubscription._id,
      subscriptionStatus: 'active',
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
      settings: {
        currency: 'USD',
        taxRate: 8.5,
        allowOnlineOrders: true,
        allowTableReservation: true,
        autoAcceptOrders: false,
      }
    })

    // Update owner with restaurant ID
    await User.findByIdAndUpdate(createdUsers[1]._id, { restaurantId: restaurant._id })

    // Create menu categories
    const MenuCategory = (await import('@/models/MenuCategory')).default
    const categories = await MenuCategory.insertMany([
      {
        restaurantId: restaurant._id,
        name: 'Appetizers',
        description: 'Start your meal with our delicious appetizers',
        isActive: true,
        sortOrder: 1
      },
      {
        restaurantId: restaurant._id,
        name: 'Main Course',
        description: 'Delicious main course dishes',
        isActive: true,
        sortOrder: 2
      },
      {
        restaurantId: restaurant._id,
        name: 'Desserts',
        description: 'Sweet treats to end your meal',
        isActive: true,
        sortOrder: 3
      },
      {
        restaurantId: restaurant._id,
        name: 'Beverages',
        description: 'Refreshing drinks and beverages',
        isActive: true,
        sortOrder: 4
      }
    ])

    // Create menu items
    const MenuItem = (await import('@/models/MenuItem')).default
    const menuItems = [
      // Appetizers
      { categoryId: categories[0]._id, name: 'Bruschetta', description: 'Toasted bread with tomatoes, garlic, and fresh basil', price: 8.99, isVegetarian: true, preparationTime: 10 },
      { categoryId: categories[0]._id, name: 'Caesar Salad', description: 'Fresh romaine lettuce with Caesar dressing and croutons', price: 10.99, isVegetarian: true, preparationTime: 5 },
      { categoryId: categories[0]._id, name: 'Chicken Wings', description: 'Crispy chicken wings with buffalo sauce', price: 12.99, preparationTime: 15 },
      { categoryId: categories[0]._id, name: 'Mozzarella Sticks', description: 'Breaded mozzarella with marinara sauce', price: 9.99, isVegetarian: true, preparationTime: 10 },
      
      // Main Course
      { categoryId: categories[1]._id, name: 'Margherita Pizza', description: 'Classic pizza with tomato sauce, mozzarella, and basil', price: 14.99, isVegetarian: true, preparationTime: 20 },
      { categoryId: categories[1]._id, name: 'Chicken Parmesan', description: 'Breaded chicken with marinara and melted cheese', price: 18.99, preparationTime: 25 },
      { categoryId: categories[1]._id, name: 'Pasta Carbonara', description: 'Creamy pasta with bacon, eggs, and parmesan', price: 16.99, preparationTime: 20 },
      { categoryId: categories[1]._id, name: 'Grilled Salmon', description: 'Fresh salmon with vegetables and rice', price: 24.99, isGlutenFree: true, preparationTime: 30 },
      { categoryId: categories[1]._id, name: 'Beef Burger', description: 'Juicy beef patty with lettuce, tomato, and fries', price: 15.99, preparationTime: 15 },
      
      // Desserts
      { categoryId: categories[2]._id, name: 'Tiramisu', description: 'Classic Italian dessert with coffee and mascarpone', price: 7.99, isVegetarian: true, preparationTime: 5 },
      { categoryId: categories[2]._id, name: 'Chocolate Cake', description: 'Rich chocolate layer cake', price: 8.99, isVegetarian: true, preparationTime: 5 },
      { categoryId: categories[2]._id, name: 'Ice Cream Sundae', description: 'Vanilla ice cream with chocolate sauce and nuts', price: 6.99, isVegetarian: true, preparationTime: 3 },
      
      // Beverages
      { categoryId: categories[3]._id, name: 'Coca Cola', description: 'Classic Coca Cola', price: 2.99, isVegetarian: true, preparationTime: 1 },
      { categoryId: categories[3]._id, name: 'Fresh Orange Juice', description: 'Freshly squeezed orange juice', price: 4.99, isVegetarian: true, preparationTime: 3 },
      { categoryId: categories[3]._id, name: 'Iced Tea', description: 'Refreshing iced tea with lemon', price: 3.49, isVegetarian: true, preparationTime: 2 },
      { categoryId: categories[3]._id, name: 'Coffee', description: 'Freshly brewed coffee', price: 3.99, isVegetarian: true, preparationTime: 3 },
    ]

    await MenuItem.insertMany(menuItems.map(item => ({
      ...item,
      restaurantId: restaurant._id,
      isAvailable: true,
      isFeatured: Math.random() > 0.7,
      sortOrder: 0
    })))

    // Create tables
    const Table = (await import('@/models/Table')).default
    const tables = []
    for (let i = 1; i <= 10; i++) {
      tables.push({
        restaurantId: restaurant._id,
        tableNumber: `T${i.toString().padStart(2, '0')}`,
        capacity: i <= 4 ? 2 : i <= 7 ? 4 : 6,
        status: 'available',
        isActive: true,
        location: i <= 5 ? 'Indoor' : 'Outdoor'
      })
    }
    await Table.insertMany(tables)

    // Create staff member
    const Staff = (await import('@/models/Staff')).default
    await Staff.create({
      userId: createdUsers[2]._id, // Staff user
      restaurantId: restaurant._id,
      employeeId: 'EMP001',
      position: 'Server',
      department: 'service',
      hireDate: new Date(),
      isActive: true,
      permissions: {
        canManageMenu: false,
        canManageOrders: true,
        canManageStaff: false,
        canViewReports: true,
        canProcessPayments: true,
      }
    })

    // Update staff user with restaurant ID
    await User.findByIdAndUpdate(createdUsers[2]._id, { restaurantId: restaurant._id })

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with sample data!',
      accounts: [
        { email: 'super@admin.com', password: 'password123', role: 'Super Admin' },
        { email: 'owner@restaurant.com', password: 'password123', role: 'Restaurant Owner' },
        { email: 'staff@restaurant.com', password: 'password123', role: 'Staff' },
        { email: 'customer@email.com', password: 'password123', role: 'Customer' },
      ],
      subscriptions: ['Basic ($29/mo)', 'Professional ($79/mo)', 'Premium ($149/mo)'],
      sampleData: {
        restaurant: 'Delicious Bites Restaurant',
        menuCategories: categories.length,
        menuItems: menuItems.length,
        tables: tables.length,
        staffMembers: 1
      }
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed database', details: error },
      { status: 500 }
    )
  }
}