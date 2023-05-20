import LITEDEX_LOGO from '../assets/logo/litedex_2.png'
import BISWAP_LOGO from '../assets/logo/biswap.png'
import PANCAKE_LOGO from '../assets/logo/pancakeswap.png'

export enum SupportedDex {
  LITEDEX,
  BISWAP,
  PANCAKESWAP,
}

export type DexInfo = {
  id: SupportedDex
  route: string
  name: string
  imageURL: string
  bgColor: string
  primaryColor: string
  secondaryColor: string
  blurb?: string
}

export const LitedexInfo: DexInfo = {
  id: SupportedDex.LITEDEX,
  route: 'litedex',
  name: 'Litedex',
  bgColor: '#1ec01e',
  primaryColor: '#1ec01e',
  secondaryColor: '#1ec01e',
  imageURL: LITEDEX_LOGO,
}
export const BiswapInfo: DexInfo = {
  id: SupportedDex.BISWAP,
  route: 'biswap',
  name: 'Biswap',
  bgColor: '#1ec01e',
  primaryColor: '#1ec01e',
  secondaryColor: '#1ec01e',
  imageURL: BISWAP_LOGO,
}
export const PancakeInfo: DexInfo = {
  id: SupportedDex.PANCAKESWAP,
  route: 'pancakeswap',
  name: 'Pancakeswap',
  bgColor: '#1ec01e',
  primaryColor: '#1ec01e',
  secondaryColor: '#1ec01e',
  imageURL: PANCAKE_LOGO,
}

export const SUPPORTED_DEX_VERSIONS: DexInfo[] = [LitedexInfo]
