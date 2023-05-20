import { currentTimestamp } from './../../utils/index'
import { updateProtocolData, updateChartData, updateTransactions } from './actions'
import { createReducer } from '@reduxjs/toolkit'
import { ChartDayData, Transaction } from 'types'
import { SupportedDex } from 'constants/networks'

export interface ProtocolData {
  // volume
  volumeUSD: number
  volumeUSDChange: number

  // in range liquidity
  liquidityUSD: number
  liquidityUSDChange: number

  // transactions
  totalTransactions: number
  totalTransactionsChange: number
}

export interface ProtocolState {
  [networkId: string]: {
    // timestamp for last updated fetch
    readonly lastUpdated: number | undefined
    // overview data
    readonly data: ProtocolData | undefined
    readonly chartData: ChartDayData[] | undefined
    readonly transactions: Transaction[] | undefined
  }
}

export const initialState: ProtocolState = {
  [SupportedDex.LITEDEX]: {
    data: undefined,
    chartData: undefined,
    transactions: undefined,
    lastUpdated: undefined,
  },
  [SupportedDex.BISWAP]: {
    data: undefined,
    chartData: undefined,
    transactions: undefined,
    lastUpdated: undefined,
  },
  [SupportedDex.PANCAKESWAP]: {
    data: undefined,
    chartData: undefined,
    transactions: undefined,
    lastUpdated: undefined,
  },
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateProtocolData, (state, { payload: { protocolData, networkId } }) => {
      state[networkId].data = protocolData
      // mark when last updated
      state[networkId].lastUpdated = currentTimestamp()
    })
    .addCase(updateChartData, (state, { payload: { chartData, networkId } }) => {
      state[networkId].chartData = chartData
    })
    .addCase(updateTransactions, (state, { payload: { transactions, networkId } }) => {
      state[networkId].transactions = transactions
    })
)
