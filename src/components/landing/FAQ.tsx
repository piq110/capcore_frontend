import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  useTheme
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Security as SecurityIcon,
  AccountBalance as InvestmentIcon,
  TrendingUp as TradingIcon,
  Wallet as WalletIcon
} from '@mui/icons-material'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: 'basics' | 'investments' | 'trading' | 'wallet' | 'security' | 'compliance'
  icon: React.ReactElement
}

const faqData: FAQItem[] = [
  // Basics - REITs and BDCs explanation first
  {
    id: 'what-are-reits',
    question: 'What are REITs (Real Estate Investment Trusts)?',
    answer: 'REITs are companies that own, operate, or finance income-producing real estate. They allow individual investors to earn dividends from real estate investments without having to buy, manage, or finance properties themselves. REITs typically focus on specific real estate sectors like apartment buildings, data centers, healthcare facilities, hotels, infrastructure, office buildings, retail centers, and warehouses. Most REITs trade on major stock exchanges and offer high liquidity, but non-traded REITs (which we specialize in) are not listed on exchanges and may offer different risk-return profiles.',
    category: 'basics',
    icon: <InvestmentIcon />
  },
  {
    id: 'what-are-bdcs',
    question: 'What are BDCs (Business Development Companies)?',
    answer: 'BDCs are closed-end investment companies that invest in small and mid-sized businesses, typically providing debt financing, equity investments, or a combination of both. They were created by Congress in 1980 to help provide capital to smaller companies that might have difficulty accessing traditional financing. BDCs are required to distribute at least 90% of their taxable income to shareholders as dividends, making them attractive for income-focused investors. They often invest in private companies or provide mezzanine financing, offering potentially higher yields than traditional investments but with corresponding higher risks.',
    category: 'basics',
    icon: <InvestmentIcon />
  },
  {
    id: 'what-is-capital-core',
    question: 'What is CAPITAL CORE and how does it work?',
    answer: 'CAPITAL CORE is a secondary marketplace platform that connects buyers and sellers of alternative investments, specifically focusing on non-traded REITs and BDCs. Our platform provides liquidity solutions for investors who hold illiquid alternative investments and want to sell before maturity. We facilitate transactions between accredited investors, institutions, and financial advisors, offering transparent pricing, secure transactions, and comprehensive due diligence. The platform operates 24/7 and supports cryptocurrency funding through multi-chain stablecoin wallets.',
    category: 'basics',
    icon: <InfoIcon />
  },
  {
    id: 'who-can-use-platform',
    question: 'Who can use the CAPITAL CORE platform?',
    answer: 'Our platform serves three main user types: Individual accredited investors seeking liquidity for their alternative investments, Institutional investors managing portfolios on behalf of organizations, and Financial advisors helping clients access liquidity options. All users must complete KYC (Know Your Customer) verification, and certain investments may require accredited investor status as defined by SEC regulations. We welcome both buyers looking to acquire alternative investments and sellers seeking liquidity for their existing holdings.',
    category: 'basics',
    icon: <InfoIcon />
  },
  
  // Investment-related questions
  {
    id: 'investment-minimums',
    question: 'What are the minimum investment amounts?',
    answer: 'Minimum investment amounts vary by product, typically ranging from $500 to $5,000 per investment. Each REIT or BDC listing displays its specific minimum investment requirement. These minimums are set by the original issuers and help ensure that investments are suitable for the intended investor base. Our platform supports fractional ownership, allowing investors to diversify across multiple products even with smaller investment amounts.',
    category: 'investments',
    icon: <InvestmentIcon />
  },
  {
    id: 'investment-types',
    question: 'What types of investments are available on the platform?',
    answer: 'We specialize in non-traded REITs and BDCs across various sectors. REIT categories include commercial real estate, residential properties, healthcare facilities, data centers, industrial properties, and specialized real estate sectors. BDC investments span multiple industries including technology, healthcare, energy, consumer goods, and financial services. Each investment includes detailed information about the underlying assets, management team, fee structure, distribution history, and risk factors.',
    category: 'investments',
    icon: <InvestmentIcon />
  },
  {
    id: 'due-diligence',
    question: 'What due diligence information is provided?',
    answer: 'Each investment listing includes comprehensive documentation: prospectuses, annual and quarterly reports, offering circulars, financial statements, management presentations, and legal documents. We provide detailed analysis of fee structures, distribution history, NAV (Net Asset Value) trends, portfolio composition, and risk assessments. Our platform also includes issuer contact information, CUSIP/ISIN identifiers where available, and third-party research when accessible.',
    category: 'investments',
    icon: <SecurityIcon />
  },
  
  // Trading and marketplace
  {
    id: 'how-trading-works',
    question: 'How does trading work on the platform?',
    answer: 'Our platform operates as a secondary marketplace with order matching functionality. Sellers list their holdings with asking prices, and buyers can place orders at market or limit prices. We support both immediate transactions and limit orders that execute when price conditions are met. All trades are processed through our secure system with automatic settlement, fee calculation, and portfolio updates. The platform operates 24/7, allowing for continuous trading unlike traditional markets.',
    category: 'trading',
    icon: <TradingIcon />
  },
  {
    id: 'pricing-transparency',
    question: 'How is pricing determined and is it transparent?',
    answer: 'Pricing is determined by market forces - supply and demand between buyers and sellers. Our platform displays current bid/ask spreads, recent transaction history, and NAV information where available. We provide price discovery tools including order books, recent trade data, and market depth information. All fees are clearly disclosed upfront, including transaction fees (typically 1-5%), platform fees, and any applicable network fees for cryptocurrency transactions.',
    category: 'trading',
    icon: <TradingIcon />
  },
  {
    id: 'settlement-process',
    question: 'How long does settlement take?',
    answer: 'Digital transactions typically settle within 1-3 business days, depending on the complexity of the transfer and custodial requirements. Cryptocurrency-funded transactions may settle faster, often within 24 hours once blockchain confirmations are complete. Settlement involves transfer of ownership, payment processing, fee collection, and updating of all relevant records. We provide real-time status updates throughout the settlement process.',
    category: 'trading',
    icon: <TradingIcon />
  },
  
  // Wallet and cryptocurrency
  {
    id: 'supported-cryptocurrencies',
    question: 'What cryptocurrencies and networks are supported?',
    answer: 'We support USDT and USDC stablecoins across three major blockchain networks: Ethereum (ETH), Tron (TRX), and Binance Smart Chain (BSC). This multi-chain approach provides flexibility, lower transaction costs, and faster settlement times. Each network has different confirmation requirements: Ethereum (12 confirmations), Tron (19 confirmations), and BSC (15 confirmations). All deposits are automatically detected and credited to your account.',
    category: 'wallet',
    icon: <WalletIcon />
  },
  {
    id: 'wallet-security',
    question: 'How secure are the cryptocurrency wallets?',
    answer: 'Our wallets use institutional-grade security with multi-signature technology, cold storage for large amounts, and hot wallets only for operational needs. All private keys are encrypted and stored in secure hardware modules. We employ real-time monitoring for suspicious activities, multi-factor authentication, and regular security audits. Withdrawal requests require admin approval and go through fraud detection systems before processing.',
    category: 'wallet',
    icon: <SecurityIcon />
  },
  {
    id: 'deposit-withdrawal-fees',
    question: 'What are the fees for deposits and withdrawals?',
    answer: 'Cryptocurrency deposits are free - you only pay the network transaction fees to send funds to your wallet address. Withdrawal fees are configurable and typically cover network costs plus a small processing fee. Trading fees range from 1-5% of transaction value, and listing fees apply for new REIT/BDC offerings. All fees are transparently displayed before you confirm any transaction, and we provide detailed fee breakdowns in your transaction history.',
    category: 'wallet',
    icon: <WalletIcon />
  },
  
  // Security and compliance
  {
    id: 'kyc-requirements',
    question: 'What are the KYC (Know Your Customer) requirements?',
    answer: 'All users must complete identity verification including government-issued ID, proof of address, and accredited investor verification where required. The KYC process typically takes 1-3 business days for approval. We use bank-level verification systems and comply with all applicable AML (Anti-Money Laundering) regulations. Some investments may require additional documentation or higher verification levels depending on the investment type and amount.',
    category: 'compliance',
    icon: <SecurityIcon />
  },
  {
    id: 'regulatory-compliance',
    question: 'How does CAPITAL CORE ensure regulatory compliance?',
    answer: 'CAPITAL CORE Securities, LLC is a registered broker-dealer and member of FINRA and SIPC. We comply with all applicable securities laws, maintain required licenses, and undergo regular regulatory examinations. Our platform includes automated compliance monitoring, transaction reporting, and audit trails. We work with qualified custodians for asset management and maintain comprehensive records for regulatory reporting requirements.',
    category: 'compliance',
    icon: <SecurityIcon />
  },
  {
    id: 'data-protection',
    question: 'How is my personal and financial data protected?',
    answer: 'We employ bank-level security measures including 256-bit SSL encryption, secure data centers, regular security audits, and strict access controls. Personal data is encrypted both in transit and at rest, and we maintain comprehensive backup systems. Our privacy policy details how we collect, use, and protect your information. We never share personal data with third parties except as required for transaction processing or regulatory compliance.',
    category: 'security',
    icon: <SecurityIcon />
  },
  {
    id: 'customer-support',
    question: 'What customer support is available?',
    answer: 'We provide 24/7 customer support through multiple channels including email (support@capitalcore.app), live chat, and phone support during business hours. Our support team includes licensed professionals who can assist with platform navigation, investment questions, technical issues, and account management. We also maintain a comprehensive knowledge base and provide educational resources about alternative investments.',
    category: 'basics',
    icon: <InfoIcon />
  }
]

const categoryConfig = {
  basics: { label: 'Platform Basics', color: 'primary' as const },
  investments: { label: 'Investments', color: 'secondary' as const },
  trading: { label: 'Trading', color: 'success' as const },
  wallet: { label: 'Cryptocurrency', color: 'info' as const },
  security: { label: 'Security', color: 'warning' as const },
  compliance: { label: 'Compliance', color: 'error' as const }
}

const FAQ: React.FC = () => {
  const theme = useTheme()
  const [expandedPanel, setExpandedPanel] = useState<string | false>('what-are-reits')

  const handleAccordionChange = (panel: string) => (
    _event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedPanel(isExpanded ? panel : false)
  }

  const groupedFAQs = faqData.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = []
    }
    acc[faq.category].push(faq)
    return acc
  }, {} as Record<string, FAQItem[]>)

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
      <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 6 } }}>
        <Typography 
          variant="h3" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            fontWeight: 600,
            color: 'primary.main'
          }}
        >
          Frequently Asked Questions
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ 
            fontSize: { xs: '1rem', sm: '1.125rem' },
            maxWidth: '800px',
            mx: 'auto',
            lineHeight: 1.6
          }}
        >
          Everything you need to know about REITs, BDCs, and trading on the CAPITAL CORE platform
        </Typography>
      </Box>

      {Object.entries(groupedFAQs).map(([category, faqs]) => (
        <Box key={category} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Chip
              label={categoryConfig[category as keyof typeof categoryConfig].label}
              color={categoryConfig[category as keyof typeof categoryConfig].color}
              variant="outlined"
              sx={{ mr: 2, fontWeight: 600 }}
            />
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {categoryConfig[category as keyof typeof categoryConfig].label}
            </Typography>
          </Box>

          {faqs.map((faq) => (
            <Accordion
              key={faq.id}
              expanded={expandedPanel === faq.id}
              onChange={handleAccordionChange(faq.id)}
              sx={{
                mb: 1,
                '&:before': {
                  display: 'none',
                },
                boxShadow: theme.shadows[1],
                '&.Mui-expanded': {
                  boxShadow: theme.shadows[3],
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${faq.id}-content`}
                id={`${faq.id}-header`}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box sx={{ mr: 2, color: 'primary.main' }}>
                    {faq.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 500,
                      fontSize: { xs: '1rem', sm: '1.125rem' }
                    }}
                  >
                    {faq.question}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  pt: 0,
                  pb: 3,
                  px: 3,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.7,
                    color: 'text.secondary',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    ml: 5, // Align with icon
                  }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ))}

      <Box 
        sx={{ 
          mt: 6, 
          p: 3, 
          backgroundColor: 'primary.main',
          borderRadius: 2,
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.contrastText' }}>
          Still have questions?
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: 'primary.contrastText', opacity: 0.9 }}>
          Our support team is available 24/7 to help you with any questions about the platform or investments.
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500, color: 'primary.contrastText' }}>
          Contact us at support@capitalcore.app
        </Typography>
      </Box>
    </Container>
  )
}

export default FAQ