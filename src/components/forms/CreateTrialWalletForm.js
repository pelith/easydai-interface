import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ReactGA from 'react-ga'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import styled from 'styled-components'

import { getNetworkWithSigner } from '../../connectors'
import {
  InputWrapper,
  LabelWrapper,
  Label,
  TextInput,
  PasswordInput,
  CheckboxWrapper,
  Checkbox,
  CheckboxLabel,
  Button,
  ErrorCaption,
} from './formStyles'
import { ReactComponent as LoadingIcon } from '../../assets/loading.svg'
import { validateEmail } from '../../utils'

const ErrorText = styled.div`
  margin-top: 20px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.sunglo};
`

const StyledLoadingIcon = styled(LoadingIcon)`
  width: 20px;
  height: 20px;
`

export default function CreateTrialWalletForm(props) {
  const { onSubmit } = props
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmedPassword, setConfirmedPassword] = useState('')
  const [isKnowledged, setIsKnowledged] = useState(false)
  const [isDeclared, setIsDeclared] = useState(false)
  const [emailError, setEmailError] = useState()
  const [passwordError, setPasswordError] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState()

  useEffect(() => {
    let stale = false
    if (email) {
      if (validateEmail(email)) {
        if (!stale) {
          setEmailError()
        }
      } else {
        if (!stale) {
          setEmailError(t('emailIsIncorrect'))
        }
      }
    }

    return () => {
      stale = true
    }
  }, [email, t])

  useEffect(() => {
    let stale = false
    if (confirmedPassword) {
      if (password === confirmedPassword) {
        if (!stale) {
          setPasswordError()
        }
      } else {
        if (!stale) {
          setPasswordError(t('passwordIsInconsistent'))
        }
      }
    }

    return () => {
      stale = true
    }
  }, [password, confirmedPassword, t])

  const isDisabledButton = useMemo(
    () =>
      !email ||
      !!emailError ||
      (!password || !confirmedPassword || !!passwordError) ||
      (!isKnowledged || !isDeclared) ||
      isLoading,
    [
      email,
      emailError,
      password,
      confirmedPassword,
      passwordError,
      isKnowledged,
      isDeclared,
      isLoading,
    ],
  )

  const { activate } = useWeb3React()

  const createWallet = useCallback(async () => {
    if (!isDisabledButton) {
      setIsLoading(true)
      try {
        const wallet = ethers.Wallet.createRandom()
        const keystore = await wallet.encrypt(password)
        const keystoreBase64 = window.btoa(keystore)
        localStorage.setItem('keystore', keystoreBase64)
        localStorage.setItem('email', email)

        const formData = new FormData()
        formData.append('email', email)
        formData.append('keystore', keystoreBase64)
        formData.append('token', window.gc_token)
        formData.append('locale', localStorage.getItem('i18nextLng'))
        await fetch('https://api.easydai.app/keymail', {
          method: 'POST',
          body: formData,
        })

        await activate(getNetworkWithSigner(wallet.privateKey))

        ReactGA.event({
          category: 'WalletLoggedIn',
          action: 'CreateTrialWallet',
        })
      } catch {
        setError('Error Happened')
      } finally {
        setIsLoading(false)
        onSubmit()
      }
    }
  }, [activate, email, isDisabledButton, onSubmit, password])

  return (
    <form>
      <InputWrapper>
        <LabelWrapper>
          <Label>{t('email')}</Label>
        </LabelWrapper>
        <TextInput
          placeholder={t('emailPlaceholder')}
          onBlur={evt => setEmail(evt.target.value)}
        />
        <ErrorCaption>{emailError}</ErrorCaption>
      </InputWrapper>
      <InputWrapper>
        <LabelWrapper>
          <Label>{t('password')}</Label>
        </LabelWrapper>
        <PasswordInput onBlur={evt => setPassword(evt.target.value)} />
      </InputWrapper>
      <InputWrapper>
        <LabelWrapper>
          <Label>{t('passwordConfirmed')}</Label>
        </LabelWrapper>
        <PasswordInput onBlur={evt => setConfirmedPassword(evt.target.value)} />
        <ErrorCaption>{passwordError}</ErrorCaption>
      </InputWrapper>
      <CheckboxWrapper>
        <Checkbox
          checked={isKnowledged}
          onChange={evt => setIsKnowledged(evt.target.checked)}
        />
        <CheckboxLabel>{t('trialWalletWarning')}</CheckboxLabel>
      </CheckboxWrapper>
      <CheckboxWrapper>
        <Checkbox
          checked={isDeclared}
          onChange={evt => setIsDeclared(evt.target.checked)}
        />
        <CheckboxLabel>{t('keepPasswordWarning')}</CheckboxLabel>
      </CheckboxWrapper>
      <Button type='button' onClick={createWallet} disabled={isDisabledButton}>
        {isLoading ? <StyledLoadingIcon /> : t('create')}
      </Button>
      {error && <ErrorText>{error}</ErrorText>}
    </form>
  )
}
