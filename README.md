# EasyDAI: Lowering the barrier of DeFi

[![Netlify Status](https://api.netlify.com/api/v1/badges/c06c4d19-f079-4cf1-8243-54fde188d023/deploy-status)](https://app.netlify.com/sites/easydai/deploys)

Check out the platform live at [easydai.app](https://easydai.app)

## What is EasyDAI?

EasyDAI is a decentralized exchange and lending platform, lowering the barrier of DeFi by helping users depositing ether into Compound in a simple, straightforward, and user-friendly interface.

When users deposit Ether using EasyDAI, Ether will be converted into stable coin DAI automatically by our smart contract. After that, DAI will be deposited into Compound, a transparent, autonomous money market, to earn interest for the user.

## FAQ

Please refer to [easydai.app/faq](https://easydai.app/faq)

## Technical Instruction

### Dev

Copy `.env.example` file and set environment variables, including `NETWORK_ID`, `NETWORK_URL` and `GA_TOKEN` (Google Analytic)

```
cp .env.example .env.local
```

Start development server

```bash
npm install
npm run start
```

### Build

Build the website

```
npm run build
```

Deploy to content of `build` folder to the server

## License

[BSD 3-Clause](https://github.com/pelith/easydai/blob/master/LICENSE.md)

Copyright (c) 2019-present Pelith


