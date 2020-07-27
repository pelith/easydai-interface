import React, { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import { gql, useQuery } from '@apollo/client'
import styled from 'styled-components'

import { useBondByAssetAndPlatform } from '../contexts/Bonds'
import TokenLogo from './TokenLogo'
import AssetList from './AssetList'
import Subscribe from './Subscribe'
import { ReactComponent as OverviewIcon } from '../assets/overview.svg'
import { ReactComponent as SelectorIcon } from '../assets/selector.svg'
import { ReactComponent as CloseIcon } from '../assets/close.svg'

const SelectorButton = styled.button`
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 6px;
  padding: 0 24px;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 2px 6px 0 rgba(51, 94, 155, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;

  &:focus {
    outline: none;
  }
`

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
`

const TokenName = styled.div`
  margin-left: 12px;
  font-size: 14px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.barlow};
  color: ${({ theme }) => theme.colors.blue900};

  ${({ theme }) => theme.mediaQuery.sm`
    font-size: 18px;
  `}
`

const TokenPlatform = styled.div`
  margin-left: 8px;
  font-size: 14px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.barlow};
  color: ${({ theme }) => theme.colors.blue900};

  ${({ theme }) => theme.mediaQuery.sm`
    font-size: 18px;
  `}
`

const TokenAPR = styled.div`
  margin-left: 16px;
  font-size: 14px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.roboto};
  color: ${({ theme }) => theme.colors.blue900};

  ${({ theme }) => theme.mediaQuery.sm`
    font-size: 18px;
  `}
`

const StyledSelectorIcon = styled(SelectorIcon)`
  width: 28px;
  height: 28px;
`

const Dialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 90;
  width: 100vw;
  height: 100vh;
  padding-bottom: 36px;
  background-color: ${({ theme }) => theme.colors.white};
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  overflow: auto;
`

const DialogHeader = styled.div`
  padding: 36px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const DialogBody = styled.div`
  padding: 0 24px;
`

const DialogTitle = styled.div`
  font-size: 14px;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  color: ${({ theme }) => theme.colors.blueGray500};
`

const CloseButton = styled.button`
  border: none;
  padding: 0;
  background-color: transparent;

  &:focus {
    outline: none;
  }
`

const StyledTokenLogo = styled(TokenLogo)`
  width: 28px;
  height: 28px;
`

const StyledCloseIcon = styled(CloseIcon)`
  width: 28px;
  height: 28px;
`

const StyledOverviewIcon = styled(OverviewIcon)`
  width: 28px;
  height: 28px;
  fill: ${({ theme }) => theme.colors.ultramarineBlue};
`

const GET_MARKET = gql`
  query GetMarket($market: String!) {
    market(id: $market) {
      id
      supplyRate
    }
  }
`

export default function AssetSelector() {
  const { t } = useTranslation()
  const isDesktopOrLaptop = useMediaQuery({ minDeviceWidth: 1124 })

  const { pathname } = useLocation()
  const asset = useMemo(() => pathname.split('/')[1], [pathname])
  const platform = useMemo(() => pathname.split('/')[2], [pathname])

  const bond = useBondByAssetAndPlatform(asset, platform)
  const { data } = useQuery(GET_MARKET, {
    variables: {
      market: bond && bond.address.toLowerCase(),
    },
  })
  const apr = useMemo(() => (data ? data.market.supplyRate : null), [data])

  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    setIsOpen(false)
  }, [asset, platform])

  const renderTitle = () => {
    if (asset === 'overview') {
      return (
        <>
          <StyledOverviewIcon />
          <TokenName>{t('assetsOverview')}</TokenName>
        </>
      )
    } else {
      return (
        <>
          <StyledTokenLogo name={bond.asset} />
          <TokenName>{bond.asset.toUpperCase()}</TokenName>
          <TokenPlatform>></TokenPlatform>
          <TokenPlatform>{bond.platform}</TokenPlatform>
          <TokenAPR>{apr ? `${(apr * 100).toFixed(2)} %` : '-'}</TokenAPR>
        </>
      )
    }
  }

  if (isDesktopOrLaptop) {
    return (
      <>
        <AssetList />
        <Subscribe />
      </>
    )
  } else {
    return (
      <>
        <SelectorButton onClick={() => setIsOpen(true)}>
          <TokenInfo>{renderTitle()}</TokenInfo>
          <StyledSelectorIcon />
        </SelectorButton>
        <Dialog isOpen={isOpen}>
          <DialogHeader>
            <DialogTitle>{t('selectAssets')}</DialogTitle>
            <CloseButton onClick={() => setIsOpen(false)}>
              <StyledCloseIcon />
            </CloseButton>
          </DialogHeader>
          <DialogBody>
            <AssetList />
          </DialogBody>
        </Dialog>
      </>
    )
  }
}
