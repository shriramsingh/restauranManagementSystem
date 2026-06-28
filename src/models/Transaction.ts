import mongoose, { Document, Schema } from 'mongoose'

export interface ITransaction extends Document {
  restaurantId: mongoose.Types.ObjectId
  orderId: mongoose.Types.ObjectId
  transactionId: string
  type: 'payment' | 'refund' | 'subscription' | 'refund_subscription'
  amount: number
  currency: string
  paymentMethod: 'cash' | 'card' | 'online' | 'wallet'
  paymentStatus: 'success' | 'failed' | 'pending' | 'refunded'
  gatewayResponse?: {
    gateway: string
    transactionId: string
    status: string
    message?: string
  }
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema = new Schema<ITransaction>({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['payment', 'refund', 'subscription', 'refund_subscription'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'wallet'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['success', 'failed', 'pending', 'refunded'],
    required: true,
    default: 'pending',
  },
  gatewayResponse: {
    gateway: { type: String },
    transactionId: { type: String },
    status: { type: String },
    message: { type: String },
  },
}, {
  timestamps: true,
})

TransactionSchema.index({ restaurantId: 1, createdAt: -1 })
TransactionSchema.index({ transactionId: 1 }, { unique: true })
TransactionSchema.index({ paymentStatus: 1 })

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema)