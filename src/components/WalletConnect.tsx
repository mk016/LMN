import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

export function WalletConnect() {
  const { account, connectWallet, disconnectWallet, error } = useWallet();

  return (
    <div className="flex flex-col items-end">
      {account ? (
        <div className="relative group">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            <Wallet className="w-5 h-5" />
            <span>{`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
          </button>
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-48 invisible group-hover:visible bg-white rounded-lg shadow-lg border border-gray-200">
            <button
              onClick={disconnectWallet}
              className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Wallet className="w-5 h-5" />
          <span>Connect Wallet</span>
        </button>
      )}
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}