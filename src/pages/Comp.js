import React, { useCallback, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { transparentize } from 'polished'
import { useGasPrice, useWeb3React } from '../hooks/ethereum'
import BigNumber from 'bignumber.js'
import { isAddress, getContract, amountFormatter } from '../utils'
import {
  COMPTROLLER_ADDRESS,
  CBAT_ADDRESS,
  CDAI_ADDRESS,
  CETH_ADDRESS,
  CREP_ADDRESS,
  CUSDC_ADDRESS,
  CUSDT_ADDRESS,
  CWBTC_ADDRESS,
  CZRX_ADDRESS,
} from '../constants'
import COMPTROLLER_ABI from '../constants/abis/comptroller.json'
import CTOKEN_ABI from '../constants/abis/cToken.json'
import CompImage from '../assets/tokens/COMP.png'

const Container = styled.section`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`

const Card = styled.article`
  width: 90%;
  max-width: 400px;
  margin: 100px auto;
  padding: 16px;
  border: 1.5px solid ${({ theme }) => theme.colors.blueGray100};
  border-top: 4px solid ${({ theme }) => theme.colors.anzac};
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 4px 10px 0
      ${({ theme }) => transparentize(0.9, theme.colors.textColor)},
    0 4px 30px -4px ${({ theme }) => transparentize(0.75, theme.colors.textColor)};
`

const CardImage = styled.img`
  width: 68px;
  height: 68px;
  margin: 32px auto 16px auto;
  display: block;
`

const CardTitle = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 1px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textColor};
`

const CardContent = styled.div`
  padding: 36px 16px;
`

const CardActions = styled.div`
  padding: 12px 38px 32px 38px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const Text = styled.span`
  font-size: 14px;
  letter-spacing: 1px;
  color: ${({ theme }) => theme.colors.textColor};
`

const Number = styled.span`
  font-family: ${({ theme }) => theme.fontFamilies.barlow};
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.textColor};
`

const Symbol = styled.span`
  margin-left: 8px;
  font-family: ${({ theme }) => theme.fontFamilies.barlow};
  font-size: 24px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.blueGray400};
`

const ErrorMessage = styled.div`
  margin-top: 16px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.mahogany};
`

const Button = styled.button.attrs({ type: 'button' })`
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 20px;
  padding: 0;
  background-color: ${({ theme }) => theme.colors.anzac};
  color: ${({ theme }) => theme.colors.white};
  font-size: 13px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  cursor: pointer;

  &:focus {
    outline: none;
  }

  &[disabled] {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

async function getCompEarned(account, library) {
  const comptroller = getContract(COMPTROLLER_ADDRESS, COMPTROLLER_ABI, library)
  const compBalances = await Promise.all([
    comptroller.compAccrued(account),
    ...[
      CBAT_ADDRESS,
      CDAI_ADDRESS,
      CETH_ADDRESS,
      CREP_ADDRESS,
      CUSDC_ADDRESS,
      CUSDT_ADDRESS,
      CWBTC_ADDRESS,
      CZRX_ADDRESS,
    ].map(async cTokenAddress => {
      try {
        const cToken = getContract(cTokenAddress, CTOKEN_ABI, library)
        const [
          compSupplyState,
          compSupplierIndex,
          compBorrowState,
          compBorrowerIndex,
          cTokenBalance,
          cTokenBorrowBalance,
          cTokenBorrowIndex,
        ] = await Promise.all([
          comptroller.compSupplyState(cTokenAddress),
          comptroller.compSupplierIndex(cTokenAddress, account),
          comptroller.compBorrowState(cTokenAddress),
          comptroller.compBorrowerIndex(cTokenAddress, account),
          cToken.balanceOf(account),
          cToken.borrowBalanceStored(account),
          cToken.borrowIndex(),
        ])
        const supplierComp = new BigNumber(compSupplyState.index)
          .minus(new BigNumber(compSupplierIndex))
          .times(new BigNumber(cTokenBalance))
          .div(1e36)
        const borrowerComp = new BigNumber(compBorrowState.index)
          .minus(new BigNumber(compBorrowerIndex))
          .times(
            new BigNumber(cTokenBorrowBalance)
              .times(1e18)
              .div(new BigNumber(cTokenBorrowIndex)),
          )
          .div(1e36)

        return supplierComp.plus(borrowerComp)
      } catch (e) {
        console.log(e)
      }
    }),
  ])

  return BigNumber.sum(...compBalances)
}

export default function Comp() {
  const { library, account } = useWeb3React()
  const { library: libraryReadOnly } = useWeb3React()
  const { t } = useTranslation()

  const [amount, setAmount] = useState()
  useEffect(() => {
    let stale = false
    if (account && isAddress(account) && libraryReadOnly) {
      getCompEarned(account, libraryReadOnly)
        .then(result => {
          if (!stale) {
            setAmount(new BigNumber(result))
          }
        })
        .catch(() => {
          if (!stale) {
            setAmount()
          }
        })
    }
    return () => {
      stale = true
    }
  }, [account, libraryReadOnly])

  const [isPending, setIsPending] = useState(false)
  const [claimError, setClaimError] = useState()
  const { getPrice } = useGasPrice()
  const onClaim = useCallback(async () => {
    if (account && isAddress(account) && library) {
      const contract = getContract(
        COMPTROLLER_ADDRESS,
        COMPTROLLER_ABI,
        library,
        account,
      )

      try {
        const gasPrice = await getPrice()
        const estimatedGas = await contract.estimateGas.claimComp(account)
        const tx = await contract.claimComp(account, {
          gasPrice,
          gas: estimatedGas,
        })
        setClaimError()
        setIsPending(true)
        await tx.wait()
      } catch (err) {
        setClaimError(err.message)
      } finally {
        setIsPending(false)
      }

      return () => {
        setClaimError()
        setIsPending(false)
      }
    }
  }, [account, getPrice, library])

  const noAccountError = !account && t('noAccountError')
  const error = noAccountError || claimError

  return (
    <Container>
      <Card>
        <CardImage src={CompImage} alt='icon token comp' />
        <CardTitle>{t('collectCOMP')}</CardTitle>
        <CardContent>
          <Row>
            <Text>{t('collectableAmount')}</Text>
            <div>
              <Number>{amount ? amountFormatter(amount, 18, 4) : '-'}</Number>
              <Symbol>COMP</Symbol>
            </div>
          </Row>
        </CardContent>
        <CardActions>
          <Button disabled={isPending || !!error} onClick={onClaim}>
            {t('collect')}
          </Button>
          <ErrorMessage>{error}</ErrorMessage>
        </CardActions>
      </Card>
    </Container>
  )
}
