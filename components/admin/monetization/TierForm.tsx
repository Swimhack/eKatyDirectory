'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface TierFormProps {
  onSubmit: (data: TierFormData) => Promise<void>
  initialData?: TierFormData
  loading?: boolean
  onCancel?: () => void
  existingSlugs?: string[]
}

export interface TierFormData {
  name: string
  slug: string
  monthly_price: number
  features: string[]
  display_order?: number
  is_active?: boolean
}

export default function TierForm({
  onSubmit,
  initialData,
  loading = false,
  onCancel,
  existingSlugs = [],
}: TierFormProps) {
  const [formData, setFormData] = useState<TierFormData>(
    initialData || {
      name: '',
      slug: '',
      monthly_price: 0,
      features: [],
      display_order: 0,
      is_active: true,
    }
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newFeature, setNewFeature] = useState('')

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens'
    } else if (
      existingSlugs.includes(formData.slug) &&
      (!initialData || initialData.slug !== formData.slug)
    ) {
      newErrors.slug = 'This slug is already in use'
    }

    if (formData.monthly_price <= 0) {
      newErrors.monthly_price = 'Monthly price must be greater than 0'
    }

    if (!Array.isArray(formData.features) || formData.features.length === 0) {
      newErrors.features = 'At least one feature is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    const parsedValue =
      name === 'monthly_price' ? parseFloat(value) || 0 : value
    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }))
      setNewFeature('')
      if (errors.features) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.features
          return newErrors
        })
      }
    }
  }

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (err) {
      // Error handling is done in parent component
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-900">
          Tier Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="e.g., Featured, Premium"
          className={`mt-1 block w-full rounded-md border ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          } px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Slug Field */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-900">
          Slug
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleInputChange}
          placeholder="e.g., featured, premium"
          className={`mt-1 block w-full rounded-md border ${
            errors.slug ? 'border-red-500' : 'border-gray-300'
          } px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
        />
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          URL-friendly identifier (lowercase, hyphens only)
        </p>
      </div>

      {/* Monthly Price Field */}
      <div>
        <label
          htmlFor="monthly_price"
          className="block text-sm font-medium text-gray-900"
        >
          Monthly Price ($)
        </label>
        <input
          type="number"
          id="monthly_price"
          name="monthly_price"
          value={formData.monthly_price}
          onChange={handleInputChange}
          placeholder="0.00"
          step="0.01"
          min="0"
          className={`mt-1 block w-full rounded-md border ${
            errors.monthly_price ? 'border-red-500' : 'border-gray-300'
          } px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
        />
        {errors.monthly_price && (
          <p className="mt-1 text-sm text-red-600">{errors.monthly_price}</p>
        )}
      </div>

      {/* Features Section */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Features
        </label>

        {/* Feature Input */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddFeature()
              }
            }}
            placeholder="Add a feature"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleAddFeature}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add
          </button>
        </div>

        {/* Features List */}
        {formData.features.length > 0 && (
          <div className="space-y-2 mb-3">
            {formData.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
              >
                <span className="text-sm text-gray-900">{feature}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(index)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {errors.features && (
          <p className="text-sm text-red-600">{errors.features}</p>
        )}
      </div>

      {/* Display Order Field */}
      <div>
        <label
          htmlFor="display_order"
          className="block text-sm font-medium text-gray-900"
        >
          Display Order
        </label>
        <input
          type="number"
          id="display_order"
          name="display_order"
          value={formData.display_order || 0}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              display_order: parseInt(e.target.value) || 0,
            }))
          }
          min="0"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Lower numbers appear first
        </p>
      </div>

      {/* Active Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active ?? true}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              is_active: e.target.checked,
            }))
          }
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="is_active" className="ml-2 text-sm text-gray-900">
          Active tier (visible to users)
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Tier'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-900 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
