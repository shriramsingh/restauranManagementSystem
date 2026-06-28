import { z } from 'zod'

// ───────────────────────────────────────────────
// Address subschema
// ───────────────────────────────────────────────
export const AddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
})

// ───────────────────────────────────────────────
// Restaurant schemas
// ───────────────────────────────────────────────
export const CreateRestaurantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone is required'),
  address: AddressSchema,
  description: z.string().optional(),
  cuisine: z.union([z.string(), z.array(z.string())]).optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  openingHours: z
    .record(
      z.object({
        open: z.string().optional(),
        close: z.string().optional(),
        isClosed: z.boolean().optional(),
      })
    )
    .optional(),
  ownerId: z.string().optional(),
  subscriptionId: z.string().optional(),
  subscriptionStatus: z
    .enum(['active', 'expired', 'cancelled', 'trial'])
    .optional(),
  subscriptionStartDate: z.string().optional(),
  subscriptionEndDate: z.string().optional(),
  isActive: z.boolean().optional(),
  settings: z
    .object({
      currency: z.string().optional(),
      taxRate: z.number().optional(),
      allowOnlineOrders: z.boolean().optional(),
      allowTableReservation: z.boolean().optional(),
      autoAcceptOrders: z.boolean().optional(),
    })
    .optional(),
})

export const UpdateRestaurantSchema = CreateRestaurantSchema.partial()

// ───────────────────────────────────────────────
// Password subschema (reusable for signup and user creation)
// ───────────────────────────────────────────────
export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

// ───────────────────────────────────────────────
// Signup schema
// ───────────────────────────────────────────────
export const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: PasswordSchema,
  role: z.enum([
    'super_admin',
    'restaurant_owner',
    'staff',
    'customer',
  ]),
  phone: z.string().optional(),
  address: z.string().optional(),
})

// ───────────────────────────────────────────────
// Menu Category schemas
// ───────────────────────────────────────────────
export const CreateMenuCategorySchema = z.object({
  restaurantId: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
})

export const UpdateMenuCategorySchema = CreateMenuCategorySchema.partial()

// ───────────────────────────────────────────────
// Menu Item schemas
// ───────────────────────────────────────────────
export const CreateMenuItemSchema = z.object({
  restaurantId: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be at least 0'),
  images: z.array(z.string()).optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  spiceLevel: z.enum(['mild', 'medium', 'hot', 'extra_hot']).optional(),
  ingredients: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  nutritionalInfo: z
    .object({
      calories: z.number().optional(),
      protein: z.number().optional(),
      carbs: z.number().optional(),
      fat: z.number().optional(),
    })
    .optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  preparationTime: z.number().min(0).optional(),
  sortOrder: z.number().optional(),
})

export const UpdateMenuItemSchema = CreateMenuItemSchema.partial()

// ───────────────────────────────────────────────
// Order schemas
// ───────────────────────────────────────────────
export const OrderItemSchema = z.object({
  menuItemId: z.string().min(1, 'Menu item is required'),
  name: z.string().min(1, 'Name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price must be at least 0'),
  total: z.number().min(0, 'Total must be at least 0'),
  specialInstructions: z.string().optional(),
})

export const CreateOrderSchema = z.object({
  restaurantId: z.string().optional(),
  tableId: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().optional(),
  orderType: z.enum(['dine_in', 'takeaway', 'delivery']),
  status: z
    .enum([
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'served',
      'completed',
      'cancelled',
    ])
    .optional(),
  items: z.array(OrderItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number().min(0),
  tax: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  total: z.number().min(0),
  notes: z.string().optional(),
})

export const UpdateOrderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'served',
    'completed',
    'cancelled',
  ]),
  preparedBy: z.string().optional(),
  servedBy: z.string().optional(),
})

export const UpdateOrderSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'served',
    'completed',
    'cancelled',
  ]).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'refunded', 'failed']).optional(),
  paymentMethod: z.enum(['cash', 'card', 'online', 'wallet']).optional(),
  notes: z.string().optional(),
  preparedBy: z.string().optional(),
  servedBy: z.string().optional(),
})

// ───────────────────────────────────────────────
// Table schemas
// ───────────────────────────────────────────────
export const CreateTableSchema = z.object({
  restaurantId: z.string().optional(),
  tableNumber: z.string().min(1, 'Table number is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  status: z
    .enum(['available', 'occupied', 'reserved', 'cleaning'])
    .optional(),
  location: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const UpdateTableSchema = CreateTableSchema.partial()

// ───────────────────────────────────────────────
// Staff schemas
// ───────────────────────────────────────────────
export const CreateStaffSchema = z.object({
  userId: z.string().optional(),
  restaurantId: z.string().optional(),
  employeeId: z.string().optional(),
  position: z.string().min(1, 'Position is required'),
  department: z.enum(['kitchen', 'service', 'management', 'delivery']),
  salary: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  permissions: z
    .object({
      canManageMenu: z.boolean().optional(),
      canManageOrders: z.boolean().optional(),
      canManageStaff: z.boolean().optional(),
      canViewReports: z.boolean().optional(),
      canProcessPayments: z.boolean().optional(),
    })
    .optional(),
})

export const UpdateStaffSchema = CreateStaffSchema.partial()

// ───────────────────────────────────────────────
// User schemas
// ───────────────────────────────────────────────
export const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: PasswordSchema,
  role: z.enum(['super_admin', 'restaurant_owner', 'staff', 'customer']),
  phone: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const UpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['super_admin', 'restaurant_owner', 'staff', 'customer']).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
})

// ───────────────────────────────────────────────
// Type exports
// ───────────────────────────────────────────────
export type CreateRestaurantInput = z.infer<typeof CreateRestaurantSchema>
export type UpdateRestaurantInput = z.infer<typeof UpdateRestaurantSchema>
export type SignupInput = z.infer<typeof SignupSchema>
export type CreateMenuCategoryInput = z.infer<typeof CreateMenuCategorySchema>
export type CreateMenuItemInput = z.infer<typeof CreateMenuItemSchema>
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
export type CreateTableInput = z.infer<typeof CreateTableSchema>
export type CreateStaffInput = z.infer<typeof CreateStaffSchema>
export type CreateUserInput = z.infer<typeof CreateUserSchema>
