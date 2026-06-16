import express from 'express';
import dotenv from 'dotenv';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Initialize Sui Client
const network = process.env.SUI_NETWORK || 'testnet';
const rpcUrl = process.env.SUI_RPC_URL || getFullnodeUrl(network as 'mainnet' | 'testnet' | 'devnet' | 'localnet');
const client = new SuiClient({ url: rpcUrl });

// Helper to get agent address if key is configured
let agentAddress = 'Not configured';
if (process.env.AGENT_PRIVATE_KEY) {
  try {
    const keypair = Ed25519Keypair.fromSecretKey(process.env.AGENT_PRIVATE_KEY);
    agentAddress = keypair.toSuiAddress();
  } catch (error) {
    agentAddress = 'Error parsing AGENT_PRIVATE_KEY';
  }
}

app.get('/health', async (req, res) => {
  try {
    // Simple SUI RPC check
    const chainIdentifier = await client.getChainIdentifier();
    res.json({
      status: 'healthy',
      network,
      rpcUrl,
      chainIdentifier,
      agentAddress,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message || String(error),
      network,
      rpcUrl,
      agentAddress,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/', (req, res) => {
  res.send('Sui DeFAI Agent Backend is running!');
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
  console.log(`Sui network: ${network}`);
  console.log(`Sui RPC URL: ${rpcUrl}`);
  console.log(`Agent address: ${agentAddress}`);
});
