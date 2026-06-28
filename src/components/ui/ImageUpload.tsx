import { useState, useRef } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { uploadImageToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
}

export default function ImageUpload({ value, onChange, label = 'Image' }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Local preview immediately
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setError('')
    setUploading(true)

    try {
      const url = await uploadImageToCloudinary(file)
      onChange(url)
      setPreview(url)
    } catch (err: any) {
      setError(err.message || 'Upload failed')
      // Keep local preview as fallback
      onChange(localUrl)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

      {preview ? (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-300">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
          >
            <X size={16} />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white text-sm">Uploading...</span>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <ImageIcon className="text-gray-400 mb-2" size={32} />
          <span className="text-sm text-gray-600">
            {isCloudinaryConfigured() ? 'Click to upload image' : 'Click to select image (demo mode)'}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  )
}
