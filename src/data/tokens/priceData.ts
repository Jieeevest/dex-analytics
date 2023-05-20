import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import gql from 'graphql-tag'
import { getBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { PriceChartEntry } from 'types'

// format dayjs with the libraries that we need
dayjs.extend(utc)
dayjs.extend(weekOfYear)

export const PRICES_BY_BLOCK = (tokenAddress: string, blocks: any) => {
  let queryString = 'query blocks {'
  queryString += blocks.map(
    (block: any) => `
      t${block.timestamp}:token(id:"${tokenAddress}", block: { number: ${block.number} }, subgraphError: allow) { 
        derivedUSD
      }
    `
  )
  // queryString += ','
  // queryString += blocks.map(
  //   (block: any) => `
  //     b${block.timestamp}: bundle(id:"1", block: { number: ${block.number} }, subgraphError: allow) {
  //       bnbPrice
  //     }
  //   `
  // )

  queryString += '}'
  return gql(queryString)
}

export async function fetchTokenPriceData(
  address: string,
  interval: number,
  startTimestamp: number,
  dataClient: ApolloClient<NormalizedCacheObject>,
  blockClient: ApolloClient<NormalizedCacheObject>
): Promise<{
  data: PriceChartEntry[]
  error: boolean
}> {
  // start and end bounds

  try {
    const endTimestamp = dayjs.utc().unix()

    if (!startTimestamp) {
      console.log('Error constructing price start timestamp')
      return {
        data: [],
        error: false,
      }
    }

    // create an array of hour start times until we reach current hour
    const timestamps = []
    let time = startTimestamp
    while (time <= endTimestamp) {
      timestamps.push(time)
      time += interval
    }

    // backout if invalid timestamp format
    if (timestamps.length === 0) {
      return {
        data: [],
        error: false,
      }
    }

    // fetch blocks based on timestamp
    const blocks = await getBlocksFromTimestamps(timestamps, blockClient, 50)
    if (!blocks || blocks.length === 0) {
      console.log('Error fetching blocks')
      return {
        data: [],
        error: false,
      }
    }

    // format token BNB price results
    let tokenPrices: {
      timestamp: string
      derivedBNB: number
      priceUSD: number
    }[] = []
    const {
      data: priceData,
      errors,
      loading,
    } = await dataClient.query<any>({
      query: PRICES_BY_BLOCK(address, blocks),
      fetchPolicy: 'no-cache',
    })
    // // Get Token prices in USD
    Object.keys(priceData).forEach((priceKey) => {
      // if its BNB price e.g. `b123` split('t')[1] will be undefined and skip BNB price entry
      tokenPrices.push({
        timestamp: priceKey.split('t')[1],
        derivedBNB: 0,
        priceUSD: priceData[priceKey]?.[`derivedUSD`] ? parseFloat(priceData[priceKey][`derivedUSD`]) : 0,
      })
    })
    const formattedHistory = []

    // // for each timestamp, construct the open and close price
    for (let i = 0; i < tokenPrices.length - 1; i++) {
      formattedHistory.push({
        time: parseInt(tokenPrices[i].timestamp),
        open: tokenPrices[i].priceUSD,
        close: tokenPrices[i + 1].priceUSD,
        high: tokenPrices[i + 1].priceUSD,
        low: tokenPrices[i].priceUSD,
      })
    }
    return {
      data: formattedHistory,
      error: false,
    }
  } catch (e) {
    console.log(e)
    return {
      data: [],
      error: true,
    }
  }
}
