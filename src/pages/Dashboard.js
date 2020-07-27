import React, { useCallback, useMemo, useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ReactGA from 'react-ga'
import { useWeb3React } from '@web3-react/core'
import { useLazyQuery, gql, useQuery } from '@apollo/client'
import styled from 'styled-components'
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
import { useEtherBalance } from '../contexts/Balances'
import { useBondByAssetAndPlatform } from '../contexts/Bonds'
import { useGatewaySwap, useReferralGatewaySwap } from '../contexts/Gateways'
import { useIsContractAddress } from '../hooks/ethereum'
import FinancialStatement from '../components/FinancialStatement'
import EtherInput from '../components/EtherInput'
import LendingDocument from '../components/LendingDocument'
import TokenLogo from '../components/TokenLogo'
import PlatformLogo from '../components/PlatformLogo'
import { ReactComponent as ArrowIcon } from '../assets/arrow.svg'
import { ReactComponent as RightArrowIcon } from '../assets/right_arrow.svg'
import { parseQueryString, getReferralAddress, amountFormatter } from '../utils'

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
  text-align: ${({ textAlign }) => textAlign || 'left'}
    ${({ theme }) => theme.mediaQuery.md`
    font-size: 14px;
  `};
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

const GET_MARKET = gql`
  query GetMarket($market: String!) {
    market(id: $market) {
      id
      exchangeRate
      supplyRate
    }
  }
`

const GET_ACCOUNT_BOND = gql`
  query GetAccountBond($account: String!, $market: String!) {
    account(id: $account) {
      id
      bonds(where: { market: $market }) {
        id
        normalizedBalance
        principalBalance
        totalUnderlyingSupplied
        totalUnderlyingRedeemed
      }
    }
  }
`

export default function Dashboard() {
  const { t } = useTranslation()

  const { account } = useWeb3React()

  const { token, platform } = useParams()
  const bond = useBondByAssetAndPlatform(token, platform)

  const { data: marketData } = useQuery(GET_MARKET, {
    variables: {
      market: bond.address.toLowerCase(),
    },
  })

  const [getAccountStats, { data: accountData }] = useLazyQuery(
    GET_ACCOUNT_BOND,
    {
      variables: {
        account: account ? account.toLowerCase() : '',
        market: bond.address.toLowerCase(),
      },
    },
  )
  useEffect(() => {
    if (account) {
      getAccountStats()
    }
  }, [account, getAccountStats])

  const exchangeRate = useMemo(
    () => (marketData ? marketData.market.exchangeRate : null),
    [marketData],
  )

  const supplyRate = useMemo(
    () => (marketData ? marketData.market.supplyRate : null),
    [marketData],
  )

  const accountBond = useMemo(
    () => (accountData ? accountData.account.bonds[0] : null),
    [accountData],
  )

  const balance = useMemo(
    () =>
      accountBond
        ? new BigNumber(accountBond.normalizedBalance).times(exchangeRate)
        : null,
    [accountBond, exchangeRate],
  )

  const profit = useMemo(
    () =>
      balance
        ? new BigNumber(balance).minus(accountBond.principalBalance)
        : null,
    [accountBond, balance],
  )

  const earned = useMemo(
    () =>
      accountBond
        ? new BigNumber(accountBond.totalUnderlyingRedeemed)
            .minus(accountBond.totalUnderlyingSupplied)
            .plus(balance)
        : null,
    [accountBond, balance],
  )

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
  }, [token, platform])

  const isContractAddress = useIsContractAddress(account)
  const etherBalance = useEtherBalance(account)

  // check balance is enough
  const [balanceError, setBalanceError] = useState()
  useEffect(() => {
    if (
      etherBalance &&
      etherBalance.minus(1e16).lte(weiAmount) &&
      !isContractAddress
    ) {
      setBalanceError(t('insufficientGas'))
    } else if (etherBalance && etherBalance.lt(weiAmount)) {
      setBalanceError(t('insufficientBalance'))
    } else {
      setBalanceError()
    }
  }, [etherBalance, isContractAddress, t, weiAmount])

  const { search } = useLocation()
  const referral = useMemo(() => parseQueryString(search)['referral'], [search])
  const referralAddress = useMemo(
    () => (referral ? getReferralAddress(referral) : null),
    [referral],
  )

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
      return outputAmount && outputAmount.shiftedBy(-bond.decimals)
    } else {
      return outputAmount && exchangeRate && calculatedAsset === bond.address
        ? outputAmount.shiftedBy(-bond.decimals).times(exchangeRate)
        : null
    }
  }, [outputAmount, exchangeRate, calculatedAsset, bond])

  const rate = useMemo(
    () =>
      outputAmountComputed && !outputAmountComputed.isZero()
        ? outputAmountComputed.div(etherAmount)
        : null,
    [outputAmountComputed, etherAmount],
  )

  const willEarn = useMemo(
    () =>
      outputAmountComputed && !outputAmountComputed.isZero()
        ? outputAmountComputed.times(supplyRate)
        : null,
    [outputAmountComputed, supplyRate],
  )

  const onMax = useCallback(() => {
    if (etherBalance) {
      if (isContractAddress) {
        setEtherAmount(amountFormatter(etherBalance, 18))
      } else {
        const amount = BigNumber.maximum(0, etherBalance.minus(1e16))
        setEtherAmount(amountFormatter(amount, 18))
      }
    }
  }, [etherBalance, isContractAddress])

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
        balance={balance && balance.toFixed(8)}
        profit={profit && profit.toFixed(8)}
        earned={earned && earned.toFixed(8)}
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
          {t('lendingInstruction', { token: token.toUpperCase() })}
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
            amount={
              outputAmountComputed ? outputAmountComputed.toFixed(2) : '0.00'
            }
            exchangeRate={rate}
            estimatedEarned={willEarn && willEarn.toFixed(2)}
            error={balanceError}
            isSubmiting={isSending}
            onSubmit={onLend}
          />
        </>
      ) : (
        <ErrorMessage>{t('saiDisabled')}</ErrorMessage>
      )}
    </div>
  )
}
