import React from 'react'
import styled from 'styled-components'
import { transparentize } from 'polished'

import { ReactComponent as CloseIcon } from '../../assets/close.svg'

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 90;
  width: 100vw;
  height: 100vh;
  background-color: ${({ theme }) =>
    transparentize(0.7, theme.colors.blueGray900)};
  overflow: auto;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
`

const DialogContent = styled.div`
  width: 90%;
  max-width: 400px;
  margin: 100px auto;
  padding: 16px;
  border: 1.5px solid ${({ theme }) => theme.colors.blueGray100};
  border-top: 4px solid
    ${({ theme, status }) => {
      if (status === 'error') {
        return theme.colors.sunglo
      } else if (status === 'withdraw') {
        return theme.colors.anzac
      } else {
        return theme.colors.blue500
      }
    }};
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 4px 10px 0
      ${({ theme }) => transparentize(0.9, theme.colors.textColor)},
    0 4px 30px -4px ${({ theme }) => transparentize(0.75, theme.colors.textColor)};
`

const CloseIconWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`

const StyledCloseIcon = styled(CloseIcon)`
  width: 28px;
  height: 28px;
`

export default function Dialog(props) {
  const { isOpen, onDismiss, isError, status, children } = props
  return (
    <DialogOverlay
      isOpen={isOpen}
      isError={isError}
      onClick={event => {
        if (event.target === event.currentTarget) {
          onDismiss()
        }
      }}
    >
      <DialogContent status={status}>
        <CloseIconWrapper>
          <StyledCloseIcon onClick={onDismiss} />
        </CloseIconWrapper>
        {children}
      </DialogContent>
    </DialogOverlay>
  )
}
