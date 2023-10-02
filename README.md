This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# NFT Marketplace

An easy-to-use decentralized application to mint, list, and buy NFTs built on the Ethereum blockchain.

## Features

- **Mint NFTs**: Users can mint new NFTs by providing a token URI.
- **List NFTs for Sale**: Once minted, users can list their NFTs for sale by specifying a price in ETH.
- **Buy NFTs**: Browse and purchase available NFTs directly from other users.

## Quick Start

1. **Connect Wallet**: Ensure you have MetaMask or a similar Ethereum wallet installed.
2. **Mint an NFT**: Navigate to the "Mint NFT" section, provide a token URI, and confirm the transaction.
3. **List an NFT for Sale**: Head to the "List for Sale" section, enter your NFT's ID and the price in ETH, then confirm the listing.
4. **Purchase an NFT**: In the "Buy NFT" section, select an available NFT and confirm your purchase.

## Setup and Installation

\```bash
# Clone the repository
git clone [your-repo-url]

# Navigate to the directory
cd nft-marketplace

# Install dependencies
npm install

# Start the development server
npm start
\```

## Environment Variables

The application uses several environment variables for configuration. These are specified in the `.env.example` file. To use them in your local development:

1. Copy the `.env.example` to `.env`.
2. Fill in the values as per your configuration.

### Explanation of Variables:

- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: Your WalletConnect project ID.
  
- `NEXT_PUBLIC_FANTOM_CHAINID`: Even though the variable is named `FANTOM_CHAINID`, it refers to the Polygon chain ID. The reason for this naming convention is historical, as the project was initially tested on the Fantom testnet and then shifted to the Polygon testnet. To avoid code changes, the variable names remained unchanged. For the Polygon Mumbai testnet, this value should be `80001`.
  
- `NEXT_PUBLIC_FANTOMTESTNET_MARKETPLACE`: The address of the marketplace contract on the Polygon Mumbai testnet.
  
- `NEXT_PUBLIC_FTM_RPC`: RPC URL for the Polygon Mumbai testnet. 
  
- `NEXT_PUBLIC_MONGO_URL`: Your MongoDB connection URL.

> Note: Always remember not to commit your `.env` file containing sensitive information to the repository. It's best practice to keep it in the `.gitignore` and only share necessary details through the `.env.example` file.

## Tech Stack

- **Blockchain**: Polygon Testnet
- **Smart Contract**: Solidity
- **Web3 Provider**: MetaMask
- **Frontend**: Nextjs

## Troubleshooting

- Ensure you are connected to the correct network in your Ethereum wallet.
- If facing issues with displaying NFTs, clear your browser cache and restart the application.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss the proposed changes.

## License

[MIT]

## Contact

[Your Name] - [Your Email] - [Your Website/Twitter/GitHub]

