import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ReactGA from 'react-ga'
import { useWeb3React } from '@web3-react/core'
import styled from 'styled-components'
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
import { useMediaQuery } from 'react-responsive'

import { useBondByAssetAndPlatform } from '../contexts/Bonds'
import { useTokenBalance, useEtherBalance } from '../contexts/Balances'
import { useBondExchangeRate } from '../contexts/BondExchangeRates'
import { useBondEarned, useBondProfit } from '../contexts/BondEarned'
import { useBondAPR } from '../contexts/BondAPR'
import { useGatewaySwap, useReferralGatewaySwap } from '../contexts/Gateways'
import FinancialStatement from './FinancialStatement'
import EtherInput from './EtherInput'
import LendingDocument from './LendingDocument'
import TokenLogo from './TokenLogo'
import PlatformLogo from './PlatformLogo'
import Subscribe from './Subscribe'
import { ReactComponent as ArrowIcon } from '../assets/arrow.svg'
import { ReactComponent as RightArrowIcon } from '../assets/right_arrow.svg'
import {
  parseQueryString,
  getReferralAddress,
  amountFormatter,
  isContract,
} from '../utils'

const Header = styled.header`
  width: 100%;
  padding: 40px 24px 32px 24px;

  ${({ theme }) => theme.mediaQuery.md`
    padding: 56px 48px 36px 48px;

  `}
`

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Title = styled.h1`
  margin: 0;
  margin-bottom: 10px;
  font-size: 24px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  color: ${({ theme }) => theme.colors.textColor};
  letter-spacing: 2px;

  ${({ theme }) => theme.mediaQuery.md`
    font-size: 32px;
  `}
`

const SubTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 400;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  color: ${({ theme }) => theme.colors.blueGray500};

  ${({ theme }) => theme.mediaQuery.md`
    font-size: 14px;
  `}
`

const ContextInfo = styled.div`
  display: none;

  ${({ theme }) => theme.mediaQuery.md`
    display: flex;
    align-items: center;
  `}
`

const ArrowIconWrapper = styled.div`
  width: 100%;
  padding: 16px 0;
  display: flex;
  justify-content: center;
  align-items: center;
`

const ErrorMessage = styled.div`
  margin-bottom: 40px;
  padding: 32px 24px;
  border-top: 4px solid ${({ theme }) => theme.colors.sunglo};
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.mahogany};
  font-size: 16px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;

  ${({ theme }) => theme.mediaQuery.md`
    padding: 44px 64px;
  `}
`

const StyledArrowIcon = styled(ArrowIcon)`
  width: 28px;
  height: 28px;
`

const StyledRightArrowIcon = styled(RightArrowIcon)`
  width: 60px;
  height: 28px;
  margin: 0 4px;
`

const StyledTokenLogo = styled(TokenLogo)`
  width: 28px;
  height: 28px;
`

const StyledPlatformLogo = styled(PlatformLogo)`
  width: 28px;
  height: 28px;
`

export default function AssetDashboard() {
  const { t } = useTranslation()

  const isDesktopOrLaptop = useMediaQuery({ minDeviceWidth: 1124 })
  const { search } = useLocation()
  const referral = useMemo(() => parseQueryString(search)['referral'], [search])
  const referralAddress = useMemo(
    () => (referral ? getReferralAddress(referral) : null),
    [referral],
  )

  const { account, library } = useWeb3React()
  const [isContractWallet, setIsContractWallet] = useState(false)
  useEffect(() => {
    let stale = false
    isContract(account, library)
      .then(result => {
        if (!stale) {
          setIsContractWallet(result)
        }
      })
      .catch(() => {
        if (!stale) {
          setIsContractWallet(false)
        }
      })

    return () => {
      stale = true
    }
  })

  const { token: asset, platform } = useParams()

  const [etherAmount, setEtherAmount] = useState('')
  const [outputAmount, setOutputAmount] = useState()
  const [gatewayNumber, setGatewayNumber] = useState()

  const weiAmount = useMemo(
    () =>
      etherAmount ? new BigNumber(ethers.utils.parseEther(etherAmount)) : null,
    [etherAmount],
  )

  useEffect(() => {
    setOutputAmount()
    setGatewayNumber()
  }, [asset, platform])

  const etherBalance = useEtherBalance(account)

  // check balance is enough
  const [balanceError, setBalanceError] = useState()
  useEffect(() => {
    if (
      etherBalance &&
      etherBalance.minus(1e16).lte(weiAmount) &&
      !isContractWallet
    ) {
      setBalanceError(t('insufficientGas'))
    } else if (etherBalance && etherBalance.lt(weiAmount)) {
      setBalanceError(t('insufficientBalance'))
    } else {
      setBalanceError()
    }
  }, [etherBalance, isContractWallet, t, weiAmount])

  const bond = useBondByAssetAndPlatform(asset, platform)
  const balance = useTokenBalance(bond.address, account)
  const exchangeRate = useBondExchangeRate(bond.address)
  const balanceComputed = useMemo(() => {
    if (balance) {
      if (bond.platform === 'AAVE') {
        return balance
      } else if (exchangeRate) {
        return balance.times(exchangeRate)
      }
    }
    return null
  }, [balance, exchangeRate, bond.platform])
  const earned = useBondEarned(bond.address, account)
  const profit = useBondProfit(bond.address, account)
  const apr = useBondAPR(bond.address)

  const {
    call: baseCall,
    send: baseSend,
    isSending: isBaseSending,
  } = useGatewaySwap(bond.address)
  const {
    call: referralCall,
    send: referralSend,
    isSending: isReferralSending,
  } = useReferralGatewaySwap(bond.address, referralAddress)
  const call = useMemo(() => (referral ? referralCall : baseCall), [
    baseCall,
    referral,
    referralCall,
  ])
  const send = useMemo(() => (referral ? referralSend : baseSend), [
    baseSend,
    referral,
    referralSend,
  ])
  const isSending = useMemo(
    () => (referral ? isReferralSending : isBaseSending),
    [isBaseSending, isReferralSending, referral],
  )

  const [calculatedAsset, setCalculatedAsset] = useState()
  // get estimated output amount
  useEffect(() => {
    let stale = false
    async function getCall() {
      const { outputAmount: amount, gatewayNumber: number } =
        (await call(weiAmount)) || {}
      if (!stale) {
        setOutputAmount(amount)
        setGatewayNumber(number)
        setCalculatedAsset(bond.address)
      }
    }

    if (weiAmount && weiAmount.gt(0)) {
      getCall()
    } else {
      setOutputAmount()
      setGatewayNumber()
    }

    return () => {
      stale = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weiAmount, call])

  const outputAmountComputed = useMemo(() => {
    if (bond.platform === 'AAVE') {
      return outputAmount
    } else {
      return outputAmount && exchangeRate && calculatedAsset === bond.address
        ? outputAmount.times(exchangeRate)
        : null
    }
  }, [outputAmount, exchangeRate, calculatedAsset, bond])

  const rate = useMemo(
    () =>
      outputAmountComputed && !outputAmountComputed.isZero()
        ? outputAmountComputed.div(weiAmount).shiftedBy(18)
        : null,
    [outputAmountComputed, weiAmount],
  )

  const willEarn = useMemo(
    () =>
      outputAmountComputed && !outputAmountComputed.isZero()
        ? outputAmountComputed.times(apr).div(1e18)
        : null,
    [outputAmountComputed, apr],
  )

  const onMax = useCallback(() => {
    if (etherBalance) {
      if (isContractWallet) {
        setEtherAmount(amountFormatter(etherBalance, 18))
      } else {
        const amount = BigNumber.maximum(0, etherBalance.minus(1e16))
        setEtherAmount(amountFormatter(amount, 18))
      }
    }
  }, [etherBalance, isContractWallet])

  const onLend = useCallback(() => {
    if (weiAmount) {
      send(weiAmount, gatewayNumber)
      ReactGA.event({
        category: 'Lend',
        action: `Lend-${bond.symbol}`,
      })
    }
  }, [bond, gatewayNumber, send, weiAmount])

  return (
    <div>
      <FinancialStatement
        tokenName={bond.asset}
        tokenDecimals={bond.assetDecimals}
        balance={balanceComputed}
        profit={profit}
        earned={earned}
        isBlock={!account}
      />
      <Header>
        <TitleWrapper>
          <Title>{t('lendingNow')}</Title>
          <ContextInfo>
            <StyledTokenLogo name={bond.asset} />
            <StyledRightArrowIcon />
            <StyledPlatformLogo name={bond.platform} />
          </ContextInfo>
        </TitleWrapper>
        <SubTitle>
          {t('lendingInstruction', { token: bond.asset.toUpperCase() })}
        </SubTitle>
      </Header>
      {bond.asset !== 'SAI' ? (
        <>
          <EtherInput
            etherBalance={etherBalance}
            error={balanceError}
            onClickBalance={onMax}
            placeholder='0.00'
            value={etherAmount}
            onChange={event => setEtherAmount(event.target.value)}
          />
          <ArrowIconWrapper>
            <StyledArrowIcon />
          </ArrowIconWrapper>
          <LendingDocument
            tokenName={bond.asset}
            tokenPlatform={bond.platform}
            tokenDecimals={bond.assetDecimals}
            account={account}
            amount={outputAmountComputed}
            exchangeRate={rate}
            estimatedEarned={willEarn}
            error={balanceError}
            isSubmiting={isSending}
            onSubmit={onLend}
          />
        </>
      ) : (
        <ErrorMessage>{t('saiDisabled')}</ErrorMessage>
      )}
      {!isDesktopOrLaptop && <Subscribe />}
    </div>
  )
}
