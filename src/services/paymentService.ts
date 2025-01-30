import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';

interface PaymentDetails {
  amount: number;
  playerName: string;
  walletAddress: string;
}

export class PaymentService {
  private static readonly CONTRACT_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
  private static readonly SEPOLIA_CHAIN_ID = '0xaa36a7';
  private static readonly ABI = [
    {
      "inputs": [{"internalType": "string", "name": "roomId", "type": "string"}],
      "name": "joinBattle",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "string", "name": "roomId", "type": "string"},
        {"internalType": "address", "name": "winner", "type": "address"}
      ],
      "name": "declareWinner",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "entryFee",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  private static async getProvider() {
    if (!(window as any).ethereum) {
      throw new Error('Please install MetaMask');
    }
    return new ethers.BrowserProvider((window as any).ethereum);
  }

  static async payEntryFee(roomId: string, amount: string): Promise<boolean> {
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        toast.error('Please install MetaMask');
        return false;
      }

      await this.switchToSepolia(ethereum);

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(
        this.CONTRACT_ADDRESS,
        this.ABI,
        signer
      );

      const entryFee = await contract.entryFee();
      console.log('Entry fee from contract:', entryFee.toString());

      // Join battle with roomId
      const tx = await contract.joinBattle(roomId, {
        value: entryFee,
        gasLimit: 200000
      });

      toast.success('Processing payment...');
      const receipt = await tx.wait();
      
      console.log('Battle joined:', receipt);
      toast.success('Successfully joined battle!');
      
      return true;

    } catch (error: any) {
      console.error('Payment error:', error);
      if (error.code === 4001) {
        toast.error('Transaction rejected. Please try again.');
      } else if (error.code === -32603) {
        toast.error('Insufficient funds for transaction');
      } else {
        toast.error(error.message || 'Payment failed');
      }
      return false;
    }
  }

  static async transferWinningsToWinner(
    roomId: string,
    winnerAddress: string
  ): Promise<boolean> {
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        toast.error('Please install MetaMask');
        return false;
      }

      await this.switchToSepolia(ethereum);

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(
        this.CONTRACT_ADDRESS,
        this.ABI,
        signer
      );

      const tx = await contract.declareWinner(roomId, winnerAddress, {
        gasLimit: 200000
      });

      toast.success('Processing winner payment...');
      const receipt = await tx.wait();
      
      console.log('Winner payment confirmed:', receipt);
      toast.success('Prize transferred to winner!');
      
      return true;

    } catch (error: any) {
      console.error('Prize transfer error:', error);
      toast.error('Failed to transfer prize to winner');
      return false;
    }
  }

  private static async switchToSepolia(ethereum: any): Promise<void> {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: this.SEPOLIA_CHAIN_ID }]
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: this.SEPOLIA_CHAIN_ID,
            chainName: 'Sepolia Test Network',
            nativeCurrency: {
              name: 'SepoliaETH',
              symbol: 'SEP',
              decimals: 18
            },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io']
          }]
        });
      } else {
        throw error;
      }
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