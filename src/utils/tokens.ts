import { Token } from '@uniswap/sdk-core'
import { BiswapInfo, LitedexInfo, DexInfo, PancakeInfo } from 'constants/networks'
import { BNB_ADDRESS } from '../constants'

export interface SerializedToken {
  chainId: number
  address: string
  decimals: number
  symbol?: string
  name?: string
}

export function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  }
}

export function formatTokenSymbol(address: string, symbol: string, activeNetwork?: DexInfo) {
  // dumb catch for matic

  if (address === BNB_ADDRESS && activeNetwork === LitedexInfo) {
    return 'BNB'
  }

  if (address === BNB_ADDRESS && activeNetwork === BiswapInfo) {
    return 'BNB'
  }
  if (address === BNB_ADDRESS && activeNetwork === PancakeInfo) {
    return 'BNB'
  }
  return symbol
}

export function formatTokenName(address: string, name: string, activeNetwork?: DexInfo) {
  // dumb catch for matic
  if (address === BNB_ADDRESS && activeNetwork === LitedexInfo) {
    return 'BNB'
  }

  if (address === BNB_ADDRESS && activeNetwork === BiswapInfo) {
    return 'BNB'
  }
  if (address === BNB_ADDRESS && activeNetwork === PancakeInfo) {
    return 'BNB'
  }

  return name
}
