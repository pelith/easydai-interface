import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from 'react-responsive'
import useCollapse from 'react-collapsed'
import { Link } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import styled from 'styled-components'

import { useAllBondDetails } from '../contexts/Bonds'
import { useAllBondBalances } from '../contexts/Balances'
import { useAllBondAPRs } from '../contexts/BondAPR'
import { useAllBondExchangeRates } from '../contexts/BondExchangeRates'
import { useAllBondEarned } from '../contexts/BondEarned'
import TokenLogo from './TokenLogo'
import Subscribe from './Subscribe'
import { ReactComponent as DropdownIcon } from '../assets/dropdown.svg'
import { amountFormatter, percentageFormatter } from '../utils'

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

export default function AssetOverview() {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const allBonds = useAllBondDetails()
  const allBalances = useAllBondBalances(account)
  const allAPRs = useAllBondAPRs()
  const allExchangeRates = useAllBondExchangeRates()
  const allEarned = useAllBondEarned(account)
  const isDesktopOrLaptop = useMediaQuery({ minDeviceWidth: 1124 })

  const assets = useMemo(() => {
    return Object.keys(allBonds).map(tokenAddress => ({
      tokenName: allBonds[tokenAddress].asset,
      tokenPlatform: allBonds[tokenAddress].platform,
      tokenDecimals: allBonds[tokenAddress].assetDecimals,
      apr:
        allAPRs && allAPRs[tokenAddress] ? allAPRs[tokenAddress].value : null,
      balance:
        allBalances &&
        allBalances[tokenAddress] &&
        allExchangeRates &&
        allExchangeRates[tokenAddress]
          ? allBalances[tokenAddress].value.times(
              allExchangeRates[tokenAddress].value,
            )
          : null,
      earned:
        allEarned && allEarned[tokenAddress] ? allEarned[tokenAddress] : null,
    }))
  }, [allBonds, allAPRs, allBalances, allExchangeRates, allEarned])

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
            <AssetTable assets={holdingAssets} />
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
          <AssetTable assets={otherAssets} />
        </CardContent>
      </Card>
      {!isDesktopOrLaptop ? <Subscribe /> : ''}
    </Container>
  )
}

/**
 * AssetTable
 */

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  th {
    height: 64px;
    padding: 0 16px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.blueGray200};
    color: ${({ theme }) => theme.colors.blueGray400};
    font-size: 12px;
    font-weight: 500;
    font-family: ${({ theme }) => theme.fontFamilies.notoSans};
    letter-spacing: 1px;
    line-height: 64px;
    text-align: right;

    &:first-child {
      text-align: left;
    }
  }

  td {
    height: 64px;
    padding: 0 16px;
    text-align: right;

    &:first-child {
      text-align: left;
    }
  }
`

function AssetTable(props) {
  const { assets } = props
  const { t } = useTranslation()
  const isDesktopOrTablet = useMediaQuery({ minDeviceWidth: 768 })

  if (isDesktopOrTablet) {
    return (
      <Table>
        <thead>
          <tr>
            <th>{t('token')}</th>
            <th>{t('apr')}</th>
            <th>{t('assetBalance')}</th>
            <th>{t('interestAccrued')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset, index) => (
            <TableRow key={`${asset.tokenName}-${index}`} {...asset} />
          ))}
        </tbody>
      </Table>
    )
  } else {
    return (
      <>
        {assets.map((asset, index) => (
          <ExpandableRow key={`${asset.tokenName}-${index}`} {...asset} />
        ))}
      </>
    )
  }
}

const Item = styled.div`
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;

  &:focus {
    outline: none;
  }
`

const ItemLeft = styled.div`
  display: flex;
  align-items: center;

  > *:not(:first-child) {
    margin-left: 12px;
  }
`

const ItemRight = styled.div`
  display: flex;
  align-items: center;

  > *:not(:first-child) {
    margin-left: 24px;
  }
`

const StyledTokenLogo = styled(TokenLogo)`
  width: 28px;
  height: 28px;
`

const TokenName = styled.div`
  font-size: 12px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.barlow};
  color: ${({ theme }) => theme.colors.blue900};
`

const TokenPlatform = styled.div`
  font-size: 14px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.barlow};
  color: ${({ theme }) => theme.colors.blue900};
`

const TokenAPR = styled.div`
  font-size: 16px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.roboto};
  color: ${({ theme }) => theme.colors.ultramarineBlue};
`

const ItemDetails = styled.section`
  padding-bottom: 24px;
`

const ItemProperty = styled.div`
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ItemTitle = styled.div`
  font-size: 12px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  color: ${({ theme }) => theme.colors.blueGray400};
`

const TokenValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.barlow};
  color: ${({ theme }) => theme.colors.blue900};
`

const TokenUnit = styled.span`
  margin-left: 8px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.blueGray400};
`

const LendButton = styled(Link)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.ultramarineBlue};
  padding-bottom: 1px;
  color: ${({ theme }) => theme.colors.ultramarineBlue};
  font-size: 14px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  text-decoration: none;
`

const DropIconWrapper = styled.div`
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0)')};
  transition: 0.3s transform;
`

function TableRow(props) {
  const {
    tokenName,
    tokenPlatform,
    tokenDecimals,
    apr,
    balance,
    earned,
  } = props

  const { t } = useTranslation()

  return (
    <tr>
      <td>
        <ItemLeft>
          <StyledTokenLogo name={tokenName} />
          <div>
            <TokenName>{tokenName}</TokenName>
            <TokenPlatform>{tokenPlatform}</TokenPlatform>
          </div>
        </ItemLeft>
      </td>
      <td>
        <TokenAPR>{percentageFormatter(apr, 18)}</TokenAPR>
      </td>
      <td>
        <TokenValue>
          {balance ? amountFormatter(balance, tokenDecimals, 6) : 0}
        </TokenValue>
      </td>
      <td>
        <TokenValue>
          {earned ? amountFormatter(earned, tokenDecimals, 6) : 0}
        </TokenValue>
      </td>
      <td>
        <LendButton
          to={`/${tokenName.toLowerCase()}/${tokenPlatform.toLowerCase()}`}
        >
          {t('lendingNow')}
        </LendButton>
      </td>
    </tr>
  )
}

function ExpandableRow(props) {
  const {
    tokenName,
    tokenPlatform,
    tokenDecimals,
    apr,
    balance,
    earned,
  } = props

  const { t } = useTranslation()

  const { getCollapseProps, getToggleProps, isOpen } = useCollapse()

  return (
    <>
      <Item {...getToggleProps()}>
        <ItemLeft>
          <StyledTokenLogo name={tokenName} />
          <div>
            <TokenName>{tokenName}</TokenName>
            <TokenPlatform>{tokenPlatform}</TokenPlatform>
          </div>
        </ItemLeft>
        <ItemRight>
          <TokenAPR>{percentageFormatter(apr, 18)}</TokenAPR>
          <DropIconWrapper isOpen={isOpen}>
            <DropdownIcon />
          </DropIconWrapper>
        </ItemRight>
      </Item>
      <ItemDetails {...getCollapseProps()}>
        <ItemProperty>
          <ItemTitle>{t('assetBalance')}</ItemTitle>
          <TokenValue>
            {balance ? amountFormatter(balance, tokenDecimals, 6) : 0}
            <TokenUnit>{tokenName}</TokenUnit>
          </TokenValue>
        </ItemProperty>
        <ItemProperty>
          <ItemTitle>{t('interestAccrued')}</ItemTitle>
          <TokenValue>
            {earned ? amountFormatter(earned, tokenDecimals, 6) : 0}
            <TokenUnit>{tokenName}</TokenUnit>
          </TokenValue>
        </ItemProperty>
        <ItemProperty>
          <div></div>
          <LendButton
            to={`/${tokenName.toLowerCase()}/${tokenPlatform.toLowerCase()}`}
          >
            {t('lendingNow')}
          </LendButton>
        </ItemProperty>
      </ItemDetails>
    </>
  )
}
