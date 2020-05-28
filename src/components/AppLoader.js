import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import { ReactComponent as LoadingIcon } from '../assets/loading.svg'

const LoadingWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`

export default function AppLoader(props) {
  const { children } = props

  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    let stale = false
    setIsLoading(true)
    setTimeout(() => {
      if (!stale) {
        setIsLoading(false)
      }
    }, 600)
    return () => {
      stale = true
    }
  }, [])

  if (isLoading) {
    return (
      <LoadingWrapper>
        <LoadingIcon />
      </LoadingWrapper>
    )
  } else {
    return children
  }
}
