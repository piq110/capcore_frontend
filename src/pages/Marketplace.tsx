import React, { useState } from 'react'
import { Box } from '@mui/material'
import { InvestmentProduct } from '../types/marketplace'
import { MarketplaceBrowser, InvestmentDetails, OrderBook } from '../components/marketplace'

type ViewMode = 'browse' | 'details' | 'orderbook'

const Marketplace: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('browse')
  const [selectedProduct, setSelectedProduct] = useState<InvestmentProduct | null>(null)

  const handleProductSelect = (product: InvestmentProduct) => {
    setSelectedProduct(product)
    setViewMode('details')
  }

  const handleBackToBrowse = () => {
    setViewMode('browse')
    setSelectedProduct(null)
  }

  // const handleViewOrderBook = () => {
  //   setViewMode('orderbook')
  // }

  const handleTradeComplete = () => {
    // Optionally refresh data or show success message
    console.log('Trade completed successfully')
  }

  return (
    <Box>
      {viewMode === 'browse' && (
        <MarketplaceBrowser onProductSelect={handleProductSelect} />
      )}

      {viewMode === 'details' && selectedProduct && (
        <InvestmentDetails
          productId={selectedProduct.id}
          onBack={handleBackToBrowse}
          onTradeComplete={handleTradeComplete}
        />
      )}

      {viewMode === 'orderbook' && selectedProduct && (
        <Box>
          <OrderBook
            productId={selectedProduct.id}
            productName={selectedProduct.name}
            productSymbol={selectedProduct.symbol}
          />
        </Box>
      )}
    </Box>
  )
}

export default Marketplace