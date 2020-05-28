import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import TokenLogo from './TokenLogo'
import { amountFormatter } from '../utils'
import { ETH_DECIMALS } from '../constants'

const Wrapper = styled.div`
  width: 100%;
  border-radius: 6px;
  padding: 32px 24px;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 2px 6px 0 rgba(51, 94, 155, 0.15),
    0 -2px 20px -4px rgba(103, 150, 215, 0.1);

  > *:not(:first-child) {
    margin-top: 24px;
  }

  ${({ theme }) => theme.mediaQuery.md`
    padding: 44px 64px;
    display: flex;
    align-items: center;
  `}
`

const Label = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`

const LabelIconWrapper = styled.div`
  width: 54px;
  height: 54px;
  margin-right: 24px;
  border: 1px solid ${({ theme }) => theme.colors.blueGray300};
  border-radius: 27px;
  display: flex;
  justify-content: center;
  align-items: center;

  > img {
    width: 54px;
    height: 54px;
  }

  ${({ theme }) => theme.mediaQuery.md`
    width: 68px;
    height: 68px;
    margin-right: 32px;
    border-radius: 34px;

    > img {
      width: 68px;
      height: 68px;
    }
  `}
`

const LabelText = styled.div`
  *:not(:first-child) {
    margin-top: 4px;
  }
`

const Title = styled.div`
  font-size: 28px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.barlow};
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.blueGray900};

  ${({ theme }) => theme.mediaQuery.md`
    font-size: 34px;
  `}
`

const SubTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  color: ${({ theme }) => theme.colors.blueGray300};
  cursor: pointer;
`

const NumberInput = styled.input.attrs(() => ({ type: 'number' }))`
  position: relative;
  width: 100%;
  flex: 1;
  border: none;
  border-bottom: 1px solid
    ${({ theme, isError }) =>
      isError ? theme.colors.sunglo : theme.colors.blueGray300};
  padding-bottom: 6px;
  background-color: transparent;
  box-shadow: none;
  color: ${({ theme }) => theme.colors.blueGray900};
  font-size: 30px;
  font-family: ${({ theme }) => theme.fontFamilies.roboto};
  text-align: center;

  &::placeholder {
    color: ${({ theme }) => theme.colors.blueGray200};
  }

  &:focus {
    outline: none;
    border-bottom: 1px solid
      ${({ theme, isError }) =>
        isError ? theme.colors.sunglo : theme.colors.ultramarineBlue};
  }

  ${({ theme }) => theme.mediaQuery.md`
    margin: 0;
    font-size: 38px;
  `}
`

export default function EtherInput(props) {
  const { etherBalance, error, onClickBalance, ...inputProps } = props
  const { t } = useTranslation()

  return (
    <Wrapper>
      <Label>
        <LabelIconWrapper>
          <TokenLogo name='ETH' />
        </LabelIconWrapper>
        <LabelText>
          <Title>ETH</Title>
          <SubTitle onClick={onClickBalance}>
            {etherBalance
              ? amountFormatter(etherBalance, ETH_DECIMALS)
              : '0.00'}{' '}
            {t('availableBalance')}
          </SubTitle>
        </LabelText>
      </Label>
      <NumberInput isError={!!error} {...inputProps} />
    </Wrapper>
  )
}
