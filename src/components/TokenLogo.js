import React, { useMemo } from 'react'

import EtherImage from '../assets/tokens/ETH.png'
import DaiImage from '../assets/tokens/DAI.png'
import DaiInactiveImage from '../assets/tokens/DAI_inactive.png'
import SaiImage from '../assets/tokens/SAI.png'
import SaiInactiveImage from '../assets/tokens/SAI_inactive.png'
import UsdcImage from '../assets/tokens/USDC.png'
import UsdcInactiveImage from '../assets/tokens/USDC_inactive.png'

export default function TokenLogo(props) {
  const { name, isActive = true, ...otherProps } = props

  const tokenName = useMemo(() => (name ? name.toUpperCase() : null), [name])

  const iconSrc = useMemo(() => {
    switch (tokenName) {
      case 'ETH': {
        return EtherImage
      }
      case 'DAI': {
        return isActive ? DaiImage : DaiInactiveImage
      }
      case 'SAI': {
        return isActive ? SaiImage : SaiInactiveImage
      }
      case 'USDC': {
        return isActive ? UsdcImage : UsdcInactiveImage
      }
      default: {
        return EtherImage
      }
    }
  }, [isActive, tokenName])

  return <img src={iconSrc} alt={tokenName} {...otherProps} />
}
