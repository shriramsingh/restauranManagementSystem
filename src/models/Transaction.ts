import { Schema, model, models, Document } from 'mongoose'

export interface ITransaction extends Document {
  restaurantId: Schema.Types.ObjectId
  orderId: Schema.Types.ObjectId
  amount: number
  type: 'sale' | 'refund'
  paymentMethod: string
  transactionId: string
  status: 'completed' | 'pending' | 'failed'
}

const TransactionSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['sale', 'refund'], required: true },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed'],
      required: true,
    },
  },
  { timestamps: true },
)

const Transaction =
  models.Transaction || model<ITransaction>('Transaction', TransactionSchema)

export default Transaction
