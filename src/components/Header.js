import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Web3Status from './Web3Status'
import { ReactComponent as LogoIcon } from '../assets/logo.svg'

const HeaderContainer = styled.div`
  height: 100px
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media screen and (min-width: 600px) {
    padding: 0 64px;
  }
`

const HeaderLogo = styled.a`
  color: ${({ theme }) => theme.colors.textColor};
  text-decoration: none;
  display: flex;
  align-items: center;

  > *:not(:first-child) {
    margin-left: 4px;
  }
`

const LogoTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
`

const LogoSubTitle = styled.div`
  font-size: 12px;
  font-weight: 300;
  letter-spacing: ${({ language }) => (language === 'zh' ? '3.5px' : '1.7px')};
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;

  > *:not(:first-child) {
    margin-left: 8px;
  }
`

export default function Header() {
  const { t, i18n } = useTranslation()

  return (
    <HeaderContainer>
      <HeaderLogo href='/'>
        <LogoIcon />
        <div>
          <LogoTitle>{t('easyDai')}</LogoTitle>
          <LogoSubTitle language={i18n.language}>
            {t('oneClickToLend')}
          </LogoSubTitle>
        </div>
      </HeaderLogo>
      <HeaderActions>
        <Web3Status />
      </HeaderActions>
    </HeaderContainer>
  )
}
