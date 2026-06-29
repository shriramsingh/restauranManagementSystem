import mongoose, { Document, Schema } from 'mongoose'
import slugify from 'slugify'

export interface IMenuCategory extends Document {
  restaurantId: mongoose.Types.ObjectId
  name: string
  slug: string
  description?: string
  image?: string
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

const MenuCategorySchema = new Schema<IMenuCategory>({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
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
  image: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
})

MenuCategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true })
  }
  next()
})

MenuCategorySchema.index({ restaurantId: 1, slug: 1 }, { unique: true })
MenuCategorySchema.index({ restaurantId: 1, sortOrder: 1 })

export default mongoose.models.MenuCategory || mongoose.model<IMenuCategory>('MenuCategory', MenuCategorySchema)