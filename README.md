# EasyDAI - Make everyone easily participate in DeFi

https://easydai.app

EasyDAI is a decentralized exchange / lending platform through depositing Ethereum to earn high-yield interest on DAI. EasyDAI is aiming to make everyone easily participate in DeFi. When the user deposits Ethereum through EasyDAI, the smart contract will be automatically executed to convert Ethereum into stable coin DAI. Then DAI will be deposited into Compound, a transparent, autonomous money market, to earn interest.

## Development

1. Copy `.env` file and set environment variables

```
cp .env.example .env.local
```

2. Start development server

```bash
npm install
npm run start
```

## Deployment

1. Build the website

```
npm run build
```

2. Put `build` folder to the server.
