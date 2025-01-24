import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);

        try {
          const accounts = await provider.send("eth_accounts", []);
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        } catch (error) {
          console.error('Error fetching accounts:', error);
        }

        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          setAccount(accounts[0] || null);
        });

        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
      }
    };

    init();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask to use this feature');
      return;
    }

    if (!provider) return;

    try {
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      setError(null);
    } catch (error: any) {
      if (error.code === 4001) {
        setError('Please connect your wallet to continue');
      } else {
        setError('Failed to connect wallet');
      }
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    // Add any additional cleanup needed
  };

  return {
    account,
    provider,
    connectWallet,
    disconnectWallet,
    error
  };
}