import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useWeb3React } from '@web3-react/core'
import { gql, useQuery } from '@apollo/client'
import styled from 'styled-components'
import { useAllBondDetails } from '../contexts/Bonds'
import AssetTable from '../components/AssetTable'
import BigNumber from 'bignumber.js'

const Container = styled.div`
  width: 100%;

  > *:not(:first-child) {
    margin-top: 40px;
  }
`

const Card = styled.div`
  width: 100%;
  border-radius: 12px;
  padding: 24px 32px;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 3px 14px 0 rgba(185, 209, 221, 0.5);

  ${({ theme }) => theme.mediaQuery.md`
    padding: 24px 48px;
  `}
`

const CardTitle = styled.div`
  font-size: 18px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  color: ${({ theme }) => theme.colors.textColor};
`

const CardContent = styled.div`
  margin-top: 16px;
`

const GET_MARKETS = gql`
  query GetMarkets {
    markets {
      id
      supplyRate
      exchangeRate
    }
  }
`

const GET_ACCOUNT_BONDS = gql`
  query GetAccountBonds($account: String!) {
    account(id: $account) {
      id
      bonds {
        id
        normalizedBalance
        totalUnderlyingSupplied
        totalUnderlyingRedeemed
        market {
          id
          exchangeRate
        }
      }
    }
  }
`

export default function Overview() {
  const { t } = useTranslation()

  const { account } = useWeb3React()

  const { data: marketsData } = useQuery(GET_MARKETS)
  const { data: accountData } = useQuery(GET_ACCOUNT_BONDS, {
    variables: { account: (account || '').toLowerCase() },
  })
  console.log(accountData)

  const allBonds = useAllBondDetails()

  const assets = useMemo(() => {
    return Object.keys(allBonds).map(tokenAddress => {
      const apr = marketsData
        ? marketsData.markets.filter(
            market => market.id.toLowerCase() === tokenAddress.toLowerCase(),
          )[0].supplyRate
        : null

      let balance, earned
      if (accountData && accountData.account) {
        const accountBond = accountData.account.bonds.filter(
          bond => bond.market.id.toLowerCase() === tokenAddress.toLowerCase(),
        )[0]
        balance = new BigNumber(accountBond.normalizedBalance).times(
          accountBond.market.exchangeRate,
        )
        earned = new BigNumber(accountBond.totalUnderlyingRedeemed)
          .minus(accountBond.totalUnderlyingSupplied)
          .plus(balance)
      }

      return {
        tokenName: allBonds[tokenAddress].asset,
        tokenPlatform: allBonds[tokenAddress].platform,
        tokenDecimals: allBonds[tokenAddress].assetDecimals,
        apr,
        balance,
        earned,
      }
    })
  }, [accountData, allBonds, marketsData])

  const holdingAssets = useMemo(
    () => assets.filter(asset => asset.balance && !asset.balance.isZero()),
    [assets],
  )

  const otherAssets = useMemo(
    () => assets.filter(asset => !asset.balance || asset.balance.isZero()),
    [assets],
  )

  return (
    <Container>
      {!!holdingAssets.length && (
        <Card>
          <CardTitle>{t('holdingAssets')}</CardTitle>
          <CardContent>
            <AssetTable data={holdingAssets} />
          </CardContent>
        </Card>
      )}
      <Card>
        <CardTitle>
          {!!holdingAssets.length
            ? t('otherOppertunities')
            : t('allOppertunities')}
        </CardTitle>
        <CardContent>
          <AssetTable data={otherAssets} />
        </CardContent>
      </Card>
    </Container>
  )
}
