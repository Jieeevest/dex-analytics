import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import gql from 'graphql-tag'
import { TokenChartEntry } from 'state/tokens/reducer'

// format dayjs with the libraries that we need
dayjs.extend(utc)
dayjs.extend(weekOfYear)
const ONE_DAY_UNIX = 24 * 60 * 60

const TOKEN_CHART = gql`
  query tokenDayDatas($startTime: Int!, $skip: Int!, $address: Bytes!) {
    tokenDayDatas(
      first: 1000
      skip: $skip
      where: { token: $address, date_gt: $startTime }
      orderBy: date
      orderDirection: asc
      subgraphError: allow
    ) {
      date
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }
`

interface ChartResults {
  tokenDayDatas: {
    date: number
    dailyVolumeUSD: string
    totalLiquidityUSD: string
  }[]
}

export async function fetchTokenChartData(address: string, client: ApolloClient<NormalizedCacheObject>) {
  let data: {
    date: number
    dailyVolumeUSD: string
    totalLiquidityUSD: string
  }[] = []
  const startTimestamp = 1619170975
  const endTimestamp = dayjs.utc().unix()

  let error = false
  let skip = 0
  let allFound = false

  //this code to get token chart data
  try {
    while (!allFound) {
      const {
        data: chartResData,
        error,
        loading,
      } = await client.query<ChartResults>({
        query: TOKEN_CHART,
        variables: {
          address: address,
          startTime: startTimestamp,
          skip,
        },
        fetchPolicy: 'cache-first',
      })
      if (!loading) {
        skip += 1000
        if (chartResData.tokenDayDatas.length < 1000 || error) {
          allFound = true
        }
        if (chartResData) {
          data = data.concat(chartResData.tokenDayDatas)
        }
      }
    }
  } catch {
    error = true
  }

  if (data) {
    const formattedExisting = data.reduce((accum: { [date: number]: TokenChartEntry }, dayData) => {
      const roundedDate = parseInt((dayData.date / ONE_DAY_UNIX).toFixed(0))
      accum[roundedDate] = {
        date: dayData.date,
        dailyVolumeUSD: parseFloat(dayData.dailyVolumeUSD),
        totalLiquidityUSD: parseFloat(dayData.totalLiquidityUSD),
      }
      return accum
    }, {})

    const firstEntry = formattedExisting[parseInt(Object.keys(formattedExisting)[0])]

    // fill in empty days ( there will be no day datas if no trades made that day )
    let timestamp = firstEntry?.date ?? startTimestamp
    let latestLiquidity = firstEntry?.totalLiquidityUSD ?? 0
    while (timestamp < endTimestamp - ONE_DAY_UNIX) {
      const nextDay = timestamp + ONE_DAY_UNIX
      const currentDayIndex = parseInt((nextDay / ONE_DAY_UNIX).toFixed(0))
      if (!Object.keys(formattedExisting).includes(currentDayIndex.toString())) {
        formattedExisting[currentDayIndex] = {
          date: nextDay,
          dailyVolumeUSD: 0,
          totalLiquidityUSD: latestLiquidity,
        }
      } else {
        latestLiquidity = formattedExisting[currentDayIndex].totalLiquidityUSD
      }
      timestamp = nextDay
    }

    const dateMap = Object.keys(formattedExisting).map((key) => {
      return formattedExisting[parseInt(key)]
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