import React from 'react'
import useCollapse from 'react-collapsed'
import styled from 'styled-components'

export function ExpansionPanel(props) {
  const { isOpen, onClick, children: childrenProps } = props

  const { getToggleProps, getCollapseProps } = useCollapse({ isOpen })

  const [summary, ...children] = React.Children.toArray(childrenProps)

  return (
    <>
      <div {...getToggleProps({ onClick })}>{summary}</div>
      <section {...getCollapseProps()}>{children}</section>
    </>
  )
}

export const ExpansionPanelButton = styled.button`
  width: 100%;
  height: 65px;
  padding: 0;
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.blueGray200};
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.textColor};
  font-size: 16px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  display: flex;
  justify-content: center;
  align-items: center;

  &:focus {
    outline: none;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.ultramarineBlue};
  }
`

export const ExpansionPanelDetails = styled.div`
  margin-top: 4px;
`
