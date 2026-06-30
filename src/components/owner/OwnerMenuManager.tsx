'use client'

import { useState } from 'react'
import { UtensilsCrossed, Plus, Edit, Trash2, X } from 'lucide-react'
import ImageUpload from '@/components/ui/ImageUpload'

interface Category {
  _id: string
  name: string
  description?: string
}

interface MenuItem {
  _id: string
  categoryId: string
  name: string
  description?: string
  price: number
  images?: string[]
  isVegetarian: boolean
  isAvailable: boolean
  preparationTime?: number
}

export default function OwnerMenuManager({
  initialCategories,
  initialItems,
  currency,
}: {
  initialCategories: Category[]
  initialItems: MenuItem[]
  currency: string
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [items, setItems] = useState<MenuItem[]>(initialItems)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modal states
  const [categoryModal, setCategoryModal] = useState(false)
  const [itemModal, setItemModal] = useState(false)
  const [editItemModal, setEditItemModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' })
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    isVegetarian: false,
    isAvailable: true,
    preparationTime: '',
  })

  const showSuccess = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/menu-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create category')
      } else {
        setCategories((prev) => [...prev, data])
        setCategoryForm({ name: '', description: '' })
        setCategoryModal(false)
        showSuccess('Category created successfully')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategoryId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...itemForm,
          categoryId: selectedCategoryId,
          price: parseFloat(itemForm.price),
          images: itemForm.image ? [itemForm.image] : [],
          preparationTime: itemForm.preparationTime ? parseInt(itemForm.preparationTime) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create item')
      } else {
        setItems((prev) => [...prev, data])
        setItemForm({ name: '', description: '', price: '', image: '', isVegetarian: false, isAvailable: true, preparationTime: '' })
        setItemModal(false)
        showSuccess('Item created successfully')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/menu-items/${editingItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...itemForm,
          price: parseFloat(itemForm.price),
          images: itemForm.image ? [itemForm.image] : undefined,
          preparationTime: itemForm.preparationTime ? parseInt(itemForm.preparationTime) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to update item')
      } else {
        setItems((prev) => prev.map((i) => (i._id === editingItem._id ? data : i)))
        setEditItemModal(false)
        setEditingItem(null)
        showSuccess('Item updated successfully')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async () => {
    if (!deleteConfirm) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/menu-items/${deleteConfirm}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to delete item')
      } else {
        setItems((prev) => prev.filter((i) => i._id !== deleteConfirm))
        setDeleteConfirm(null)
        showSuccess('Item deleted successfully')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const openEditItem = (item: MenuItem) => {
    setEditingItem(item)
    setItemForm({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      image: item.images?.[0] || '',
      isVegetarian: item.isVegetarian,
      isAvailable: item.isAvailable,
      preparationTime: item.preparationTime?.toString() || '',
    })
    setEditItemModal(true)
  }

  const openAddItem = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setItemForm({ name: '', description: '', price: '', image: '', isVegetarian: false, isAvailable: true, preparationTime: '' })
    setItemModal(true)
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant menu</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCategoryModal(true)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Category
          </button>
        </div>
      </div>

      {/* Categories and Items */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <UtensilsCrossed className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No menu categories yet</h3>
          <p className="text-gray-600 mb-4">Create your first category to start building your menu.</p>
          <button
            onClick={() => setCategoryModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Category
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryItems = items.filter((item) => item.categoryId === category._id)

            return (
              <div key={category._id} className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => openAddItem(category._id)}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Plus size={16} />
                      Add Item
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {categoryItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No items in this category</p>
                  ) : (
                    <div className="space-y-3">
                      {categoryItems.map((item) => (
                        <div key={item._id} className="flex justify-between items-start p-3 border border-gray-200 rounded-lg">
                          <div className="flex gap-4 flex-1">
                            {item.images && item.images.length > 0 ? (
                              <img src={item.images[0]} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                                <UtensilsCrossed className="text-gray-400" size={20} />
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-600">{item.description}</p>
                              <div className="flex gap-2 mt-2">
                                {item.isVegetarian && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Vegetarian</span>
                                )}
                                {item.isAvailable ? (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Available</span>
                                ) : (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Unavailable</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <p className="text-lg font-bold text-gray-900">{currency}{item.price.toFixed(2)}</p>
                            <button
                              onClick={() => openEditItem(item)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(item._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Category Modal */}
      {categoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Category</h3>
              <button onClick={() => setCategoryModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {(itemModal || editItemModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editItemModal ? 'Edit Item' : 'Add Item'}
              </h3>
              <button onClick={() => { editItemModal ? setEditItemModal(false) : setItemModal(false) }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={editItemModal ? handleUpdateItem : handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.preparationTime}
                    onChange={(e) => setItemForm({ ...itemForm, preparationTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <ImageUpload
                value={itemForm.image}
                onChange={(url) => setItemForm({ ...itemForm, image: url })}
                label="Item Image"
              />
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={itemForm.isVegetarian}
                    onChange={(e) => setItemForm({ ...itemForm, isVegetarian: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Vegetarian</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={itemForm.isAvailable}
                    onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Available</span>
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : editItemModal ? 'Update Item' : 'Create Item'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Item?</h3>
            <p className="text-gray-600 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
