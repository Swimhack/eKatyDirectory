'use client'

import { useState, useEffect } from 'react'
import { Restaurant } from '@/lib/supabase/database.types'
import { photoService, PhotoUploadResult } from '@/lib/services/photo-service'
import Image from 'next/image'

interface PhotoManagerProps {
  restaurant: Restaurant
  onPhotosUpdated?: (photos: string[]) => void
}

export function PhotoManager({ restaurant, onPhotosUpdated }: PhotoManagerProps) {
  const [photos, setPhotos] = useState<string[]>(restaurant.photos || [])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    setUploading(true)
    const uploadPromises: Promise<PhotoUploadResult>[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        uploadPromises.push(photoService.uploadPhoto(file, restaurant.id))
      }
    }
    
    try {
      const results = await Promise.all(uploadPromises)
      const successfulUploads = results
        .filter(result => result.success && result.url)
        .map(result => result.url!)
      
      const updatedPhotos = [...photos, ...successfulUploads]
      setPhotos(updatedPhotos)
      onPhotosUpdated?.(updatedPhotos)
      
      // Update restaurant in database
      await updateRestaurantPhotos(updatedPhotos)
      
    } catch (error) {
      console.error('Error uploading photos:', error)
    } finally {
      setUploading(false)
    }
  }

  const updateRestaurantPhotos = async (newPhotos: string[]) => {
    try {
      await fetch(`/api/restaurants/${restaurant.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photos: newPhotos })
      })
    } catch (error) {
      console.error('Error updating restaurant photos:', error)
    }
  }

  const handleRemovePhoto = async (photoUrl: string, index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index)
    setPhotos(updatedPhotos)
    onPhotosUpdated?.(updatedPhotos)
    await updateRestaurantPhotos(updatedPhotos)
  }

  const handleReorderPhoto = async (fromIndex: number, toIndex: number) => {
    const reorderedPhotos = [...photos]
    const [movedItem] = reorderedPhotos.splice(fromIndex, 1)
    reorderedPhotos.splice(toIndex, 0, movedItem)
    
    setPhotos(reorderedPhotos)
    onPhotosUpdated?.(reorderedPhotos)
    await updateRestaurantPhotos(reorderedPhotos)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Photo Management</h3>
        <span className="text-sm text-gray-600">{photos.length} photos</span>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-brand-400 bg-brand-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600">Uploading photos...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📷</div>
            <p className="text-gray-600">
              Drag and drop photos here, or click to select files
            </p>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG, WebP formats
            </p>
          </div>
        )}
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={photo}
                  alt={`${restaurant.name} photo ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                
                {/* Primary Photo Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-brand-500 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}
                
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  {index > 0 && (
                    <button
                      onClick={() => handleReorderPhoto(index, 0)}
                      className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100"
                      title="Make Primary"
                    >
                      ⭐
                    </button>
                  )}
                  {index > 0 && (
                    <button
                      onClick={() => handleReorderPhoto(index, index - 1)}
                      className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100"
                      title="Move Left"
                    >
                      ←
                    </button>
                  )}
                  {index < photos.length - 1 && (
                    <button
                      onClick={() => handleReorderPhoto(index, index + 1)}
                      className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100"
                      title="Move Right"
                    >
                      →
                    </button>
                  )}
                  <button
                    onClick={() => handleRemovePhoto(photo, index)}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    title="Remove Photo"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-600 space-y-1">
        <p>• The first photo will be used as the primary photo displayed in listings</p>
        <p>• Drag and drop to reorder photos or use the arrow buttons</p>
        <p>• Recommended image size: 800x600px or higher</p>
        <p>• Maximum file size: 5MB per image</p>
      </div>
    </div>
  )
}