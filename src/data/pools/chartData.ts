import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import gql from 'graphql-tag'
import { PoolChartEntry } from 'state/pools/reducer'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { Pair } from '@uniswap/v2-sdk'

// format dayjs with the libraries that we need
dayjs.extend(utc)
dayjs.extend(weekOfYear)
const ONE_DAY_UNIX = 24 * 60 * 60

const POOL_CHART = gql`
  query pairDayDatas($startTime: Int!, $skip: Int!, $address: Bytes!) {
    pairDayDatas(
      first: 1000
      skip: $skip
      where: { pairAddress: $address, date_gt: $startTime }
      orderBy: date
      orderDirection: asc
      subgraphError: allow
    ) {
      date
      dailyVolumeUSD
      reserveUSD
    }
  }
`

interface PairDayData {
  date: number // UNIX timestamp in seconds
  dailyVolumeUSD: string
  reserveUSD: string
}

interface PairDayDatasResponse {
  pairDayDatas: PairDayData[]
}

interface ChartResults {
  pairDayDatas: {
    date: number
    volumeUSD: number
    liquidityUSD: number
  }[]
}

interface ChartEntry {
  date: number
  volumeUSD: number
  liquidityUSD: number
}

const mapPairDayData = (pairDayData: PairDayData): ChartEntry => ({
  date: pairDayData.date,
  volumeUSD: parseFloat(pairDayData.dailyVolumeUSD),
  liquidityUSD: parseFloat(pairDayData.reserveUSD),
})

export async function fetchPoolChartData(address: string, client: ApolloClient<NormalizedCacheObject>) {
  let data: {
    date: number
    volumeUSD: number
    liquidityUSD: number
  }[] = []
  const startTimestamp = 1619170975
  const endTimestamp = dayjs.utc().unix()

  let error = false
  let skip = 0
  let allFound = false

  try {
    while (!allFound) {
      const {
        data: { pairDayDatas },
        error,
        loading,
      } = await client.query<PairDayDatasResponse>({
        query: POOL_CHART,
        variables: {
          address: address,
          startTime: startTimestamp,
          skip,
        },
        fetchPolicy: 'cache-first',
      })

      const finalData = pairDayDatas.map(mapPairDayData)

      if (!loading) {
        skip += 1000
        if (finalData.length < 1000 || error) {
          allFound = true
        }
        if (finalData) {
          data = data.concat(finalData)
        }
      }
    }
  } catch {
    error = true
  }

  if (data) {
    const formattedDayData = data.reduce((accum: { [date: number]: PoolChartEntry }, dayData) => {
      const roundedDate = parseInt((dayData.date / ONE_DAY_UNIX).toFixed(0))

      accum[roundedDate] = {
        date: dayData.date,
        volumeUSD: dayData.volumeUSD,
        liquidityUSD: dayData.liquidityUSD,
      }
      return accum
    }, {})

    const firstEntry = formattedDayData[parseInt(Object.keys(formattedDayData)[0])]

    // fill in empty days ( there will be no day datas if no trades made that day )
    let timestamp = firstEntry?.date ?? startTimestamp
    let latestLiquidityUSD = firstEntry?.liquidityUSD ?? 0
    while (timestamp < endTimestamp - ONE_DAY_UNIX) {
      const nextDay = timestamp + ONE_DAY_UNIX
      const currentDayIndex = parseInt((nextDay / ONE_DAY_UNIX).toFixed(0))
      if (!Object.keys(formattedDayData).includes(currentDayIndex.toString())) {
        formattedDayData[currentDayIndex] = {
          date: nextDay,
          volumeUSD: 0,
          liquidityUSD: latestLiquidityUSD,
        }
      } else {
        latestLiquidityUSD = formattedDayData[currentDayIndex].liquidityUSD
      }
      timestamp = nextDay
    }

    const dateMap = Object.keys(formattedDayData).map((key) => {
      return formattedDayData[parseInt(key)]
    })

    return {
      data: dateMap,
      error: false,
    }
  } else {
    return {
      data: undefined,
      error,
    }
  }
}
