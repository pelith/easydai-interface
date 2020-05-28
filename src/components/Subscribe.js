import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from 'react-responsive'
import styled from 'styled-components'

const SubscribeForm = styled.form`
  justify-content: center;
  align-items: center;
`

const BaseInput = styled.input`
  height: 40px;
  font-size: 13px;
  font-weight: 500;
  border: 0px;
  border-radius: 3px;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: center;
  letter-spacing: 1px;
  background-color: #fff;
`

const PcInput = styled(BaseInput)`
  margin: 32px 0 0 18px;
  width: 230px;
`

const MobileInput = styled(BaseInput)`
  width: 100%;
`

const BaseButton = styled.button`
  height: 40px;
  border: 1px solid;
  border-radius: 40px;
  border-color: ${({ theme }) => theme.colors.ultramarineBlue};
  font-size: 13px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.notoSans};
  letter-spacing: 1px;
  cursor: pointer;

  &:focus {
    outline: none;
  }
  background-color: ${({ theme }) => theme.colors.backgroundColor};
  color: ${({ theme }) => theme.colors.ultramarineBlue};
`

const PcButton = styled(BaseButton)`
  margin: 12px 0 0 18px;
  width: 230px;
`

const MobileButton = styled(BaseButton)`
  margin: 12px 0 0 0;
  width: 100%;
`

export default function Subscribe() {
  const [email, setEmail] = useState('')
  const isDesktopOrLaptop = useMediaQuery({ minDeviceWidth: 1124 })
  const { t } = useTranslation()

  if (isDesktopOrLaptop) {
    return (
      <SubscribeForm
        action='https://pelith.us4.list-manage.com/subscribe/post?u=60cf2da2a9c95713630d04bf4&amp;id=d9f24cce24'
        method='post'
        id='mc-embedded-subscribe-form'
        name='mc-embedded-subscribe-form'
        className='validate'
        target='_blank'
      >
        <PcInput
          type='email'
          value={email}
          onChange={event => setEmail(event.target.value)}
          name='EMAIL'
          className='email'
          id='mce-EMAIL'
          placeholder='Email'
          required
        />
        <PcButton name='subscribe' id='mc-embedded-subscribe'>
          {t('subscribe')}
        </PcButton>
      </SubscribeForm>
    )
  } else {
    return (
      <SubscribeForm
        action='https://pelith.us4.list-manage.com/subscribe/post?u=60cf2da2a9c95713630d04bf4&amp;id=d9f24cce24'
        method='post'
        id='mc-embedded-subscribe-form'
        name='mc-embedded-subscribe-form'
        className='validate'
        target='_blank'
      >
        <MobileInput
          type='email'
          value={email}
          onChange={event => setEmail(event.target.value)}
          name='EMAIL'
          className='email'
          id='mce-EMAIL'
          placeholder='Email'
          required
        />
        <MobileButton name='subscribe' id='mc-embedded-subscribe'>
          {t('subscribe')}
        </MobileButton>
      </SubscribeForm>
    )
  }
}
