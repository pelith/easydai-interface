import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useDialogsContext, WITHDRAW, WALLET } from '../contexts/Dialogs'
import { ReactComponent as WithDrawIcon } from '../assets/withdraw.svg'
import { amountFormatter } from '../utils'
import FlipNumbers from './flipNumber'

const Container = styled.div`
  position: relative;
  width: 100%;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.white};
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.mediaQuery.md`
    padding: 10px;
    flex-direction: row;
    justify-content: space-around;
  `}
`

const Divider = styled.div`
  width: calc(100% - 48px);
  height: 2px;
  margin: 0 auto;
  border-radius: 1px;
  background-color: ${({ theme }) => theme.colors.blue50};

  ${({ theme }) => theme.mediaQuery.md`
    width: 2px;
    height: 60px;
    margin: auto 0;
  `}
`

const Item = styled.div`
  width: 100%;
  flex: 1;
  padding: 24px;

  > *:not(:first-child) {
    margin-top: 12px;
  }

  ${({ theme }) => theme.mediaQuery.md`
    max-width: 300px;
  `}
`

const ItemHeader = styled.div`
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ItemBody = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.overlayColor};
  display: flex;
  justify-content: center;
  align-items: center;
`

const OverlayText = styled.div`
  font-size: 14px;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  color: ${({ theme }) => theme.colors.blue900};
  letter-spacing: 1px;
`

const StrongSpan = styled.button`
  border: none;
  padding: 0;
  background-color: transparent;
  font-size: 14px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  color: ${({ theme }) => theme.colors.ultramarineBlue};
  letter-spacing: 1px;
  cursor: pointer;

  &:focus {
    outline: none;
  }
`

const Title = styled.div`
  font-size: 16px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  color: ${({ theme }) => theme.colors.blue500};
  letter-spacing: 3px;
`

const ValueText = styled.div`
  font-size: 26px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.barlow};
  color: ${({ theme }) => theme.colors.blue900};
  display: flex;

  > *:not(:first-child) {
    margin-left: 4px;
  }
`

const UnitText = styled.div`
  font-size: 18px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.barlow};
  color: ${({ theme }) => theme.colors.blueGray400};
  text-transform: uppercase;
`

const WithdrawButton = styled.button`
  padding: 4px 14px;
  border-radius: 16px;
  border: 1px solid
    ${({ disabled, theme }) =>
      disabled ? theme.colors.blueGray100 : theme.colors.anzac};
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.blueGray100 : theme.colors.reefGold};
  background-color: ${({ disabled, theme }) =>
    disabled ? theme.colors.blueGray50 : theme.colors.oasis};
  font-size: 12px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:focus {
    outline: none;
  }

  > svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }

  > *:not(:first-child) {
    margin-left: 6px;
  }
`

export default function FinancialStatement(props) {
  const { tokenName, tokenDecimals, balance, profit, earned, isBlock } = props
  const { t } = useTranslation()
  const [, { open }] = useDialogsContext()

  return (
    <Container>
      <Item>
        <ItemHeader>
          <Title>{t('assetBalance')}</Title>
          <WithdrawButton onClick={() => open(WITHDRAW)}>
            <WithDrawIcon />
            <span>{t('withdraw')}</span>
          </WithdrawButton>
        </ItemHeader>
        <ItemBody>
          <ValueText>
            {balance ? (
              <>
                <span>$</span>
                <FlipNumbers
                  height={25}
                  width={14}
                  play
                  duration={0.8}
                  delay={0.1}
                  numbers={amountFormatter(balance, tokenDecimals)}
                />
              </>
            ) : (
              '-'
            )}
          </ValueText>
          <UnitText>{tokenName}</UnitText>
        </ItemBody>
      </Item>
      <Divider />
      <Item>
        <ItemHeader>
          <Title>{t('profit')}</Title>
        </ItemHeader>
        <ItemBody>
          <ValueText>
            {profit ? (
              <>
                <span>$</span>
                <FlipNumbers
                  height={25}
                  width={14}
                  play
                  duration={0.8}
                  delay={0.1}
                  numbers={amountFormatter(profit, tokenDecimals)}
                />
              </>
            ) : (
              '-'
            )}
          </ValueText>
          <UnitText>{tokenName}</UnitText>
        </ItemBody>
      </Item>
      <Divider />
      <Item>
        <ItemHeader>
          <Title>{t('interestAccrued')}</Title>
        </ItemHeader>
        <ItemBody>
          <ValueText>
            {earned ? (
              <>
                <span>$</span>
                <FlipNumbers
                  height={25}
                  width={14}
                  play
                  duration={0.8}
                  delay={0.1}
                  numbers={amountFormatter(earned, tokenDecimals)}
                />
              </>
            ) : (
              '-'
            )}
          </ValueText>
          <UnitText>{tokenName}</UnitText>
        </ItemBody>
      </Item>
      {isBlock && (
        <Overlay>
          <OverlayText>
            {t('please')}{' '}
            <StrongSpan onClick={() => open(WALLET)}>{t('login')}</StrongSpan>{' '}
            {t('toDisplayContent')}
          </OverlayText>
        </Overlay>
      )}
    </Container>
  )
}
