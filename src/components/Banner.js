import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { ReactComponent as CloseIcon } from '../assets/close.svg'

const BannerWrapper = styled.div`
  position: ${({ isOpen }) => (isOpen ? 'sticky' : 'fixed')};
  width: 100vw;
  height: ${({ isOpen }) => (isOpen ? '36px' : 0)};
  top: ${({ isOpen }) => (isOpen ? 0 : '-36px')};
  z-index: 90;
  padding: 0 16px;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 1px 1px 0 #d9e2ec;
  display: flex;
  align-items: center;
  transition: height 0.4s 0.01s, top 0.4s 0.01s;
`

const BannerContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  > *:not(:first-child) {
    margin-left: 12px;
  }
`

const ChipText = styled.div`
  flex-basis: 60px;
  width: 60px;
  height: 20px;
  border-radius: 3px;
  background-color: ${({ theme }) => theme.colors.backgroundColor};
  color: ${({ theme }) => theme.colors.ultramarineBlue};
  font-size: 12px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans}
  text-align: center;
  line-height: 20px;
`

const Text = styled.div`
  font-size: 12px;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  color: ${({ theme }) => theme.colors.blueGray900};
  text-align: center;
`

const ActionLink = styled(Link)`
  font-size: 12px;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  color: ${({ theme }) => theme.colors.ultramarineBlue};
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
`

const BannerCloseButton = styled.button`
  margin-left: 12px;
  border: none;
  padding: 0;
  background-color: transparent;
  cursor: pointer;

  &:focus {
    outline: none;
  }
`

const StyledCloseIcon = styled(CloseIcon)`
  width: 20px;
  height: 20px;
`

export default function Banner() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(true)
  }, [])

  return (
    <BannerWrapper isOpen={isOpen}>
      <BannerContent>
        <ChipText>News!</ChipText>
        <Text>{t('collectCOMPMessage')}</Text>
        <ActionLink to='/comp'>{t('goTo')}</ActionLink>
      </BannerContent>
      <BannerCloseButton onClick={() => setIsOpen(false)}>
        <StyledCloseIcon />
      </BannerCloseButton>
    </BannerWrapper>
  )
}
