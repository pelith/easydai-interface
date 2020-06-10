import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ReactGA from 'react-ga'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'

import { useBondDetails } from '../../contexts/Bonds'
import { useTokenBalance } from '../../contexts/Balances'
import { useBondExchangeRate } from '../../contexts/BondExchangeRates'
import { useGasPrice } from '../../hooks/ethereum'
import {
  InputWrapper,
  NumberInput,
  LabelWrapper,
  Label,
  ErrorCaption,
  Button,
  MaxButton,
} from './formStyles'
import { ReactComponent as LoadingIcon } from '../../assets/loading.svg'
import { amountFormatter } from '../../utils'

const WITHDRAW_METHODS = {
  Compound: 'redeem',
  Fulcrum: 'burn',
  MakerDAO: 'exit',
  AAVE: 'redeem',
}

const WITHDRAW_GASES = {
  Compound: '950000',
  Fulcrum: '600000',
  MakerDAO: '400000',
  AAVE: '600000',
}

const BalanceWrapper = styled.div`
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const BalanceValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.barlow};
  letter-spacing: 0.5px;
`

const BalanceUnit = styled.span`
  margin-left: 4px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.blueGray400};
`

const WithdrawButton = styled(Button).attrs(() => ({
  type: 'button',
}))`
  background-color: ${({ theme }) => theme.colors.anzac};

  &[disabled] {
    background-color: #e9d5a5;
  }
`

const StyledLoadingIcon = styled(LoadingIcon)`
  width: 20px;
  height: 20px;
`

export default function WithdrawForm(props) {
  const { library, account, tokenAddress, onSubmit = () => {} } = props

  const { t } = useTranslation()

  const bond = useBondDetails(tokenAddress) || {}
  const balance = useTokenBalance(tokenAddress, account)
  const exchangeRate = useBondExchangeRate(tokenAddress)
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

  const decimalsExp = useMemo(() => new BigNumber(10).pow(bond.assetDecimals), [
    bond,
  ])

  const [amount, setAmount] = useState('')
  const cTokenAmount = useMemo(() => {
    if (amount) {
      let value
      if (bond.platform === 'AAVE') {
        value = new BigNumber(amount).times(decimalsExp)
      } else {
        value = new BigNumber(amount).times(decimalsExp).idiv(exchangeRate)
      }
      if (
        amount.toString() ===
        amountFormatter(balanceComputed, bond.assetDecimals)
      ) {
        value = balance
      }
      return value
    }
  }, [amount, decimalsExp, exchangeRate, balanceComputed, bond, balance])

  useEffect(() => {
    setAmount('')
  }, [tokenAddress])

  const [inputError, setInputError] = useState()
  useEffect(() => {
    if (cTokenAmount) {
      if (cTokenAmount.gt(balance)) {
        setInputError(t('insufficientBalance'))
      } else {
        setInputError()
      }
    }
  }, [balance, cTokenAmount, t])

  const [isPending, setIsPending] = useState(false)
  const { getPrice } = useGasPrice()
  const onWithdraw = useCallback(async () => {
    if (
      cTokenAmount &&
      cTokenAmount.lte(balance) &&
      bond.abi &&
      tokenAddress &&
      !isPending
    ) {
      const contract = new library.eth.Contract(bond.abi, tokenAddress)
      const gasPrice = await getPrice()
      const amount = balance.minus(cTokenAmount).lt(0.001)
        ? balance
        : cTokenAmount

      let withdraw
      if (bond.platform === 'Compound') {
        withdraw = contract.methods[WITHDRAW_METHODS[bond.platform]](
          amount.toFixed(0),
        )
      } else if (bond.platform === 'Fulcrum') {
        withdraw = contract.methods[WITHDRAW_METHODS[bond.platform]](
          account,
          amount.toFixed(0),
        )
      } else if (bond.platform === 'MakerDAO') {
        withdraw = contract.methods[WITHDRAW_METHODS[bond.platform]](
          account,
          amount.toFixed(0),
        )
      } else if (bond.platform === 'AAVE') {
        withdraw = contract.methods[WITHDRAW_METHODS[bond.platform]](
          amount.toFixed(0),
        )
      }

      withdraw
        .send({
          from: account,
          gas: WITHDRAW_GASES[bond.platform],
          gasPrice,
        })
        .on('transactionHash', () => {
          setIsPending(true)
        })
        .on('confirmation', confirmationNumber => {
          if (confirmationNumber === 1) {
            setIsPending(false)
          }
        })
        .on('error', () => {
          setIsPending(false)
        })
    }
    onSubmit()
    ReactGA.event({
      category: 'Withdraw',
      action: `Withdraw-${tokenAddress}`,
    })
  }, [
    account,
    balance,
    cTokenAmount,
    getPrice,
    isPending,
    library,
    onSubmit,
    bond,
    tokenAddress,
  ])

  return (
    <form>
      <BalanceWrapper>
        <Label>{t('assetBalance')}</Label>
        <BalanceValue>
          {balanceComputed
            ? amountFormatter(balanceComputed, bond.assetDecimals)
            : '-'}
          <BalanceUnit>{bond.asset}</BalanceUnit>
        </BalanceValue>
      </BalanceWrapper>
      <InputWrapper>
        <LabelWrapper>
          <Label>{t('withdraw')}</Label>
          <MaxButton
            onClick={() =>
              setAmount(amountFormatter(balanceComputed, bond.assetDecimals))
            }
          >
            Max
          </MaxButton>
        </LabelWrapper>
        <NumberInput
          value={amount}
          onChange={event => setAmount(event.target.value)}
        />
        <ErrorCaption>{inputError}</ErrorCaption>
      </InputWrapper>
      <WithdrawButton
        onClick={onWithdraw}
        disabled={!amount || amount === '0' || !!inputError || isPending}
      >
        {isPending ? <StyledLoadingIcon /> : t('withdraw')}
      </WithdrawButton>
    </form>
  )
}
