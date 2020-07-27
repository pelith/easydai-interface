import React, { useCallback, useMemo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactGA from 'react-ga'
import { useWeb3React } from '@web3-react/core'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'

import { useEtherBalance, useTokenBalance } from '../../contexts/Balances'
import { useGasPrice } from '../../hooks/ethereum'
import {
  InputWrapper,
  LabelWrapper,
  Label,
  TextInput,
  NumberInput,
  ErrorCaption,
  Select,
  MaxButton,
  Button,
} from './formStyles'
import { ReactComponent as LoadingIcon } from '../../assets/loading.svg'
import { isAddress, getContract } from '../../utils'
import {
  SAI_ADDRESS,
  SAI_DECIMALS,
  USDC_ADDRESS,
  USDC_DECIMALS,
  ETH_DECIMALS,
} from '../../constants'
import ERC20_ABI from '../../constants/abis/erc20.json'

const CancelButton = styled.button.attrs(() => ({ type: 'button' }))`
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 20px;
  padding: 0;
  background-color: ${({ theme }) => theme.colors.blueGray50};
  font-size: 13px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`

const StyledLoadingIcon = styled(LoadingIcon)`
  width: 20px;
  height: 20px;
`

export default function TransferForm(props) {
  const { onSubmit = () => {}, onCancel = () => {} } = props
  const { t } = useTranslation()

  const { account, library } = useWeb3React()

  const [address, setAddress] = useState('')
  const [tokenAddress, setTokenAddress] = useState('ETH')
  const [amount, setAmount] = useState('')

  const amountParsed = useMemo(() => {
    switch (tokenAddress) {
      case 'ETH': {
        return new BigNumber(amount).shiftedBy(ETH_DECIMALS)
      }
      case SAI_ADDRESS: {
        return new BigNumber(amount).shiftedBy(SAI_DECIMALS)
      }
      case USDC_ADDRESS: {
        return new BigNumber(amount).shiftedBy(USDC_DECIMALS)
      }
      default: {
        return null
      }
    }
  }, [amount, tokenAddress])

  const etherBalance = useEtherBalance(account)
  const tokenBalance = useTokenBalance(tokenAddress, account)
  const balance = useMemo(
    () => (tokenAddress === 'ETH' ? etherBalance : tokenBalance),
    [etherBalance, tokenAddress, tokenBalance],
  )
  const balanceComputed = useMemo(() => {
    if (balance) {
      switch (tokenAddress) {
        case 'ETH': {
          return balance.shiftedBy(-ETH_DECIMALS)
        }
        case SAI_ADDRESS: {
          return balance.shiftedBy(-SAI_DECIMALS)
        }
        case USDC_ADDRESS: {
          return balance.shiftedBy(-USDC_DECIMALS)
        }
        default: {
          return null
        }
      }
    } else {
      return null
    }
  }, [balance, tokenAddress])

  const [addressError, setAddressError] = useState()
  useEffect(() => {
    if (address && !isAddress(address)) {
      setAddressError(t('addressIsIncorrect'))
    } else {
      setAddressError()
    }
  }, [address, t])

  const [amountError, setAmountError] = useState()
  useEffect(() => {
    if (amountParsed && amountParsed.gt(balance)) {
      setAmountError(t('insufficientBalance'))
    } else {
      setAmountError()
    }
  }, [amountParsed, balance, t])

  const { getPrice } = useGasPrice()
  const [isPending, setIsPending] = useState(false)
  const transfer = useCallback(async () => {
    if (isAddress(account) && amountParsed && !isPending) {
      const gasPrice = await getPrice()
      if (tokenAddress === 'ETH') {
        const value = amountParsed.minus(new BigNumber(31000).times(gasPrice))
        if (value.isNegative()) return false

        try {
          const tx = await library.sendTransaction({
            from: account,
            to: address,
            value: value.toFixed(0),
            gas: 31000,
            gasPrice,
          })
          setIsPending(true)

          await tx.wait()
        } finally {
          setIsPending(false)
        }
      } else {
        const contract = getContract(tokenAddress, ERC20_ABI, library, account)
        try {
          const tx = await contract.transfer(address, amountParsed.toFixed(0), {
            gas: 250000,
            gasPrice,
          })
          setIsPending(true)

          await tx.wait()
        } finally {
          setIsPending(false)
        }
      }
    }
    onSubmit()
    ReactGA.event({
      category: 'Transfer',
      action: `Transfer-${tokenAddress}`,
    })
  }, [
    account,
    address,
    amountParsed,
    getPrice,
    library,
    onSubmit,
    tokenAddress,
    isPending,
  ])

  const cancel = useCallback(() => {
    onCancel()
  }, [onCancel])

  return (
    <form>
      <InputWrapper>
        <LabelWrapper>
          <Label>{t('toAddress')}</Label>
        </LabelWrapper>
        <TextInput
          placeholder='0x1234...'
          value={address}
          onChange={event => setAddress(event.target.value)}
        />
        <ErrorCaption>{addressError}</ErrorCaption>
      </InputWrapper>
      <InputWrapper>
        <LabelWrapper>
          <Label>{t('selectToken')}</Label>
        </LabelWrapper>
        <Select
          value={tokenAddress}
          onChange={event => setTokenAddress(event.target.value)}
        >
          <option value='ETH'>ETH</option>
          <option value={SAI_ADDRESS}>SAI</option>
          <option value={USDC_ADDRESS}>USDC</option>
        </Select>
      </InputWrapper>
      <InputWrapper>
        <LabelWrapper>
          <Label>{t('transferAmount')}</Label>
          <MaxButton onClick={() => setAmount(balanceComputed)}>MAX</MaxButton>
        </LabelWrapper>
        <NumberInput
          value={amount}
          onChange={event => setAmount(event.target.value)}
        />
        <ErrorCaption>{amountError}</ErrorCaption>
      </InputWrapper>
      <Button onClick={transfer}>
        {isPending ? <StyledLoadingIcon /> : t('transferConfirm')}
      </Button>
      <CancelButton onClick={cancel}>{t('cancel')}</CancelButton>
    </form>
  )
}
