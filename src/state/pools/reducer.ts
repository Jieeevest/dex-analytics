import { currentTimestamp } from './../../utils/index'
import { updatePoolData, addPoolKeys, updatePoolChartData, updatePoolTransactions } from './actions'
import { createReducer } from '@reduxjs/toolkit'
import { SerializedToken } from 'state/user/actions'
import { Transaction } from 'types'
import { SupportedDex } from 'constants/networks'

export interface Pool {
  address: string
  token0: SerializedToken
  token1: SerializedToken
}

export interface PoolData {
  address: string

  token0: {
    name: string
    symbol: string
    address: string
  }

  token1: {
    name: string
    symbol: string
    address: string
  }

  // volume
  volumeUSD: number
  volumeUSDChange: number
  volumeUSDWeek: number
  volumeUSDChangeWeek: number

  // liquidity
  liquidityUSD: number
  liquidityUSDChange: number

  // prices
  token0Price: number
  token1Price: number

  // token amounts
  liquidityToken0: number
  liquidityToken1: number
}

export type PoolChartEntry = {
  date: number
  volumeUSD: number
  liquidityUSD: number
}

export interface PoolsState {
  // analytics data from
  byAddress: {
    [networkId: string]: {
      [address: string]: {
        data: PoolData | undefined
        chartData: PoolChartEntry[] | undefined
        transactions: Transaction[] | undefined
        lastUpdated: number | undefined
      }
    }
  }
}

export const initialState: PoolsState = {
  byAddress: {
    [SupportedDex.LITEDEX]: {},
    [SupportedDex.BISWAP]: {},
    [SupportedDex.PANCAKESWAP]: {},
  },
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updatePoolData, (state, { payload: { pools, networkId } }) => {
      pools.map(
        (poolData) =>
          (state.byAddress[networkId][poolData.address] = {
            ...state.byAddress[networkId][poolData.address],
            data: poolData,
            lastUpdated: currentTimestamp(),
          })
      )
    })
    // add address to byAddress keys if not included yet
    .addCase(addPoolKeys, (state, { payload: { poolAddresses, networkId } }) => {
      poolAddresses.map((address) => {
        if (!state.byAddress[networkId][address]) {
          state.byAddress[networkId][address] = {
            data: undefined,
            chartData: undefined,
            transactions: undefined,
            lastUpdated: undefined,
          }
        }
      })
    })
    .addCase(updatePoolChartData, (state, { payload: { poolAddress, chartData, networkId } }) => {
      state.byAddress[networkId][poolAddress] = { ...state.byAddress[networkId][poolAddress], chartData: chartData }
    })
    .addCase(updatePoolTransactions, (state, { payload: { poolAddress, transactions, networkId } }) => {
      state.byAddress[networkId][poolAddress] = { ...state.byAddress[networkId][poolAddress], transactions }
    })
)
