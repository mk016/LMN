interface PaymentDetails {
  amount: number;
  playerName: string;
  walletAddress: string;
}

export class PaymentService {
  private static entryFee = 0.01; // ETH

  static async processPayment(playerDetails: PaymentDetails): Promise<boolean> {
    try {
      // Check if MetaMask is installed
      if (!(window as any).ethereum) {
        throw new Error('Please install MetaMask to participate');
      }

      const ethereum = (window as any).ethereum;
      
      // Request account access
      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      // Convert entry fee to Wei
      const amountInWei = ethereum.utils.toWei(
        this.entryFee.toString(), 
        'ether'
      );

      // Send transaction
      const transaction = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: accounts[0],
          to: playerDetails.walletAddress,
          value: amountInWei,
        }],
      });

      return !!transaction;
    } catch (error) {
      console.error('Payment failed:', error);
      throw new Error('Failed to process payment');
    }
  }

  static async transferToWinner(winnerAddress: string, totalPrize: number): Promise<boolean> {
    try {
      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const amountInWei = ethereum.utils.toWei(
        totalPrize.toString(), 
        'ether'
      );

      const transaction = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: accounts[0],
          to: winnerAddress,
          value: amountInWei,
        }],
      });

      return !!transaction;
    } catch (error) {
      console.error('Prize transfer failed:', error);
      throw new Error('Failed to transfer prize to winner');
    }
  }

  // Add this function to generate random wallet addresses
  static generateRandomWalletAddress(): string {
    const chars = '0123456789abcdef';
    let address = '0x';
    // Generate 40 characters (20 bytes) for the address
    for (let i = 0; i < 40; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
  }

  static async getConnectedWalletAddress(): Promise<string> {
    try {
      if (!(window as any).ethereum) {
        throw new Error('Please install MetaMask');
      }

      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      return accounts[0];
    } catch (error) {
      console.error('Failed to get wallet address:', error);
      throw error;
    }
  }
} 