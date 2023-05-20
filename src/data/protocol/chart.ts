import { ChartDayData } from '../../types/index'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import gql from 'graphql-tag'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { useActiveNetworkVersion, useClients } from 'state/application/hooks'
import { useDerivedProtocolTVLHistory } from './derived'
import { SupportedDex } from 'constants/networks'

// format dayjs with the libraries that we need
dayjs.extend(utc)
dayjs.extend(weekOfYear)
const ONE_DAY_UNIX = 24 * 60 * 60

const GLOBAL_CHART = gql`
  query prodDayDatas($startTime: Int!, $skip: Int!) {
    prodDayDatas(first: 1000, skip: $skip, where: { date_gt: $startTime }, orderBy: date, orderDirection: asc) {
      date
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }
`
const PANCAKE_CHART = gql`
  query pancakeDayDatas($startTime: Int!, $skip: Int!) {
    pancakeDayDatas(first: 1000, skip: $skip, where: { date_gt: $startTime }, orderBy: date, orderDirection: asc) {
      date
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }
`

interface ChartResults {
  prodDayDatas: {
    date: number
    dailyVolumeUSD: string
    totalLiquidityUSD: string
  }[]
}

async function fetchChartData(activeNetwork: SupportedDex, client: ApolloClient<NormalizedCacheObject>) {
  let data: {
    date: number
    dailyVolumeUSD: string
    totalLiquidityUSD: string
  }[] = []
  const startTimestamp = 1619136000
  const endTimestamp = dayjs.utc().unix()

  let error = false
  let skip = 0
  let allFound = false

  try {
    while (!allFound) {
      const {
        data: chartResData,
        error,
        loading,
      } = await client.query<ChartResults>({
        query: activeNetwork == SupportedDex.PANCAKESWAP ? PANCAKE_CHART : GLOBAL_CHART,
        variables: {
          startTime: startTimestamp,
          skip,
        },
        fetchPolicy: 'cache-first',
      })
      if (!loading) {
        skip += 1000
        if (chartResData.prodDayDatas.length < 1000 || error) {
          allFound = true
        }
        if (chartResData) {
          data = data.concat(chartResData.prodDayDatas)
        }
      }
    }
  } catch {
    error = true
  }

  if (data) {
    const formattedExisting = data.reduce((accum: { [date: number]: ChartDayData }, dayData) => {
      const roundedDate = parseInt((dayData.date / ONE_DAY_UNIX).toFixed(0))
      accum[roundedDate] = {
        date: dayData.date,
        volumeUSD: parseFloat(dayData.dailyVolumeUSD),
        liquidityUSD: parseFloat(dayData.totalLiquidityUSD),
      }
      return accum
    }, {})

    const firstEntry = formattedExisting[parseInt(Object.keys(formattedExisting)[0])]

    // fill in empty days ( there will be no day datas if no trades made that day )
    let timestamp = firstEntry?.date ?? startTimestamp
    let latestTvl = firstEntry?.liquidityUSD ?? 0
    while (timestamp < endTimestamp - ONE_DAY_UNIX) {
      const nextDay = timestamp + ONE_DAY_UNIX
      const currentDayIndex = parseInt((nextDay / ONE_DAY_UNIX).toFixed(0))
      if (!Object.keys(formattedExisting).includes(currentDayIndex.toString())) {
        formattedExisting[currentDayIndex] = {
          date: nextDay,
          volumeUSD: 0,
          liquidityUSD: latestTvl,
        }
      } else {
        latestTvl = formattedExisting[currentDayIndex].liquidityUSD
      }
      timestamp = nextDay
    }

    return {
      data: Object.values(formattedExisting),
      error: false,
    }
  } else {
    return {
      data: undefined,
      error,
    }
  }
}

/**
 * Fetch historic chart data
 */
export function useFetchGlobalChartData(): {
  error: boolean
  data: ChartDayData[] | undefined
} {
  const [data, setData] = useState<{ [network: string]: ChartDayData[] | undefined }>()
  const [error, setError] = useState(false)
  const { dataClient } = useClients()

  const derivedData = useDerivedProtocolTVLHistory()

  const [activeNetwork] = useActiveNetworkVersion()
  const onLitedex = activeNetwork.id === SupportedDex.LITEDEX
  const indexedData = data?.[activeNetwork.id]

  // @TODO: remove this once we have fix for mainnet TVL issue
  const formattedData = onLitedex ? derivedData : indexedData

  useEffect(() => {
    async function fetch() {
      const { data, error } = await fetchChartData(activeNetwork.id, dataClient)
      if (data && !error) {
        setData({
          [activeNetwork.id]: data,
        })
      } else if (error) {
        setError(true)
      }
    }
    if (!indexedData && !error && !onLitedex) {
      fetch()
    }
  }, [data, error, dataClient, indexedData, activeNetwork.id, onLitedex])

  return {
    error,
    data: formattedData,
  }
}
