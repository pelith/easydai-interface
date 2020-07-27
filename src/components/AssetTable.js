import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from 'react-responsive'
import useCollapse from 'react-collapsed'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import TokenLogo from './TokenLogo'
import { ReactComponent as ArrowDownwardIcon } from '../assets/arrow_downward.svg'
import { ReactComponent as DropdownIcon } from '../assets/dropdown.svg'

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

const StyledArrowDownwardIcon = styled(({ active, direction, ...props }) => (
  <ArrowDownwardIcon {...props} />
))`
  width: 18px;
  height: 18px;
  color: ${({ theme }) => theme.colors.blueGray400};
  opacity: ${({ active }) => (active ? 1 : 0)};
  transform: rotate(
    ${({ direction }) => (direction === 'asc' ? '180deg' : '0deg')}
  );
  transition: all 0.3s;
`

const SortButton = styled.button.attrs({ type: 'button' })`
  border: 0;
  background-color: transparent;
  padding: 0;
  color: ${({ theme }) => theme.colors.blueGray400};
  font-size: 12px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  &:hover {
    ${StyledArrowDownwardIcon} {
      opacity: 1;
    }
  }

  &:focus {
    outline: none;
  }
`

function TableSortLabel(props) {
  const {
    children = '',
    active = false,
    direction = 'asc',
    onClick = () => {},
  } = props

  return (
    <SortButton onClick={onClick}>
      {children}
      <StyledArrowDownwardIcon active={active} direction={direction} />
    </SortButton>
  )
}

export default function AssetTable(props) {
  const { data } = props

  const { t } = useTranslation()

  const isDesktopOrTablet = useMediaQuery({ minDeviceWidth: 768 })

  const [order, setOrder] = useState('desc')
  const [orderBy, setOrderBy] = useState('apr')

  const handleRequestSort = property => {
    const isDesc = orderBy === property && order === 'desc'
    setOrder(isDesc ? 'asc' : 'desc')
    setOrderBy(property)
  }

  const headCells = [
    { id: 'apr', label: t('apr') },
    { id: 'balance', label: t('balance') },
    { id: 'earned', label: t('interestAccrued') },
  ]

  const rows = data.sort((a, b) =>
    order === 'asc' ? a[orderBy] - b[orderBy] : b[orderBy] - a[orderBy],
  )

  if (isDesktopOrTablet) {
    return (
      <Table>
        <thead>
          <tr>
            <th>{t('token')}</th>
            {headCells.map(headCell => (
              <th key={headCell.id}>
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={order}
                  onClick={() => handleRequestSort(headCell.id)}
                >
                  {headCell.label}
                </TableSortLabel>
              </th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <TableRow key={`${row.tokenName}-${index}`} {...row} />
          ))}
        </tbody>
      </Table>
    )
  } else {
    return (
      <>
        {rows.map((row, index) => (
          <ExpandableRow key={`${row.tokenName}-${index}`} {...row} />
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
  const { tokenName, tokenPlatform, apr, balance, earned } = props

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
        <TokenAPR>{`${(apr * 100).toFixed(2)} %`}</TokenAPR>
      </td>
      <td>
        <TokenValue>{balance ? balance.toFixed(6) : '-'}</TokenValue>
      </td>
      <td>
        <TokenValue>{earned ? earned.toFixed(6) : '-'}</TokenValue>
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
  const { tokenName, tokenPlatform, apr, balance, earned } = props

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
          <TokenAPR>{`${(apr * 100).toFixed(2)} %`}</TokenAPR>
          <DropIconWrapper isOpen={isOpen}>
            <DropdownIcon />
          </DropIconWrapper>
        </ItemRight>
      </Item>
      <ItemDetails {...getCollapseProps()}>
        <ItemProperty>
          <ItemTitle>{t('assetBalance')}</ItemTitle>
          <TokenValue>
            {balance ? balance.toFixed(6) : 0}
            <TokenUnit>{tokenName}</TokenUnit>
          </TokenValue>
        </ItemProperty>
        <ItemProperty>
          <ItemTitle>{t('interestAccrued')}</ItemTitle>
          <TokenValue>
            {earned ? earned.toFixed(6) : 0}
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
