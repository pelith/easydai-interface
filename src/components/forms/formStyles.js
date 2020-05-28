import React, { useState, useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ReactComponent as DropdownIcon } from '../../assets/dropdown.svg'

export const InputWrapper = styled.label`
  width: 100%;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
`

export const LabelWrapper = styled.div`
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const Label = styled.div`
  font-size: 14px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  color: ${({ theme }) => theme.colors.textColor};
`

export const Input = styled.input`
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 3px;
  padding: 0 12px;
  background-color: ${({ theme }) => theme.colors.blueGray50};
  box-shadow: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.blueGray300};
  }

  &:focus {
    outline: none;
  }
`

export const NumberInput = styled(Input).attrs(() => ({ type: 'number' }))`
  font-size: 13px;
  font-family: ${({ theme }) => theme.fontFamilies.roboto};
  line-height: 48px;
`

export const TextInput = styled(Input).attrs(props => ({ type: 'text' }))`
  font-size: 13px;
  font-family: ${({ theme }) => theme.fontFamilies.roboto};
  line-height: 48px;
`

export const PasswordInput = styled(Input).attrs(props => ({
  type: 'password',
  autoComplete: 'new-password',
}))`
  font-size: 13px;
  font-family: ${({ theme }) => theme.fontFamilies.roboto};
  line-height: 48px;
`

export const ErrorCaption = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.mahogany};
`

export const CheckboxWrapper = styled.label`
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;

  > *:not(:first-child) {
    margin-left: 12px;
    flex: 1;
  }
`

export const Checkbox = styled.input.attrs(props => ({ type: 'checkbox' }))`
  width: 16px;
  height: 16px;
  margin: 0;
  border: 1px solid ${({ theme }) => theme.colors.blueGray200};
  border-radius: 3px;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: inset 0 1px 3px ${({ theme }) => theme.colors.blueGray200};
`

export const CheckboxLabel = styled.span`
  font-size: 12px;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  color: ${({ theme }) => theme.colors.blueGray900};
`

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 48px;
  padding: 0 40px;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.blueGray50};
`

const SelectField = styled.select`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  padding: 0 20px;
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

const StyledDropdown = styled(DropdownIcon)`
  position: absolute;
  right: 10px;
  top: 14px;
  width: 20px;
  height: 20px;
`

export function Select(props) {
  return (
    <SelectWrapper>
      <SelectField {...props} />
      <StyledDropdown />
    </SelectWrapper>
  )
}

export const Button = styled.button.attrs(() => ({ type: 'button' }))`
  width: 100%;
  height: 40px;
  margin: 20px 0;
  border: none;
  border-radius: 20px;
  padding: 0;
  background-color: ${({ theme }) => theme.colors.ultramarineBlue};
  color: ${({ theme }) => theme.colors.white};
  font-size: 13px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  cursor: pointer;

  &:focus {
    outline: none;
  }

  &[disabled] {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

export const MaxButton = styled.button.attrs(() => ({ type: 'button' }))`
  width: 100%;
  max-width: 84px;
  height: 28px;
  border: 1px solid ${({ theme }) => theme.colors.blue800}
  border-radius: 14px;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.blue900};
  font-size: 12px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.roboto};
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  cursor: pointer;

  &:focus {
    outline: none;
  }
`

const FileInputButton = styled.button.attrs(props => ({ type: 'button' }))`
  width: 100%;
  height: 40px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.blue800};
  padding: 0;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.blue900};
  font-size: 12px;
  font-family: ${({ theme }) => theme.fontFamilies.roboto};
  display: flex;
  justify-content: center;
  align-items: center;
`

const FileInputField = styled.input.attrs(props => ({ type: 'file' }))`
  display: none;
`

export function JsonFileInput(props) {
  const { onChange } = props

  const { t } = useTranslation()

  const [fileName, setFileName] = useState(null)
  const [errorMessage, setErrorMessage] = useState()

  const isError = useMemo(() => !!errorMessage, [errorMessage])
  const buttonText = useMemo(
    () => (isError ? errorMessage : fileName || t('importKeystore')),
    [fileName, isError, errorMessage, t],
  )

  const fileInput = useRef()
  const uploadFile = useCallback(
    evt => {
      evt.preventDefault()

      const fileReader = new FileReader()
      fileReader.onload = fileEvent => {
        try {
          const json = JSON.parse(fileEvent.target.result)
          setErrorMessage()
          onChange(json)
        } catch {
          setErrorMessage(t('fileIsIncorrect'))
          onChange()
        }
      }

      const file = fileInput.current.files[0]
      if (file) {
        setFileName(file.name)
        fileReader.readAsText(file)
      }
    },
    [onChange, t],
  )

  return (
    <>
      <FileInputButton
        onClick={() => {
          fileInput.current.click()
        }}
      >
        {buttonText}
      </FileInputButton>
      <FileInputField accept='.json' ref={fileInput} onChange={uploadFile} />
    </>
  )
}
