import { createAction } from '@reduxjs/toolkit'
import { TokenData, TokenChartEntry } from './reducer'
import { PriceChartEntry, Transaction } from 'types'
import { SupportedDex } from 'constants/networks'

// protocol wide info
export const updateTokenData = createAction<{ tokens: TokenData[]; networkId: SupportedDex }>('tokens/updateTokenData')

// add token address to byAddress
export const addTokenKeys = createAction<{ tokenAddresses: string[]; networkId: SupportedDex }>('tokens/addTokenKeys')

// add list of pools token is in
export const addPoolAddresses = createAction<{
  tokenAddress: string
  poolAddresses: string[]
  networkId: SupportedDex
}>('tokens/addPoolAddresses')

// tvl and volume data over time
export const updateChartData = createAction<{
  tokenAddress: string
  chartData: TokenChartEntry[]
  networkId: SupportedDex
}>('tokens/updateChartData')

// transactions
export const updateTransactions = createAction<{
  tokenAddress: string
  transactions: Transaction[]
  networkId: SupportedDex
}>('tokens/updateTransactions')

// price data at arbitrary intervals
export const updatePriceData = createAction<{
  tokenAddress: string
  secondsInterval: number
  priceData: PriceChartEntry[] | undefined
  oldestFetchedTimestamp: number
  networkId: SupportedDex
}>('tokens/updatePriceData')
