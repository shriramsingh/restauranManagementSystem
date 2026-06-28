import mongoose, { Document, Schema } from 'mongoose'

export interface IOrder extends Document {
  restaurantId: mongoose.Types.ObjectId
  orderNumber: string
  customerId?: mongoose.Types.ObjectId
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  tableId?: mongoose.Types.ObjectId
  orderType: 'dine_in' | 'takeaway' | 'delivery'
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled'
  items: {
    menuItemId: mongoose.Types.ObjectId
    name: string
    quantity: number
    price: number
    total: number
    specialInstructions?: string
  }[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed'
  paymentMethod?: 'cash' | 'card' | 'online' | 'wallet'
  paymentId?: string
  notes?: string
  preparedBy?: mongoose.Types.ObjectId
  servedBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  customerName: {
    type: String,
    trim: true,
  },
  customerPhone: {
    type: String,
    trim: true,
  },
  customerEmail: {
    type: String,
    lowercase: true,
    trim: true,
  },
  tableId: {
    type: Schema.Types.ObjectId,
    ref: 'Table',
  },
  orderType: {
    type: String,
    enum: ['dine_in', 'takeaway', 'delivery'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
    default: 'pending',
  },
  items: [{
    menuItemId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    specialInstructions: {
      type: String,
      trim: true,
    },
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'wallet'],
  },
  paymentId: {
    type: String,
  },
  notes: {
    type: String,
    trim: true,
  },
  preparedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  servedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
})

OrderSchema.index({ restaurantId: 1, createdAt: -1 })
OrderSchema.index({ orderNumber: 1 }, { unique: true })
OrderSchema.index({ status: 1 })
OrderSchema.index({ customerId: 1 })

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)