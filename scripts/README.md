# Xandeum Network Probe Script

## Usage

Run the probe script to test connections to Xandeum RPC endpoints:

```bash
node scripts/probe.js
```

## What it does

1. Tests standard Solana RPC endpoints:
   - `https://rpc.xandeum.network`
   - `https://api.devnet.solana.com`
   - `https://api.mainnet-beta.solana.com`

2. Tests custom Xandeum API endpoints:
   - `/api/nodes`
   - `/api/pnodes`
   - `/api/storage-nodes`
   - `/api/v1/nodes`

3. Checks for `@xandeum/web3.js` SDK availability

## Output

The script will:
- Show which endpoints are reachable
- Display the response structure from working endpoints
- Indicate which methods are available

Use this information to update `services/xandeum.ts` with the correct API structure.

