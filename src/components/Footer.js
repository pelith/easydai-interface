import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { ReactComponent as LanguageIcon } from '../assets/language.svg'
import { ReactComponent as DropdownIcon } from '../assets/dropdown.svg'
import { ReactComponent as LineIcon } from '../assets/app_line.svg'
import { ReactComponent as TelegramIcon } from '../assets/app_telegram.svg'
import { ReactComponent as PartnerIcon } from '../assets/partner.svg'

const FooterContainer = styled.div`
  margin-top: 40px;

  ${({ theme }) => theme.mediaQuery.md`
    margin-top: 60px;
  `}
`

const FooterTop = styled.div`
  width: 100%;
  height: 200px;
  padding-top: 56px;
  background-color: ${({ theme }) => theme.colors.offWhite};
`

const FooterBottom = styled.div`
  width: 100%;
  min-height: 40px;
  padding: 8px 16px;
  background-color: ${({ theme }) => theme.colors.blue900};
  color: ${({ theme }) => theme.colors.white};
  font-size: 12px;
  font-weight: 400;
  font-family: ${({ theme }) => theme.fontFamilies.roboto};
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
`

const FooterActions = styled.div`
  width: 90%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
`

const SocialLinks = styled.div`
  display: flex;
  align-items: center;

  > * {
    margin-top: 16px;
  }

  > *:not(:last-child) {
    margin-right: 16px;
  }
`

const OtherLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  > * {
    margin-top: 16px;
  }

  > *:not(:last-child) {
    margin-right: 32px;
  }
`

const ExternalLink = styled.a`
  font-size: 16px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.roboto};
  color: ${({ theme }) => theme.colors.blueGray400};
  text-decoration: none;
  display: flex;
  align-items: center;

  > *:not(:first-child) {
    margin-left: 8px;
  }
`

const InternalLink = styled(Link)`
  font-size: 16px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.roboto};
  color: ${({ theme }) => theme.colors.blueGray400};
  text-decoration: none;
  display: flex;
  align-items: center;
`

const LanguageSelectWrapper = styled.div`
  position: relative;
  width: 108px;
  height: 40px;
  padding: 0 40px;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.blueGray50};
`

const LanguageSelect = styled.select`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  padding: 0 40px;
  border: none;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textColor};
  font-size: 16px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.roboto};
  cursor: pointer;
  -webkit-appearance: none;

  &:focus {
    outline: none;
  }
`

const StyledLanguageIcon = styled(LanguageIcon)`
  position: absolute;
  left: 10px;
  top: 8px;
  width: 24px;
  height: 24px;
`

const StyledLanguageDropdown = styled(DropdownIcon)`
  position: absolute;
  right: 10px;
  top: 10px;
  width: 20px;
  height: 20px;
`

export default function Footer() {
  const { t, i18n } = useTranslation()

  const onSelectLanguage = event => {
    i18n.changeLanguage(event.target.value)
  }

  return (
    <FooterContainer>
      <FooterTop>
        <FooterActions>
          <SocialLinks>
            <LanguageSelectWrapper>
              <StyledLanguageIcon />
              <StyledLanguageDropdown />
              <LanguageSelect value={i18n.language} onChange={onSelectLanguage}>
                <option value='zh'>TW</option>
                <option value='en'>EN</option>
              </LanguageSelect>
            </LanguageSelectWrapper>
            <ExternalLink href='https://t.me/EasyDAI' target='_blank'>
              <TelegramIcon />
            </ExternalLink>
            <ExternalLink href='http://line.me/ti/g/s5xAiiuqTR' target='_blank'>
              <LineIcon />
            </ExternalLink>
          </SocialLinks>
          <OtherLinks>
            <ExternalLink
              href='https://forms.gle/dUJKTCc4eBTTj6ex9'
              target='_blank'
            >
              <PartnerIcon />
              <span>{t('partnershipProgram')}</span>
            </ExternalLink>
            <InternalLink to='/faq'>FAQ</InternalLink>
            <InternalLink to='/'>EasyDAI</InternalLink>
            <ExternalLink href='https://miner.easydai.app' target='_blank'>
              MinerDAI
            </ExternalLink>
            {/* <ExternalLink href='https://migrate.easydai.app' target='_blank'>
              Compound Dai Migration
            </ExternalLink> */}
            <InternalLink to='/comp'>COMP</InternalLink>
          </OtherLinks>
        </FooterActions>
      </FooterTop>
      <FooterBottom>
        This site is protected by reCAPTCHA and the Google Privacy Policy and
        Terms of Service apply.
      </FooterBottom>
    </FooterContainer>
  )
}
