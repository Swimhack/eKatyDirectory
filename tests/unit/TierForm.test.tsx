import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TierForm, { TierFormData } from '@/components/admin/monetization/TierForm'

describe('TierForm Component', () => {
  let mockOnSubmit: any
  let mockOnCancel: any

  beforeEach(() => {
    mockOnSubmit = vi.fn()
    mockOnCancel = vi.fn()
  })

  const renderForm = (props = {}) => {
    return render(
      <TierForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        {...props}
      />
    )
  }

  describe('Rendering', () => {
    it('should render all form fields', () => {
      renderForm()

      expect(screen.getByLabelText('Tier Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Slug')).toBeInTheDocument()
      expect(screen.getByLabelText(/Monthly Price/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Display Order/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Active tier/)).toBeInTheDocument()
    })

    it('should render form buttons', () => {
      renderForm()

      expect(screen.getByRole('button', { name: /Save Tier/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
    })

    it('should render feature input section', () => {
      renderForm()

      expect(screen.getByPlaceholderText('Add a feature')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Add/i })).toBeInTheDocument()
    })

    it('should populate form with initial data', () => {
      const initialData: TierFormData = {
        name: 'Featured',
        slug: 'featured',
        monthly_price: 299.99,
        features: ['Premium listing', 'Analytics'],
        display_order: 1,
        is_active: true,
      }

      renderForm({ initialData })

      expect(screen.getByDisplayValue('Featured')).toBeInTheDocument()
      expect(screen.getByDisplayValue('featured')).toBeInTheDocument()
      expect(screen.getByDisplayValue('299.99')).toBeInTheDocument()
      expect(screen.getByDisplayValue('1')).toBeInTheDocument()
      expect(screen.getByText('Premium listing')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
    })
  })

  describe('Monthly Price Validation', () => {
    it('should not allow zero monthly price', async () => {
      const user = userEvent.setup()
      renderForm()

      const nameInput = screen.getByLabelText('Tier Name')
      const slugInput = screen.getByLabelText('Slug')
      const priceInput = screen.getByLabelText(/Monthly Price/)
      const addFeatureInput = screen.getByPlaceholderText('Add a feature')

      await user.type(nameInput, 'Test')
      await user.type(slugInput, 'test')
      await user.type(priceInput, '0')
      await user.type(addFeatureInput, 'Feature 1')
      await user.click(screen.getByRole('button', { name: /Add/i }))

      const submitButton = screen.getByRole('button', { name: /Save Tier/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Monthly price must be greater than 0')).toBeInTheDocument()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })


    it('should allow positive monthly price', async () => {
      const user = userEvent.setup()
      renderForm()

      const nameInput = screen.getByLabelText('Tier Name')
      const slugInput = screen.getByLabelText('Slug')
      const priceInput = screen.getByLabelText(/Monthly Price/)
      const addFeatureInput = screen.getByPlaceholderText('Add a feature')

      await user.type(nameInput, 'Test')
      await user.type(slugInput, 'test')
      await user.type(priceInput, '299.99')
      await user.type(addFeatureInput, 'Feature 1')
      await user.click(screen.getByRole('button', { name: /Add/i }))

      mockOnSubmit.mockResolvedValueOnce(undefined)

      const submitButton = screen.getByRole('button', { name: /Save Tier/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    })

    it('should allow decimal prices', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn().mockResolvedValueOnce(undefined)
      renderForm({ onSubmit: mockSubmit })

      const nameInput = screen.getByLabelText('Tier Name')
      const slugInput = screen.getByLabelText('Slug')
      const priceInput = screen.getByLabelText(/Monthly Price/)
      const addFeatureInput = screen.getByPlaceholderText('Add a feature')

      await user.type(nameInput, 'Premium')
      await user.type(slugInput, 'premium')
      await user.type(priceInput, '99.99')
      await user.type(addFeatureInput, 'Feature')
      await user.click(screen.getByRole('button', { name: /Add/i }))

      const submitButton = screen.getByRole('button', { name: /Save Tier/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ monthly_price: 99.99 })
        )
      })
    })
  })

  describe('Slug Validation', () => {
    it('should validate slug format', async () => {
      const user = userEvent.setup()
      renderForm()

      const nameInput = screen.getByLabelText('Tier Name')
      const slugInput = screen.getByLabelText('Slug')
      const priceInput = screen.getByLabelText(/Monthly Price/)
      const addFeatureInput = screen.getByPlaceholderText('Add a feature')

      await user.type(nameInput, 'Test')
      await user.type(slugInput, 'Invalid Slug!') // Invalid characters
      await user.type(priceInput, '99.99')
      await user.type(addFeatureInput, 'Feature')
      await user.click(screen.getByRole('button', { name: /Add/i }))

      const submitButton = screen.getByRole('button', { name: /Save Tier/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/Slug must contain only lowercase letters, numbers, and hyphens/)
        ).toBeInTheDocument()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should not allow duplicate slugs', async () => {
      const user = userEvent.setup()
      const existingSlugs = ['featured', 'basic']
      renderForm({ existingSlugs })

      const nameInput = screen.getByLabelText('Tier Name')
      const slugInput = screen.getByLabelText('Slug')
      const priceInput = screen.getByLabelText(/Monthly Price/)
      const addFeatureInput = screen.getByPlaceholderText('Add a feature')

      await user.type(nameInput, 'Test')
      await user.type(slugInput, 'featured') // Already exists
      await user.type(priceInput, '99.99')
      await user.type(addFeatureInput, 'Feature')
      await user.click(screen.getByRole('button', { name: /Add/i }))

      const submitButton = screen.getByRole('button', { name: /Save Tier/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('This slug is already in use')).toBeInTheDocument()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should allow existing slug when editing', async () => {
      const user = userEvent.setup()
      const initialData: TierFormData = {
        name: 'Featured',
        slug: 'featured',
        monthly_price: 299.99,
        features: ['Premium'],
        display_order: 1,
        is_active: true,
      }
      const existingSlugs = ['featured', 'basic']
      const mockSubmit = vi.fn().mockResolvedValueOnce(undefined)

      renderForm({ initialData, existingSlugs, onSubmit: mockSubmit })

      mockSubmit.mockResolvedValueOnce(undefined)

      const submitButton = screen.getByRole('button', { name: /Save Tier/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled()
      })
    })

    it('should allow valid slugs with hyphens and numbers', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn().mockResolvedValueOnce(undefined)
      renderForm({ onSubmit: mockSubmit })

      const nameInput = screen.getByLabelText('Tier Name')
      const slugInput = screen.getByLabelText('Slug')
      const priceInput = screen.getByLabelText(/Monthly Price/)
      const addFeatureInput = screen.getByPlaceholderText('Add a feature')

      await user.type(nameInput, 'Premium Plus')
      await user.type(slugInput, 'premium-plus-2')
      await user.type(priceInput, '399.99')
      await user.type(addFeatureInput, 'Feature')
      await user.click(screen.getByRole('button', { name: /Add/i }))

      const submitButton = screen.getByRole('button', { name: /Save Tier/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ slug: 'premium-plus-2' })
        )
      })
    })
  })

  describe('Features Array Validation', () => {
    it('should require at least one feature', async () => {
      const user = userEvent.setup()
      renderForm()

      const nameInput = screen.getByLabelText('Tier Name')
      const slugInput = screen.getByLabelText('Slug')
      const priceInput = screen.getByLabelText(/Monthly Price/)

      await user.type(nameInput, 'Test')
      await user.type(slugInput, 'test')
      await user.type(priceInput, '99.99')
      // Don't add any features

      const submitButton = screen.getByRole('button', { name: /Save Tier/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('At least one feature is required')).toBeInTheDocument()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should add features to the list', async () => {
      const user = userEvent.setup()
      renderForm()

      const featureInput = screen.getByPlaceholderText('Add a feature')
      const addButton = screen.getByRole('button', { name: /Add/i })

      await user.type(featureInput, 'Premium Listing')
      await user.click(addButton)

      expect(screen.getByText('Premium Listing')).toBeInTheDocument()

      await user.type(featureInput, 'Analytics')
      await user.click(addButton)

      expect(screen.getByText('Analytics')).toBeInTheDocument()
    })

    it('should add feature with Enter key', async () => {
      const user = userEvent.setup()
      renderForm()

      const featureInput = screen.getByPlaceholderText('Add a feature')

      await user.type(featureInput, 'Feature 1')
      await user.keyboard('{Enter}')

      expect(screen.getByText('Feature 1')).toBeInTheDocument()
    })

    it('should remove features from the list', async () => {
      const user = userEvent.setup()
      renderForm()

      const featureInput = screen.getByPlaceholderText('Add a feature')
      const addButton = screen.getByRole('button', { name: /Add/i })

      await user.type(featureInput, 'Feature 1')
      await user.click(addButton)
      await user.type(featureInput, 'Feature 2')
      await user.click(addButton)

      expect(screen.getByText('Feature 1')).toBeInTheDocument()
      expect(screen.getByText('Feature 2')).toBeInTheDocument()

      const removeButtons = screen.getAllByRole('button', { name: '' })
      // First X button removes Feature 1
      await user.click(removeButtons[0])

      expect(screen.queryByText('Feature 1')).not.toBeInTheDocument()
      expect(screen.getByText('Feature 2')).toBeInTheDocument()
    })

    it('should clear feature input after adding', async () => {
      const user = userEvent.setup()
      renderForm()

      const featureInput = screen.getByPlaceholderText('Add a feature')
      const addButton = screen.getByRole('button', { name: /Add/i })

      await user.type(featureInput, 'New Feature')
      await user.click(addButton)

      expect(featureInput).toHaveValue('')
    })

    it('should trim whitespace from features', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn().mockResolvedValueOnce(undefined)
      renderForm({ onSubmit: mockSubmit })

      const nameInput = screen.getByLabelText('Tier Name')
      const slugInput = screen.getByLabelText('Slug')
      const priceInput = screen.getByLabelText(/Monthly Price/)
      const featureInput = screen.getByPlaceholderText('Add a feature')
      const addButton = screen.getByRole('button', { name: /Add/i })

      await user.type(nameInput, 'Test')
      await user.type(slugInput, 'test')
      await user.type(priceInput, '99.99')
      await user.type(featureInput, '  Spaced Feature  ')
      await user.click(addButton)

      const submitButton = screen.getByRole('button', { name: /Save Tier/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            features: ['Spaced Feature'],
          })
        )
      })
    })


    it('should display initial features as removable items', () => {
      const initialData: TierFormData = {
        name: 'Test',
        slug: 'test',
        monthly_price: 99.99,
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
        display_order: 0,
        is_active: true,
      }

      renderForm({ initialData })

      expect(screen.getByText('Feature 1')).toBeInTheDocument()
      expect(screen.getByText('Feature 2')).toBeInTheDocument()
      expect(screen.getByText('Feature 3')).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn().mockResolvedValueOnce(undefined)
      renderForm({ onSubmit: mockSubmit })

      const nameInput = screen.getByLabelText('Tier Name')
      const slugInput = screen.getByLabelText('Slug')
      const priceInput = screen.getByLabelText(/Monthly Price/)
      const featureInput = screen.getByPlaceholderText('Add a feature')
      const addButton = screen.getByRole('button', { name: /Add/i })

      await user.type(nameInput, 'Featured')
      await user.type(slugInput, 'featured')
      await user.type(priceInput, '299.99')
      await user.type(featureInput, 'Premium Listing')
      await user.click(addButton)

      const submitButton = screen.getByRole('button', { name: /Save Tier/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          name: 'Featured',
          slug: 'featured',
          monthly_price: 299.99,
          features: ['Premium Listing'],
          display_order: 0,
          is_active: true,
        })
      })
    })

    it('should disable submit button while loading', () => {
      renderForm({ loading: true })

      const submitButton = screen.getByRole('button', { name: /Saving/i })
      expect(submitButton).toBeDisabled()
    })

    it('should call onCancel when cancel button clicked', async () => {
      const user = userEvent.setup()
      renderForm({ onCancel: mockOnCancel })

      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('should not submit form with invalid data', async () => {
      const user = userEvent.setup()
      renderForm()

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /Save Tier/i })
      await user.click(submitButton)

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Field Interactions', () => {
    it('should update form data as user types', async () => {
      const user = userEvent.setup()
      renderForm()

      const nameInput = screen.getByLabelText('Tier Name') as HTMLInputElement
      const slugInput = screen.getByLabelText('Slug') as HTMLInputElement

      await user.type(nameInput, 'Test Tier')
      expect(nameInput.value).toBe('Test Tier')

      await user.type(slugInput, 'test-tier')
      expect(slugInput.value).toBe('test-tier')
    })

    it('should handle active/inactive toggle', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn().mockResolvedValueOnce(undefined)
      renderForm({ onSubmit: mockSubmit })

      const nameInput = screen.getByLabelText('Tier Name')
      const slugInput = screen.getByLabelText('Slug')
      const priceInput = screen.getByLabelText(/Monthly Price/)
      const activeCheckbox = screen.getByLabelText(/Active tier/)
      const featureInput = screen.getByPlaceholderText('Add a feature')
      const addButton = screen.getByRole('button', { name: /Add/i })

      await user.type(nameInput, 'Test')
      await user.type(slugInput, 'test')
      await user.type(priceInput, '99.99')
      await user.type(featureInput, 'Feature')
      await user.click(addButton)

      // Uncheck active
      await user.click(activeCheckbox)
      expect(activeCheckbox).not.toBeChecked()

      const submitButton = screen.getByRole('button', { name: /Save Tier/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            is_active: false,
          })
        )
      })
    })

    it('should handle display order updates', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn().mockResolvedValueOnce(undefined)
      renderForm({ onSubmit: mockSubmit })

      const nameInput = screen.getByLabelText('Tier Name')
      const slugInput = screen.getByLabelText('Slug')
      const priceInput = screen.getByLabelText(/Monthly Price/)
      const displayOrderInput = screen.getByLabelText(/Display Order/)
      const featureInput = screen.getByPlaceholderText('Add a feature')
      const addButton = screen.getByRole('button', { name: /Add/i })

      await user.type(nameInput, 'Test')
      await user.type(slugInput, 'test')
      await user.type(priceInput, '99.99')
      await user.clear(displayOrderInput)
      await user.type(displayOrderInput, '5')
      await user.type(featureInput, 'Feature')
      await user.click(addButton)

      const submitButton = screen.getByRole('button', { name: /Save Tier/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            display_order: 5,
          })
        )
      })
    })
  })

  describe('Error Clearing', () => {
    it('should clear error when user corrects input', async () => {
      const user = userEvent.setup()
      renderForm()

      const priceInput = screen.getByLabelText(/Monthly Price/)
      const nameInput = screen.getByLabelText('Tier Name')
      const slugInput = screen.getByLabelText('Slug')
      const featureInput = screen.getByPlaceholderText('Add a feature')
      const addButton = screen.getByRole('button', { name: /Add/i })

      // Try invalid price first
      await user.type(nameInput, 'Test')
      await user.type(slugInput, 'test')
      await user.type(priceInput, '0')
      await user.type(featureInput, 'Feature')
      await user.click(addButton)

      const submitButton = screen.getByRole('button', { name: /Save Tier/i })
      await user.click(submitButton)

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Monthly price must be greater than 0')).toBeInTheDocument()
      })

      // Fix the error
      await user.clear(priceInput)
      await user.type(priceInput, '99.99')

      // Error should disappear
      await waitFor(() => {
        expect(screen.queryByText('Monthly price must be greater than 0')).not.toBeInTheDocument()
      })
    })
  })
})
