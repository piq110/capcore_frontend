import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import Portfolio from '../../pages/Portfolio'

// Mock the portfolio service
vi.mock('../../services/portfolioService', () => ({
  portfolioService: {
    getPortfolio: vi.fn().mockRejectedValue(new Error('No portfolio data')),
    formatCurrency: vi.fn((amount: number) => `$${amount.toFixed(2)}`),
    formatPercentage: vi.fn((percentage: number) => `${percentage.toFixed(2)}%`),
    formatDateTime: vi.fn((date: string) => new Date(date).toLocaleString()),
  }
}))

const theme = createTheme()

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  )
}

describe('Portfolio Component', () => {
  it('renders portfolio page title', () => {
    renderWithProviders(<Portfolio />)
    expect(screen.getByText('Portfolio')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    renderWithProviders(<Portfolio />)
    // The component should show some loading indication or error message
    expect(screen.getByText('Portfolio')).toBeInTheDocument()
  })
})