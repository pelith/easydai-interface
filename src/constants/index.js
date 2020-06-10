import referral from '../config/referrerWhiteList.json'
export const ReferralWhiteList = referral

export const ETH_DECIMALS = 18

export const SAI_ADDRESS = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'
export const SAI_DECIMALS = 18

export const USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
export const USDC_DECIMALS = 6

export const POT_ADDRESS = '0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7' // DAI Saving Rate address

export const LENDING_POOL_ADDRESS = '0x398eC7346DcD622eDc5ae82352F02bE94C62d119' // AAVE lending pool
export const AAVE_DAI_RESERVE_ADDRESS =
  '0x6B175474E89094C44Da98b954EedeAC495271d0F' // AAVE DAI reserve

export const BLOCKS_PER_YEAR = '2102400' // (365 * 24 * 60 * 60) seconds per year / 15 seconds per block
export const CSAI_CREATION_BLOCK_NUMBER = 7710752
export const CDAI_CREATION_BLOCK_NUMBER = 8983575
export const CUSDC_CREATION_BLOCK_NUMBER = 7710760
export const ISAI_CREATION_BLOCK_NUMBER = 7867896
export const CHAI_CREATION_BLOCK_NUMBER = 8928160
export const ADAI_CREATETION_BLOCK_NUMBER = 9241063

export const CTOKEN_GAS = {
  mint: 240000,
  redeem: 240000,
  redeemIfBorrowing: 400000,
  transfer: 240000,
  transferIfBorrowing: 400000,
  borrow: 450000,
  repayBorrow: 240000,
  liquidateBorrow: 550000,
}
