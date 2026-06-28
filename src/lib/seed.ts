import connectDB from './mongodb'
import User from '@/models/User'
import Subscription from '@/models/Subscription'
import bcrypt from 'bcryptjs'

async function seed() {
  try {
    await connectDB()
    console.log('Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await Subscription.deleteMany({})
    console.log('Cleared existing data')

    // Create sample subscriptions
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

    console.log('Created subscription plans')

    // Hash passwords
    const hashedPassword = await bcrypt.hash('password123', 10)

    // Create Super Admin
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'super@admin.com',
      password: hashedPassword,
      role: 'super_admin',
      phone: '+1 234 567 8900',
      address: '123 Admin Street, City, State 12345',
      isActive: true,
    })

    // Create Restaurant Owner
    const owner = await User.create({
      name: 'Restaurant Owner',
      email: 'owner@restaurant.com',
      password: hashedPassword,
      role: 'restaurant_owner',
      phone: '+1 234 567 8901',
      address: '456 Owner Avenue, City, State 12345',
      isActive: true,
    })

    // Create Staff
    const staff = await User.create({
      name: 'Staff Member',
      email: 'staff@restaurant.com',
      password: hashedPassword,
      role: 'staff',
      phone: '+1 234 567 8902',
      address: '789 Staff Lane, City, State 12345',
      isActive: true,
    })

    // Create Customer
    const customer = await User.create({
      name: 'John Customer',
      email: 'customer@email.com',
      password: hashedPassword,
      role: 'customer',
      phone: '+1 234 567 8903',
      address: '321 Customer Road, City, State 12345',
      isActive: true,
    })

    console.log('Created demo users')
    console.log('\n=== Demo Accounts Created ===')
    console.log('Super Admin: super@admin.com / password123')
    console.log('Restaurant Owner: owner@restaurant.com / password123')
    console.log('Staff: staff@restaurant.com / password123')
    console.log('Customer: customer@email.com / password123')
    console.log('\n=== Subscription Plans Created ===')
    console.log('1. Basic - $29/month')
    console.log('2. Professional - $79/month (Most Popular)')
    console.log('3. Premium - $149/month')
    console.log('\nDatabase seeded successfully!')

    process.exit(0)
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seed()