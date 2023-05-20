import React, { useMemo } from 'react'
import styled, {
  ThemeProvider as StyledComponentsThemeProvider,
  createGlobalStyle,
  css,
  DefaultTheme,
} from 'styled-components'
import { useIsDarkMode } from '../state/user/hooks'
import { Text, TextProps } from 'rebass'
import { Colors } from './styled'

export * from './components'

export const MEDIA_WIDTHS = {
  upToExtraSmall: 500,
  upToSmall: 720,
  upToMedium: 960,
  upToLarge: 1280,
}

const mediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(MEDIA_WIDTHS).reduce(
  (accumulator, size) => {
    ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
      @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
        ${css(a, b, c)}
      }
    `
    return accumulator
  },
  {}
) as any

const white = '#FFFFFF'
const black = '#000000'

export function colors(darkMode: boolean): Colors {
  return {
    // base
    white,
    black,

    // text
    text1: darkMode ? '#F5F5F5' : '#171717', //SubHeading
    text2: darkMode ? '#D4D4D4' : '#262626', //Desc
    text3: darkMode ? '#A3A3A3' : '#737373', //Disable
    text4: darkMode ? '#565A69' : '#C3C5CB',
    text5: darkMode ? '#2C2F36' : '#EDEEF2',

    // backgrounds / green
    bg0: darkMode ? '#0D130D' : '#F7F8FA',
    bg1: darkMode ? '#121B12' : '#EEF7EE',
    bg2: darkMode ? '#062606' : '#E8F8E8',
    bg3: darkMode ? '#40444F' : '#EDEEF2',
    bg4: darkMode ? '#565A69' : '#CED0D9',
    bg5: darkMode ? '#A3A3A3' : '#737373',
    bgLitedex: darkMode
      ? 'radial-gradient(75.35% 75.35% at 50% 50%, #031403 0%, #050505 100%)'
      : 'radial-gradient(75.35% 75.35% at 50% 50%, #FBFDFC 0%, #FBFDFC 100%)',
    bgNavbar: darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.01)',

    //specialty colors
    modalBG: darkMode ? 'rgba(0,0,0,.425)' : 'rgba(0,0,0,0.3)',
    advancedBG: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.6)',

    //primary colors
    primary1: darkMode ? '#1EC01E' : '#1EC01E',
    primary2: darkMode ? '#3680E7' : '#FF8CC3',
    primary3: darkMode ? '#4D8FEA' : '#FF99C9',
    primary4: darkMode ? '#376bad70' : '#F6DDE8',
    primary5: darkMode ? '#153d6f70' : '#FDEAF1',

    // color text
    primaryText1: darkMode ? '#6da8ff' : '#ff007a',

    // secondary colors
    secondary1: darkMode ? '#1EC01E' : '#1EC01E',
    secondary2: darkMode ? '#17000b26' : '#F6DDE8',
    secondary3: darkMode ? '#17000b26' : '#FDEAF1',

    // Button Interaction
    btnPrimary: darkMode ? '#189918' : '#1ec01e',
    btnPrimaryHover: darkMode ? '#1ec01e' : '#189918',
    btnDisabled: darkMode ? '#0C4C0C' : '#A5E5A5',
    btnOutline: darkMode ? '#062606' : '#F3FCF3',
    btnOutlineHover: darkMode ? '#0C4C0C' : '#E4F7E4',
    btnDisabledDanger: darkMode ? '#581b1b' : '#F7A2A2',
    btnDanger: darkMode ? '#AA0F0F' : '#EF4444',
    btnDangerHover: darkMode ? '#EF4444' : '#AA0F0F',
    btnDangerOutline: darkMode ? '#710A0A' : '#FCE0E0',
    btnDangerOutlineHover: darkMode ? '#AA0F0F' : '#F7A2A2',

    // other
    mono: darkMode ? '#FFFFFF' : '#000000',
    pink1: '#ff007a',
    red1: '#FD4040',
    red2: '#F82D3A',
    red3: '#D60000',
    green1: '#27AE60',
    yellow1: '#FFE270',
    yellow2: '#F3841E',
    yellow3: '#F3B71E',
    blue1: '#2172E5',
    blue2: '#5199FF',
    shadowBrand: 'rgba(30, 192, 30, 0.3)',
    scrollThumb: darkMode ? '#189918' : '#4ACC4A',
    scrollTrack: darkMode ? '#062606' : '#D2F2D2',

    // dont wanna forget these blue yet
    // blue4: darkMode ? '#153d6f70' : '#C4D9F8',
    // blue5: darkMode ? '#153d6f70' : '#EBF4FF',
  }
}

export function theme(darkMode: boolean): DefaultTheme {
  return {
    ...colors(darkMode),

    grids: {
      sm: 8,
      md: 12,
      lg: 24,
    },

    //shadows
    shadow1: darkMode ? '#000' : '#2F80ED',

    // media queries
    mediaWidth: mediaWidthTemplates,

    // css snippets
    flexColumnNoWrap: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
      display: flex;
      flex-flow: row nowrap;
    `,
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useIsDarkMode()

  const themeObject = useMemo(() => theme(darkMode), [darkMode])

  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

const TextWrapper = styled(Text)<{ color: keyof Colors }>`
  color: ${({ color, theme }) => (theme as any)[color]};
`

export const TYPE = {
  main(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text2'} {...props} />
  },
  link(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'primary1'} {...props} />
  },
  label(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text1'} {...props} />
  },
  black(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text1'} {...props} />
  },
  white(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'white'} {...props} />
  },
  body(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} color={'text1'} {...props} />
  },
  largeHeader(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={24} color={'text1'} {...props} />
  },
  mediumHeader(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={20} color={'text3'} {...props} />
  },
  subHeader(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} {...props} />
  },
  small(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={11} {...props} />
  },
  blue(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'blue1'} {...props} />
  },
  yellow(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'yellow3'} {...props} />
  },
  darkGray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text3'} {...props} />
  },
  gray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'bg3'} {...props} />
  },
  italic(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={12} fontStyle={'italic'} color={'text2'} {...props} />
  },
  error({ error, ...props }: { error: boolean } & TextProps) {
    return <TextWrapper fontWeight={500} color={error ? 'red1' : 'text2'} {...props} />
  },
}

export const FixedGlobalStyle = createGlobalStyle`
html, input, textarea, button {
  /* font-family: 'Inter', sans-serif; */
  font-family: "Montserrat", sans-serif;

  font-display: fallback;
}
@supports (font-variation-settings: normal) {
  html, input, textarea, button {
    /* font-family: 'Inter var', sans-serif; */
  font-family: "Montserrat", sans-serif;
  }
}

html,
body {
  margin: 0;
  padding: 0;
}

 a {
   color: ${colors(false).blue1}; 
 }

* {
  box-sizing: border-box;
}

button {
  user-select: none;
}

html {
  font-size: 16px;
  font-variant: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  font-feature-settings: 'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on;
  
}
`

export const ThemedGlobalStyle = createGlobalStyle`
html {
  color: ${({ theme }) => theme.text1};
  background: ${({ theme }) => theme.bgLitedex};
  /* background-color: ${({ theme }) => theme.bg1}; */
  scrollbar-color: ${({ theme }) => theme.scrollThumb} ${({ theme }) => theme.scrollTrack}; 
  scrollbar-gutter: stable;
  scrollbar-width: thin;
}
::-webkit-scrollbar-thumb {
    border-radius: 999px;
  background: ${({ theme }) => theme.scrollThumb};
  }
  ::-webkit-scrollbar {
      width: 6px;
  }
  ::-webkit-scrollbar-track{
    background: ${({ theme }) => theme.scrollTrack};
  }

.three-line-legend-dark {
	width: 100%;
	height: 70px;
	position: absolute;
	padding: 8px;
	font-size: 12px;
	color: white;
	background-color: transparent;
	text-align: left;
	z-index: 10;
  pointer-events: none;
}

.tv-lightweight-charts{
  width: 100% !important;
  
  & > * {
    width: 100% !important;
  }
}

body {
  min-height: 100vh;
  background-position: 0 -30vh;
  background-repeat: no-repeat;

}
`
