import mongoose, { Document, Schema } from 'mongoose'

export interface ISetting extends Document {
  restaurantId: mongoose.Types.ObjectId
  currency: string
  taxRate: number
}

const SettingSchema = new Schema<ISetting>({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    unique: true,
  },
  currency: {
    type: String,
    required: true,
    default: '$',
  },
  taxRate: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  timestamps: true,
})

export default mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema)
