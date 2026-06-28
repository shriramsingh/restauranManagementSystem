import mongoose, { Document, Schema } from 'mongoose'

export interface IStaff extends Document {
  userId: mongoose.Types.ObjectId
  restaurantId: mongoose.Types.ObjectId
  employeeId: string
  position: string
  department: 'kitchen' | 'service' | 'management' | 'delivery'
  salary?: number
  hireDate: Date
  isActive: boolean
  permissions: {
    canManageMenu: boolean
    canManageOrders: boolean
    canManageStaff: boolean
    canViewReports: boolean
    canProcessPayments: boolean
  }
  createdAt: Date
  updatedAt: Date
}

const StaffSchema = new Schema<IStaff>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    enum: ['kitchen', 'service', 'management', 'delivery'],
    required: true,
  },
  salary: {
    type: Number,
    min: 0,
  },
  hireDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  permissions: {
    canManageMenu: {
      type: Boolean,
      default: false,
    },
    canManageOrders: {
      type: Boolean,
      default: true,
    },
    canManageStaff: {
      type: Boolean,
      default: false,
    },
    canViewReports: {
      type: Boolean,
      default: false,
    },
    canProcessPayments: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true,
})

StaffSchema.index({ restaurantId: 1, userId: 1 }, { unique: true })
StaffSchema.index({ employeeId: 1 }, { unique: true })
StaffSchema.index({ department: 1 })

export default mongoose.models.Staff || mongoose.model<IStaff>('Staff', StaffSchema)