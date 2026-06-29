import mongoose, { Document, Schema } from 'mongoose'
import slugify from 'slugify'

export interface IMenuItem extends Document {
  restaurantId: mongoose.Types.ObjectId
  categoryId: mongoose.Types.ObjectId
  name: string
  slug: string
  description?: string
  price: number
  images?: string[]
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  spiceLevel?: 'mild' | 'medium' | 'hot' | 'extra_hot'
  ingredients?: string[]
  allergens?: string[]
  nutritionalInfo?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
  }
  isAvailable: boolean
  isFeatured: boolean
  preparationTime?: number
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

const MenuItemSchema = new Schema<IMenuItem>({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'MenuCategory',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  images: [{
    type: String,
  }],
  isVegetarian: {
    type: Boolean,
    default: false,
  },
  isVegan: {
    type: Boolean,
    default: false,
  },
  isGlutenFree: {
    type: Boolean,
    default: false,
  },
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'hot', 'extra_hot'],
  },
  ingredients: [{
    type: String,
    trim: true,
  }],
  allergens: [{
    type: String,
    trim: true,
  }],
  nutritionalInfo: {
    calories: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fat: { type: Number },
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  preparationTime: {
    type: Number,
    min: 0,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
})

MenuItemSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true })
  }
  next()
})

MenuItemSchema.index({ restaurantId: 1, slug: 1 }, { unique: true })
MenuItemSchema.index({ restaurantId: 1, categoryId: 1, sortOrder: 1 })
MenuItemSchema.index({ isAvailable: 1 })
MenuItemSchema.index({ isFeatured: 1 })

export default mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema)