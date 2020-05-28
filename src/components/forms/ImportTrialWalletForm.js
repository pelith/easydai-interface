import React, { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import ReactGA from 'react-ga'
import { useWeb3React } from '@web3-react/core'
import styled from 'styled-components'
import { ethers } from 'ethers'

import { getNetworkWithSigner } from '../../connectors'
import { ReactComponent as LoadingIcon } from '../../assets/loading.svg'

import {
  InputWrapper,
  LabelWrapper,
  Label,
  PasswordInput,
  CheckboxWrapper,
  Checkbox,
  CheckboxLabel,
  Button,
  JsonFileInput,
  ErrorCaption,
} from './formStyles'

const StyledLoadingIcon = styled(LoadingIcon)`
  width: 20px;
  height: 20px;
`

export default function ImportTrialWalletForm(props) {
  const { onSubmit } = props
  const { t } = useTranslation()
  const [keystore, setKeystore] = useState()
  const [password, setPassword] = useState('')
  const [isKnowledged, setIsKnowledged] = useState(false)
  const [isDeclared, setIsDeclared] = useState(false)
  const [passwordError, setPasswordError] = useState()
  const [isLoading, setIsLoading] = useState(false)

  const isDisabledButton = useMemo(
    () => !password || !isKnowledged || !isDeclared,
    [isDeclared, isKnowledged, password],
  )

  const { activate } = useWeb3React()

  const importWallet = useCallback(async () => {
    if (!isDisabledButton) {
      try {
        setIsLoading(true)
        const keystoreBase64 = window.btoa(JSON.stringify(keystore))
        localStorage.setItem('keystore', keystoreBase64)
        const wallet = await ethers.Wallet.fromEncryptedJson(
          JSON.stringify(keystore),
          password,
        )
        activate(getNetworkWithSigner(wallet.privateKey))
        setPasswordError()
        setIsLoading(false)
        onSubmit()
        ReactGA.event({
          category: 'WalletLoggedIn',
          action: 'ImportTrialWallet',
        })
      } catch (e) {
        setPasswordError(t('passwordIsIncorrect'))
        setIsLoading(false)
      }
    }
  }, [isDisabledButton, keystore, password, activate, onSubmit, t])

  return (
    <form>
      <InputWrapper>
        <JsonFileInput onChange={json => setKeystore(json)} />
      </InputWrapper>
      <InputWrapper>
        <LabelWrapper>
          <Label>{t('password')}</Label>
        </LabelWrapper>
        <PasswordInput
          value={password}
          onChange={evt => setPassword(evt.target.value)}
        />
        <ErrorCaption>{passwordError}</ErrorCaption>
      </InputWrapper>
      <CheckboxWrapper>
        <Checkbox
          value={isKnowledged}
          onChange={evt => setIsKnowledged(evt.target.value)}
        />
        <CheckboxLabel>{t('trialWalletWarning')}</CheckboxLabel>
      </CheckboxWrapper>
      <CheckboxWrapper>
        <Checkbox
          value={isDeclared}
          onChange={evt => setIsDeclared(evt.target.value)}
        />
        <CheckboxLabel>{t('keepPasswordWarning')}</CheckboxLabel>
      </CheckboxWrapper>
      <Button type='button' onClick={importWallet} disabled={isDisabledButton}>
        {isLoading ? <StyledLoadingIcon /> : t('confirm')}
      </Button>
    </form>
  )
}
