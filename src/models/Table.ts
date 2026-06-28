import mongoose, { Document, Schema } from 'mongoose'

export interface ITable extends Document {
  restaurantId: mongoose.Types.ObjectId
  tableNumber: string
  capacity: number
  status: 'available' | 'occupied' | 'reserved' | 'cleaning'
  currentOrderId?: mongoose.Types.ObjectId
  qrCode?: string
  location?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const TableSchema = new Schema<ITable>({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  tableNumber: {
    type: String,
    required: true,
    trim: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'cleaning'],
    default: 'available',
  },
  currentOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
  },
  qrCode: {
    type: String,
  },
  location: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

TableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true })
TableSchema.index({ status: 1 })

export default mongoose.models.Table || mongoose.model<ITable>('Table', TableSchema)