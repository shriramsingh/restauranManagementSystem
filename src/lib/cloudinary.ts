/**
 * Cloudinary image upload helper.
 * 
 * To use in production:
 * 1. Create a Cloudinary account (cloudinary.com)
 * 2. Set environment variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 * 3. Create an unsigned upload preset in Cloudinary dashboard
 * 4. Update UPLOAD_PRESET below with your preset name
 * 
 * For demo/development, this falls back to Base64 data URLs.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'restaurant_images'

export async function uploadImageToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME) {
    // Fallback: return a local object URL for demo
    return URL.createObjectURL(file)
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error?.message || 'Upload failed')
  }

  const data = await res.json()
  return data.secure_url
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET)
}
