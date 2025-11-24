import { PortfolioHolding, PortfolioSummary } from '../types/portfolio'

export interface CalculatedHolding extends PortfolioHolding {
  currentValue: number
  unrealizedPnL: number
  unrealizedPnLPercentage: number
}

export interface CalculatedPortfolioSummary extends Omit<PortfolioSummary, 'holdings'> {
  holdings: CalculatedHolding[]
}

/**
 * Calculate real-time PnL for a single holding
 */
export const calculateHoldingPnL = (holding: PortfolioHolding): CalculatedHolding => {
  const currentPrice = holding.product.sharePrice || 0
  const currentValue = holding.quantity * currentPrice
  const unrealizedPnL = currentValue - holding.totalInvested
  const unrealizedPnLPercentage = holding.totalInvested > 0 
    ? (unrealizedPnL / holding.totalInvested) * 100 
    : 0

  return {
    ...holding,
    currentValue: Math.round(currentValue * 100) / 100,
    unrealizedPnL: Math.round(unrealizedPnL * 100) / 100,
    unrealizedPnLPercentage: Math.round(unrealizedPnLPercentage * 100) / 100,
  }
}

/**
 * Calculate real-time portfolio totals
 */
export const calculatePortfolioTotals = (portfolio: PortfolioSummary): CalculatedPortfolioSummary => {
  // Calculate holdings with real-time PnL
  const calculatedHoldings = portfolio.holdings.map(calculateHoldingPnL)
  
  // Calculate portfolio totals
  const totalValue = calculatedHoldings.reduce((sum, holding) => sum + holding.currentValue, 0)
  const totalInvested = calculatedHoldings.reduce((sum, holding) => sum + holding.totalInvested, 0)
  const totalUnrealizedPnL = calculatedHoldings.reduce((sum, holding) => sum + holding.unrealizedPnL, 0)
  const totalPnL = totalUnrealizedPnL // Assuming no realized PnL for now
  const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

  return {
    ...portfolio,
    holdings: calculatedHoldings,
    totalValue: Math.round(totalValue * 100) / 100,
    totalInvested: Math.round(totalInvested * 100) / 100,
    totalPnL: Math.round(totalPnL * 100) / 100,
    totalPnLPercentage: Math.round(totalPnLPercentage * 100) / 100,
  }
}

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number | undefined, currency = 'USD'): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0.00'
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format percentage for display
 */
export const formatPercentage = (percentage: number | undefined, decimals = 2): string => {
  if (percentage === undefined || percentage === null || isNaN(percentage)) {
    return '0.00%'
  }
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(decimals)}%`
}

/**
 * Get color for PnL display
 */
export const getPnLColor = (pnl: number, theme: any) => {
  if (pnl > 0) return theme.palette.success.main
  if (pnl < 0) return theme.palette.error.main
  return theme.palette.text.secondary
}