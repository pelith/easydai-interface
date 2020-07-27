import React, { useMemo, useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useCollapse from 'react-collapsed'
import { gql, useQuery } from '@apollo/client'
import styled from 'styled-components'

import { useAllBondDetails } from '../contexts/Bonds'
import TokenLogo from './TokenLogo'
import { ReactComponent as DropdownIcon } from '../assets/dropdown.svg'
import { ReactComponent as OverviewIcon } from '../assets/overview.svg'

const Container = styled.div`
  width: 100%;

  > *:not(:first-child) {
    margin-top: 12px;
  }
`

const ItemGroupButton = styled.button`
  width: 100%;
  height: 48px;
  border: none;
  padding: 0;
  background-color: transparent;
  display: flex;

  align-items: center;
  cursor: pointer;

  &:focus {
    outline: none;
  }
`

const ItemIndicator = styled.div`
  width: 6px;
  height: 32px;
  margin-right: 12px;
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.ultramarineBlue : 'transparent'};
`

const ItemContent = styled.div`
  flex: 1 1;
  height: 48px;
  border-radius: 6px;
  padding: 0 12px;
  background-color: transparent;
  display: flex;
  align-items: center;

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray};
  }
`

const ItemGroupCollapse = styled.section`
  > * {
    margin-left: 18px;
  }

  > *:first-child {
    margin-top: 12px;
  }
`

const ItemIconWrapper = styled.div`
  margin-right: 12px;
  display: flex;
  justify-content: center;
  align-items: center;

  > img {
    width: 28px;
    height: 28px;
  }
`

const ItemGroupTitle = styled.div`
  flex: 1 1;
  font-size: 22px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.barlow};
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.blue900 : theme.colors.blueGray500};
  text-align: left;
`

const ItemGroupValue = styled.div`
  font-size: 18px;
  font-weight: 400;
  font-family: ${({ theme }) => theme.fontFamilies.roboto};
  color: ${({ theme }) => theme.colors.blueGray500};
  opacity: ${({ isActive }) => (isActive ? 0 : 1)};
  transition: opacity 0.3s;
`

const ItemTitle = styled.div`
  flex: 1 1;
  font-size: 18px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.barlow};
  color: ${({ theme }) => theme.colors.blueGray500};
  text-align: left;
`

const ItemValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.roboto};
  color: ${({ theme }) => theme.colors.blueGray500};
`

const activeClassName = 'active'

const ItemNavLink = styled(NavLink).attrs(() => ({
  activeClassName,
}))`
  flex: 1 1;
  text-decoration: none;
  display: block;

  .nav-icon {
    fill: ${({ theme }) => theme.colors.blueGray500};
  }

  &.${activeClassName} {
    .nav-item {
      background-color: ${({ theme }) => theme.colors.gray};
    }

    .nav-icon {
      fill: ${({ theme }) => theme.colors.ultramarineBlue};
    }

    .nav-text {
      color: ${({ theme }) => theme.colors.blue900};
    }
  }
`

const DropIconWrapper = styled.div`
  margin-left: 12px;
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0)')};
  transition: 0.3s transform;
`

const GET_MARKETS = gql`
  query GetMarket {
    markets {
      id
      supplyRate
    }
  }
`

export default function AssetList() {
  const { t } = useTranslation()
  const allBonds = useAllBondDetails()

  const { data } = useQuery(GET_MARKETS)

  const { pathname, search } = useLocation()
  const tokenNameInURL = useMemo(() => pathname.split('/')[1], [pathname])

  const groups = useMemo(() => {
    const bondGroupByAsset = Object.keys(allBonds).reduce(
      (groups, tokenAddress) => {
        const bond = allBonds[tokenAddress]
        const asset = bond.asset
        const platform = bond.platform
        const to = `/${asset.toLowerCase()}/${platform.toLowerCase()}${search}`
        const supplyRate =
          data &&
          data.markets.filter(
            market => market.id.toLowerCase() === tokenAddress.toLowerCase(),
          )[0].supplyRate
        const apr = parseFloat(supplyRate)
        const bonds = groups[asset]
          ? [...groups[asset], { asset, platform, to, apr }]
          : [{ asset, platform, to, apr }]

        return {
          ...groups,
          [asset]: [...bonds],
        }
      },
      {},
    )

    return Object.keys(bondGroupByAsset).map(asset => ({
      tokenName: asset,
      isActive: tokenNameInURL.toLowerCase() === asset.toLowerCase(),
      bonds: bondGroupByAsset[asset],
    }))
  }, [allBonds, data, search, tokenNameInURL])

  return (
    <Container>
      <ItemGroupButton>
        <ItemIndicator isActive={tokenNameInURL.toLowerCase() === 'overview'} />
        <ItemNavLink
          to='/overview'
          isActive={match => !!match && match.isExact}
        >
          <ItemContent className='nav-item'>
            <ItemIconWrapper>
              <OverviewIcon className='nav-icon' />
            </ItemIconWrapper>
            <ItemTitle className='nav-text'>{t('assetsOverview')}</ItemTitle>
          </ItemContent>
        </ItemNavLink>
      </ItemGroupButton>
      {groups.map(group => (
        <ItemGroup key={group.tokenName} {...group} />
      ))}
    </Container>
  )
}

function ItemGroup(props) {
  const { tokenName, isActive, bonds = [] } = props

  const [isOpen, setIsOpen] = useState(isActive)
  const { getCollapseProps, getToggleProps } = useCollapse({ isOpen })

  useEffect(() => {
    setIsOpen(isActive)
  }, [isActive])

  const maxAPR = useMemo(() => Math.max(...bonds.map(bond => bond.apr)), [
    bonds,
  ])

  const renderItems = () => {
    return bonds.map(bond => (
      <ItemNavLink key={bond.to} to={bond.to}>
        <ItemContent className='nav-item'>
          <ItemTitle className='nav-text'>{bond.platform}</ItemTitle>
          <ItemValue className='nav-text'>
            {!isNaN(bond.apr) ? `${(bond.apr * 100).toFixed(2)} %` : '-'}
          </ItemValue>
        </ItemContent>
      </ItemNavLink>
    ))
  }

  return (
    <div style={{ paddingBottom: isOpen ? '12px' : 0 }}>
      <ItemGroupButton
        {...getToggleProps({
          onClick: () => setIsOpen(oldOpen => !oldOpen),
        })}
      >
        <ItemIndicator isActive={isActive} />
        <ItemContent>
          <ItemIconWrapper>
            <TokenLogo name={tokenName} isActive={isActive} />
          </ItemIconWrapper>
          <ItemGroupTitle isActive={isActive}>{tokenName}</ItemGroupTitle>
          <ItemGroupValue isActive={isOpen}>
            {!isNaN(maxAPR) && `${(maxAPR * 100).toFixed(2)} %`}
          </ItemGroupValue>
          <DropIconWrapper isOpen={isOpen}>
            <DropdownIcon />
          </DropIconWrapper>
        </ItemContent>
      </ItemGroupButton>
      <ItemGroupCollapse {...getCollapseProps()}>
        {renderItems()}
      </ItemGroupCollapse>
    </div>
  )
}
