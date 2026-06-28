import mongoose, { Document, Schema } from 'mongoose'

export interface ISubscription extends Document {
  name: string
  description: string
  price: number
  billingPeriod: 'monthly' | 'yearly'
  features: {
    maxRestaurants: number
    maxStaffPerRestaurant: number
    maxOrdersPerMonth: number
    storageGB: number
    features: string[]
  }
  isActive: boolean
  isPopular?: boolean
  createdAt: Date
  updatedAt: Date
}

const SubscriptionSchema = new Schema<ISubscription>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  billingPeriod: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true,
  },
  features: {
    maxRestaurants: {
      type: Number,
      required: true,
    },
    maxStaffPerRestaurant: {
      type: Number,
      required: true,
    },
    maxOrdersPerMonth: {
      type: Number,
      required: true,
    },
    storageGB: {
      type: Number,
      required: true,
    },
    features: [{
      type: String,
    }],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
})

SubscriptionSchema.index({ isActive: 1 })

export default mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema)