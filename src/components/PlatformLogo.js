import React from 'react'

import CompoundImage from '../assets/platforms/Compound.png'
import FulcrumImage from '../assets/platforms/Fulcrum.png'
import MakerDAOImage from '../assets/platforms/MakerDAO.png'
import AAVEImage from '../assets/platforms/AAVE.png'

const COMPOUND = 'COMPOUND'
const FULCRUM = 'FULCRUM'
const MAKERDAO = 'MAKERDAO'
const AAVE = 'AAVE'

const imagesSrc = {
  [COMPOUND]: CompoundImage,
  [FULCRUM]: FulcrumImage,
  [MAKERDAO]: MakerDAOImage,
  [AAVE]: AAVEImage,
}

export default function PlatformLogo(props) {
  const { name = '', ...otherProps } = props

  return <img src={imagesSrc[name.toUpperCase()]} alt={name} {...otherProps} />
}
