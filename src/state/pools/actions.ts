import { createAction } from '@reduxjs/toolkit'
import { PoolData, PoolChartEntry } from './reducer'
import { Transaction } from 'types'
import { SupportedDex } from 'constants/networks'

// protocol wide info
export const updatePoolData = createAction<{ pools: PoolData[]; networkId: SupportedDex }>('pools/updatePoolData')

// add pool address to byAddress
export const addPoolKeys = createAction<{ poolAddresses: string[]; networkId: SupportedDex }>('pool/addPoolKeys')

export const updatePoolChartData = createAction<{
  poolAddress: string
  chartData: PoolChartEntry[]
  networkId: SupportedDex
}>('pool/updatePoolChartData')

export const updatePoolTransactions = createAction<{
  poolAddress: string
  transactions: Transaction[]
  networkId: SupportedDex
}>('pool/updatePoolTransactions')
