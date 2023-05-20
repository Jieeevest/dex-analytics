import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { useDeltaTimestamps } from 'utils/queries'
import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { PoolData } from 'state/pools/reducer'
import { get2DayChange, getChangeForPeriod, getPercentChange } from 'utils/data'
import { formatTokenName, formatTokenSymbol } from 'utils/tokens'
import { useActiveNetworkVersion, useClients } from 'state/application/hooks'

export const POOLS_BULK = (block: number | null, pools: string[]) => {
  let poolString = `[`
  pools.map((address) => {
    return (poolString += `"${address}",`)
  })
  poolString += ']'
  const queryString =
    `
    query pairs {
      pairs(where: {id_in: ${poolString}},` +
    (block ? `block: {number: ${block}} ,` : ``) +
    ` orderBy: volumeUSD, orderDirection: desc) {
        id
        reserve0
        reserve1
        reserveUSD
        volumeUSD
        token0Price
        token1Price
        token0 {
          id
          symbol 
          name
        }
        token1 {
          id
          symbol 
          name
        }
      }
    }
    `
  return gql(queryString)
}

interface PoolFields {
  id: string
  reserve0: string
  reserve1: string
  reserveUSD: string
  volumeUSD: string
  token0Price: string
  token1Price: string
  token0: {
    id: string
    symbol: string
    name: string
  }
  token1: {
    id: string
    symbol: string
    name: string
  }
}

interface PoolDataResponse {
  pools: PoolFields[]
}

/**
 * Fetch top addresses by volume
 */
export function usePoolDatas(
  poolAddresses: string[]
): {
  loading: boolean
  error: boolean
  data:
    | {
        [address: string]: PoolData
      }
    | undefined
} {
  // get client
  const { dataClient } = useClients()
  const [activeNetwork] = useActiveNetworkVersion()

  // get blocks from historic timestamps
  const [t24h, t48h, t7d, t14d] = useDeltaTimestamps()
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24h, t48h, t7d, t14d])
  const [block24h, block48h, block7d, block14d] = blocks ?? []

  const { loading, error, data } = useQuery<PoolDataResponse>(POOLS_BULK(null, poolAddresses), {
    client: dataClient,
  })

  const {
    loading: loading24h,
    error: error24h,
    data: data24h,
  } = useQuery<PoolDataResponse>(POOLS_BULK(block24h?.number, poolAddresses), { client: dataClient })
  const {
    loading: loading48h,
    error: error48h,
    data: data48h,
  } = useQuery<PoolDataResponse>(POOLS_BULK(block48h?.number, poolAddresses), { client: dataClient })
  const {
    loading: loading7d,
    error: error7d,
    data: data7d,
  } = useQuery<PoolDataResponse>(POOLS_BULK(block7d?.number, poolAddresses), { client: dataClient })
  const {
    loading: loading14d,
    error: error14d,
    data: data14d,
  } = useQuery<PoolDataResponse>(POOLS_BULK(block14d?.number, poolAddresses), { client: dataClient })
  const anyError = Boolean(error || error24h || error48h || blockError || error7d || error14d)
  const anyLoading = Boolean(loading || loading24h || loading48h || loading7d || loading14d)

  // return early if not all data yet
  if (anyError || anyLoading) {
    return {
      loading: anyLoading,
      error: anyError,
      data: undefined,
    }
  }

  const parsed = data?.pools
    ? data.pools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsed24h = data24h?.pools
    ? data24h.pools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsed48h = data48h?.pools
    ? data48h.pools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsed7d = data7d?.pools
    ? data7d.pools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsed14d = data14d?.pools
    ? data14d.pools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}

  // format data and calculate daily changes
  const formatted = poolAddresses.reduce((accum: { [address: string]: PoolData }, address) => {
    const current: PoolFields | undefined = parsed[address]
    const oneDay: PoolFields | undefined = parsed24h[address]
    const twoDays: PoolFields | undefined = parsed48h[address]
    const week: PoolFields | undefined = parsed7d[address]
    const twoWeeks: PoolFields | undefined = parsed14d[address]

    const [volumeUSD, volumeUSDChange] = getChangeForPeriod(
      parseFloat(current?.volumeUSD),
      parseFloat(oneDay?.volumeUSD),
      parseFloat(twoDays?.volumeUSD)
    )

    const [volumeUSDWeek, volumeUSDChangeWeek] = getChangeForPeriod(
      parseFloat(current?.volumeUSD),
      parseFloat(week?.volumeUSD),
      parseFloat(twoWeeks?.volumeUSD)
    )

    // Hotifx: Subtract fees from TVL to correct data while subgraph is fixed.
    /**
     * Note: see issue desribed here https://github.com/Uniswap/v3-subgraph/issues/74
     * During subgraph deploy switch this month we lost logic to fix this accounting.
     * Grafted sync pending fix now.
     */

    const liquidityUSD = current ? parseFloat(current.reserveUSD) : 0
    const liquidityUSDChange = getPercentChange(parseFloat(current?.reserveUSD), parseFloat(oneDay?.reserveUSD))

    const liquidityToken0 = current ? parseFloat(current.reserve0) : 0
    const liquidityToken1 = current ? parseFloat(current.reserve1) : 0

    if (current) {
      accum[address] = {
        address,
        token0: {
          address: current.token0.id,
          name: formatTokenName(current.token0.id, current.token0.name, activeNetwork),
          symbol: formatTokenSymbol(current.token0.id, current.token0.symbol, activeNetwork),
        },
        token1: {
          address: current.token1.id,
          name: formatTokenName(current.token1.id, current.token1.name, activeNetwork),
          symbol: formatTokenSymbol(current.token1.id, current.token1.symbol, activeNetwork),
        },
        token0Price: parseFloat(current.token0Price),
        token1Price: parseFloat(current.token1Price),
        volumeUSD,
        volumeUSDChange,
        volumeUSDWeek,
        volumeUSDChangeWeek,
        liquidityUSD,
        liquidityUSDChange,
        liquidityToken0,
        liquidityToken1,
      }
    }

    return accum
  }, {})

  return {
    loading: anyLoading,
    error: anyError,
    data: formatted,
  }
}
