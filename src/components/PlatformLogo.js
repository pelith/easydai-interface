import React from 'react'

import CompoundImage from '../assets/platforms/Compound.png'
import FulcrumImage from '../assets/platforms/Fulcrum.png'
import MakerDAOImage from '../assets/platforms/MakerDAO.png'

const COMPOUND = 'COMPOUND'
const FULCRUM = 'FULCRUM'
const MAKERDAO = 'MAKERDAO'

const imagesSrc = {
  [COMPOUND]: CompoundImage,
  [FULCRUM]: FulcrumImage,
  [MAKERDAO]: MakerDAOImage,
}

export default function PlatformLogo(props) {
  const { name = '', ...otherProps } = props

  return <img src={imagesSrc[name.toUpperCase()]} alt={name} {...otherProps} />
}
