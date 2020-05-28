import React from 'react'
import {
  ThemeProvider as StyledComponentsThemeProvider,
  css,
} from 'styled-components'

export { GlobalStyle } from './GlobalStyle'

const breakpoints = {
  sm: 425,
  md: 868, // 768 + 100
  lg: 1124, // 1024 + 100
  xl: 1440,
}

const mediaQuery = Object.keys(breakpoints).reduce((accumulator, label) => {
  accumulator[label] = (...args) => css`
    @media (min-width: ${breakpoints[label]}px) {
      ${css(...args)}
    }
  `
  return accumulator
}, {})

const black = '#000000'
const white = '#FFFFFF'

const theme = {
  mediaQuery,
  fontFamilies: {
    notoSans: 'Noto Sans TC',
    barlow: 'Barlow',
    roboto: 'Roboto',
  },
  colors: {
    black,
    white,
    offWhite: '#FAFCFF',
    gray: '#E1E8F2',
    textColor: '#334E68',
    backgroundColor: '#EEF2F8',
    overlayColor: 'rgba(211, 221, 235, 0.8)',
    blue900: '#1B3C6B',
    blue800: '#2A538C',
    blue700: '#335E9B',
    blue600: '#3F6EAF',
    blue500: '#4E7EC2',
    blue400: '#6796D7',
    blue300: '#84AEE8',
    blue200: '#A1C4F4',
    blue100: '#C9DFFE',
    blue50: '#E4EEFB',
    blueGray900: '#102A43',
    blueGray800: '#243B53',
    blueGray700: '#243B53',
    blueGray600: '#486581',
    blueGray500: '#627D98',
    blueGray400: '#829AB1',
    blueGray300: '#9FB3C8',
    blueGray200: '#BCCCDC',
    blueGray100: '#D9E2EC',
    blueGray50: '#F0F4F8',
    ultramarineBlue: '#3F7FFF', // accent blue
    perano: '#A6C4FF', // accent light blue
    dullLime: '#31B237', // accent green
    blackSqueeze: '#F0FCF7', //  accentlight green
    mahogany: '#D64545', //  accentdark red
    sunglo: '#E66A6A', //  accent light red
    indigo: '#647ACB', // blue
    jordyBlue: '#98AEEB', // lighter blue
    lavender: '#E0E8F9', // lightest blue
    reefGold: '#A27C1A', // dark yellow
    anzac: '#E9B949', // yellow
    oasis: '#FCEFC7', //light yellow
  },
}

export default function ThemeProvider({ children }) {
  return (
    <StyledComponentsThemeProvider theme={theme}>
      {children}
    </StyledComponentsThemeProvider>
  )
}
