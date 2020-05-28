import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Dialog from './Dialog'
import { ReactComponent as RegisteredIcon } from '../../assets/registered.svg'

const Container = styled.div`
  padding: 0 32px;
  display: flex;
  flex-direction: column;
`

const RegisteredIconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const Headline = styled.div`
  font-size: 18px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textColor};
`

const Message = styled.div`
  margin-top: 20px;
  margin-bottom: 40px;
  font-size: 14px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textColor};
`

const Button = styled.button`
  width: 100%;
  height: 40px;
  margin-bottom: 32px;
  border: none;
  border-radius: 20px;
  padding: 0;
  background-color: ${({ theme }) => theme.colors.ultramarineBlue};
  color: ${({ theme }) => theme.colors.white};
  font-size: 13px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`

export default function CreateSuccessDialog(props) {
  const { isOpen, onDismiss, onStart } = props
  const { t } = useTranslation()

  return (
    <Dialog isOpen={isOpen} onDismiss={onDismiss}>
      <Container>
        <RegisteredIconWrapper>
          <RegisteredIcon />
        </RegisteredIconWrapper>
        <Headline>{t('createSuccess')}</Headline>
        <Message>{t('createSuccessMessage')}</Message>
        <Button onClick={onStart}>{t('startNow')}</Button>
      </Container>
    </Dialog>
  )
}
