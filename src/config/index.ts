interface Config {
  apiBaseUrl: string;
  wsUrl: string;
  stage: string;
  blockchain: {
    ethereum: {
      chainId: number;
    };
    bsc: {
      chainId: number;
    };
    tron: {
      network: string;
    };
  };
  features: {
    enableMFA: boolean;
    enableKYC: boolean;
    enableTrading: boolean;
  };
}

const config: Config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  wsUrl: import.meta.env.VITE_WS_URL || 'http://localhost:3001',
  stage: import.meta.env.VITE_STAGE || 'alpha',
  
  blockchain: {
    ethereum: {
      chainId: parseInt(import.meta.env.VITE_ETHEREUM_CHAIN_ID || '1', 10),
    },
    bsc: {
      chainId: parseInt(import.meta.env.VITE_BSC_CHAIN_ID || '56', 10),
    },
    tron: {
      network: import.meta.env.VITE_TRON_NETWORK || 'mainnet',
    },
  },
  
  features: {
    enableMFA: import.meta.env.VITE_ENABLE_MFA !== 'false',
    enableKYC: import.meta.env.VITE_ENABLE_KYC !== 'false',
    enableTrading: import.meta.env.VITE_ENABLE_TRADING !== 'false',
  },
};

export default config;