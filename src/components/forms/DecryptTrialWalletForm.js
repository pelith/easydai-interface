import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import ReactGA from 'react-ga'
import { useWeb3React } from '@web3-react/core'
import styled from 'styled-components'
import { ethers } from 'ethers'

import {
  InputWrapper,
  PasswordInput,
  LabelWrapper,
  Label,
  ErrorCaption,
  Button,
} from './formStyles'
import { ReactComponent as LoadingIcon } from '../../assets/loading.svg'
import { getNetworkWithSigner } from '../../connectors'

const StyledLoadingIcon = styled(LoadingIcon)`
  width: 20px;
  height: 20px;
`

export default function DecryptTrialWallet(props) {
  const { onSubmit } = props

  const { t } = useTranslation()

  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState()
  const [isLoading, setIsLoading] = useState(false)

  const { activate } = useWeb3React()

  const decryptWallet = useCallback(async () => {
    const keystoreBase64 = localStorage.getItem('keystore')
    const keystore = keystoreBase64 ? JSON.parse(atob(keystoreBase64)) : null

    if (password && keystore) {
      try {
        setIsLoading(true)

        const wallet = await ethers.Wallet.fromEncryptedJson(
          JSON.stringify(keystore),
          password,
        )
        activate(getNetworkWithSigner(wallet.privateKey))
        setPasswordError()
        onSubmit()
        ReactGA.event({
          category: 'WalletLoggedIn',
          action: 'DecryptTrialWallet',
        })
      } catch {
        setPasswordError(t('passwordIsIncorrect'))
      } finally {
        setIsLoading(false)
      }
    }
  }, [activate, onSubmit, password, t])

  return (
    <form>
      <InputWrapper>
        <LabelWrapper>
          <Label>{t('password')}</Label>
        </LabelWrapper>
        <PasswordInput
          autocomplete='new-password'
          value={password}
          onChange={evt => setPassword(evt.target.value)}
        />
        <ErrorCaption>{passwordError}</ErrorCaption>
      </InputWrapper>
      <Button type='button' onClick={decryptWallet} disabled={!password}>
        {isLoading ? <StyledLoadingIcon /> : t('login')}
      </Button>
    </form>
  )
}
