import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useDialogsContext, WALLET } from '../contexts/Dialogs'
import TokenLogo from './TokenLogo'
import { ReactComponent as LoadingIcon } from '../assets/loading.svg'
import { shortenAddress, amountFormatter } from '../utils'

const DocumentWrapper = styled.div`
  margin-bottom: 40px;
  width: 100%;
  border-radius: 6px;
  border-top: 4px solid
    ${({ isActive, theme }) =>
      isActive ? theme.colors.ultramarineBlue : theme.colors.blueGray200};
  box-shadow: 0 2px 6px 0 rgba(51, 94, 155, 0.15),
    0 -2px 20px -4px rgba(103, 150, 215, 0.1);

  > *:first-child {
    border-radius: 6px 6px 0 0;
  }

  > *:last-child {
    border-radius: 0 0 6px 6px;
  }

  > *:not(:first-child) {
    border-top: 2px solid ${({ theme }) => theme.colors.blue50};
  }
`

const DocumentOutput = styled.div`
  width: 100%;
  padding: 32px 24px;
  background-color: ${({ theme }) => theme.colors.white};

  ${({ theme }) => theme.mediaQuery.md`
    padding: 56px 64px;
    display: flex;
    align-items: center;
  `}
`

const DocumentDetails = styled.div`
  width: 100%;
  padding: 32px 24px;
  background-color: ${({ theme }) => theme.colors.white};

  ${({ theme }) => theme.mediaQuery.md`
    padding: 56px 64px;
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
    width: 40px;
    height: 40px;
  }

  ${({ theme }) => theme.mediaQuery.md`
    width: 68px;
    height: 68px;
    margin-right: 32px;
    border-radius: 34px;

    > img {
      width: 52px;
      height: 52px;
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
`

const OutputValue = styled.div`
  flex: 1%;
  margin-top: 24px;
  color: ${({ isActive, theme }) =>
    isActive ? theme.colors.blueGray900 : theme.colors.blueGray200};
  font-size: 30px;
  font-family: ${({ theme }) => theme.fontFamilies.roboto};
  text-align: center;

  ${({ theme }) => theme.mediaQuery.md`
    margin: 0;
    font-size: 38px;
  `}
`

const Paragraph = styled.p`
  margin: 0;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.textColor};
  font-size: 16px;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
`

const Bold = styled.span`
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.roboto};
  letter-spacing: 1px;
`

const WarningText = styled.div`
  margin-top: 20px;
  font-size: 14px;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  color: ${({ theme }) => theme.colors.textColor};
  letter-spacing: 1px;
  text-align: center;
`

const ErrorText = styled.div`
  margin-top: 20px;
  font-size: 14px;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  color: ${({ theme }) => theme.colors.mahogany};
  letter-spacing: 1px;
  text-align: center;
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

const Button = styled.button`
  width: 100%;
  max-width: 300px;
  height: 48px;
  margin: 56px auto 0 auto;
  border: none;
  border-radius: 24px;
  padding: 0;
  background-color: ${({ theme, isLoading }) =>
    isLoading ? theme.colors.backgroundColor : theme.colors.ultramarineBlue};
  color: ${({ theme, isLoading }) =>
    isLoading ? theme.colors.ultramarineBlue : theme.colors.white};
  font-size: 16px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${({ isLoading }) => (isLoading ? 'not-allowed' : 'pointer')};

  > *:not(:first-child) {
    margin-left: 8px;
  }

  &:focus {
    outline: none;
  }

  &[disabled] {
    background-color: ${({ theme }) => theme.colors.perano};
    cursor: not-allowed;
  }

  ${({ theme }) => theme.mediaQuery.md`
    margin: 80px auto 0 auto;
  `}
`

const StyledLoadingIcon = styled(LoadingIcon)`
  width: 20px;
  height: 20px;
  fill: ${({ theme }) => theme.colors.ultramarineBlue};
`

export default function LendingDocument(props) {
  const {
    tokenName,
    tokenPlatform,
    tokenDecimals,
    account,
    amount,
    exchangeRate,
    estimatedEarned,
    error,
    isSubmiting,
    onSubmit,
  } = props

  const { t } = useTranslation()
  const [, { open }] = useDialogsContext()

  const isActive = useMemo(() => amount && tokenName, [amount, tokenName])

  return (
    <DocumentWrapper isActive={isActive}>
      <DocumentOutput>
        <Label>
          <LabelIconWrapper>
            <TokenLogo name={tokenName} />
          </LabelIconWrapper>
          <LabelText>
            <Title>{tokenName.toUpperCase()}</Title>
            <SubTitle>
              {exchangeRate
                ? `1 ETH = ${amountFormatter(
                    exchangeRate,
                    tokenDecimals,
                    2,
                  )} ${tokenName}`
                : `${t('exchangeRate')} -`}
            </SubTitle>
          </LabelText>
        </Label>
        <OutputValue isActive={isActive}>
          {amount ? amountFormatter(amount, tokenDecimals, 2) : '0.00'}
        </OutputValue>
      </DocumentOutput>
      <DocumentDetails>
        <Paragraph>
          {t('lendingPlatform')} <Bold>{tokenPlatform}</Bold>
        </Paragraph>
        <Paragraph>
          {t('lender')} ({t('your', { something: t('address') })}){' '}
          <Bold>{account ? shortenAddress(account, 4) : '-'}</Bold>
        </Paragraph>
        <Paragraph>
          {t('estimatedInterestMessage')}{' '}
          {estimatedEarned ? (
            <Bold>
              {amountFormatter(estimatedEarned, tokenDecimals)} {tokenName}
            </Bold>
          ) : (
            '-'
          )}
        </Paragraph>
        <Button
          onClick={onSubmit}
          disabled={!account || error}
          isLoading={isSubmiting}
        >
          {isSubmiting ? (
            <>
              <StyledLoadingIcon />
              <span>{t('loading')}...</span>
            </>
          ) : (
            t('lend')
          )}
        </Button>
        {!account && (
          <WarningText>
            {t('please')}{' '}
            <StrongSpan onClick={() => open(WALLET)}>{t('login')}</StrongSpan>{' '}
            {t('toLend')}
          </WarningText>
        )}
        {error && <ErrorText>{error}</ErrorText>}
      </DocumentDetails>
    </DocumentWrapper>
  )
}
