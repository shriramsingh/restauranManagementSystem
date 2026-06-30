import mongoose, { Document, Schema } from 'mongoose'
import slugify from 'slugify'

export interface IRestaurant extends Document {
  name: string
  slug: string
  ownerId: mongoose.Types.ObjectId
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  description?: string
  logo?: string
  coverImage?: string
  cuisine: string[]
  openingHours: {
    [key: string]: {
      open: string
      close: string
      isClosed: boolean
    }
  }
  subscriptionId: mongoose.Types.ObjectId
  subscriptionStatus: 'active' | 'expired' | 'cancelled' | 'trial'
  subscriptionStartDate: Date
  subscriptionEndDate: Date
  isActive: boolean
  settings: {
    currency: string
    taxRate: number
    allowOnlineOrders: boolean
    allowTableReservation: boolean
    autoAcceptOrders: boolean
  }
  createdAt: Date
  updatedAt: Date
}

const RestaurantSchema = new Schema<IRestaurant>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  description: {
    type: String,
    trim: true,
  },
  logo: {
    type: String,
  },
  coverImage: {
    type: String,
  },
  cuisine: [{
    type: String,
    trim: true,
  }],
  openingHours: {
    type: Map,
    of: {
      open: { type: String },
      close: { type: String },
      isClosed: { type: Boolean, default: false },
    },
  },
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true,
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'trial'],
    default: 'trial',
  },
  subscriptionStartDate: {
    type: Date,
    required: true,
  },
  subscriptionEndDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  settings: {
    currency: { type: String, default: '₹' },
    taxRate: { type: Number, default: 0 },
    allowOnlineOrders: { type: Boolean, default: true },
    allowTableReservation: { type: Boolean, default: true },
    autoAcceptOrders: { type: Boolean, default: false },
  },
}, {
  timestamps: true,
})

RestaurantSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true })
  }
  next()
})


RestaurantSchema.index({ ownerId: 1 })
RestaurantSchema.index({ subscriptionId: 1 })
RestaurantSchema.index({ isActive: 1 })

export default mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', RestaurantSchema)