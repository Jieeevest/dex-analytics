import { ProtocolData } from './reducer'
import { createAction } from '@reduxjs/toolkit'
import { ChartDayData, Transaction } from 'types'
import { SupportedDex } from 'constants/networks'

// protocol wide info
export const updateProtocolData = createAction<{ protocolData: ProtocolData; networkId: SupportedDex }>(
  'protocol/updateProtocolData'
)
export const updateChartData = createAction<{ chartData: ChartDayData[]; networkId: SupportedDex }>(
  'protocol/updateChartData'
)
export const updateTransactions = createAction<{ transactions: Transaction[]; networkId: SupportedDex }>(
  'protocol/updateTransactions'
)
