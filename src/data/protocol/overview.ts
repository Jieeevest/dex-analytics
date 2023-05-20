import { getChangeForPeriod, getPercentChange } from '../../utils/data'
import { ProtocolData } from '../../state/protocol/reducer'
import gql from 'graphql-tag'
import { useQuery, ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { useDeltaTimestamps } from 'utils/queries'
import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { useMemo } from 'react'
import { useActiveNetworkVersion, useClients } from 'state/application/hooks'
import { SupportedDex } from 'constants/networks'

interface ProdFactory {
  totalTransactions: string
  totalVolumeUSD: string
  totalLiquidityUSD: string
}

interface OverviewResponse {
  prodFactories: ProdFactory[]
  factories?: ProdFactory[]
}

export const GLOBAL_DATA = (block?: number | null) => {
  const queryString = ` query overview {
      prodFactories(
       ${block ? `block: { number: ${block}}` : ``} 
       first: 1) {
        totalTransactions
        totalVolumeUSD
        totalLiquidityUSD
      }
    }`
  return gql(queryString)
}
export const PANCAKE_DATA = (block?: number | null) => {
  const queryString = ` query overview {
      pancakeFactories(
       ${block ? `block: { number: ${block}}` : ``} 
       first: 1) {
        totalTransactions
        totalVolumeUSD
        totalLiquidityUSD
      }
    }`
  return gql(queryString)
}

export function useFetchProtocolData(
  dataClientOverride?: ApolloClient<NormalizedCacheObject>,
  blockClientOverride?: ApolloClient<NormalizedCacheObject>
): {
  loading: boolean
  error: boolean
  data: ProtocolData
} {
  // get appropriate clients if override needed
  const [activeNetwork] = useActiveNetworkVersion()
  const { dataClient, blockClient } = useClients()
  const activeDataClient = dataClientOverride ?? dataClient
  const activeBlockClient = blockClientOverride ?? blockClient

  // offsetData
  // const tvlOffset = useTVLOffset()

  // get blocks from historic timestamps
  const [t24h, t48h] = useDeltaTimestamps()
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24h, t48h], activeBlockClient)
  const [block24h, block48h] = blocks ?? []

  // fetch all data
  const { loading, error, data } = useQuery<OverviewResponse>(
    activeNetwork.id === SupportedDex.PANCAKESWAP ? PANCAKE_DATA(null) : GLOBAL_DATA(null),
    {
      client: activeDataClient,
    }
  )

  const formatProdFactoryResponse = (rawProdFactory?: ProdFactory) => {
    if (rawProdFactory) {
      return {
        totalTransactions: parseFloat(rawProdFactory.totalTransactions),
        totalVolumeUSD: parseFloat(rawProdFactory.totalVolumeUSD),
        totalLiquidityUSD: parseFloat(rawProdFactory.totalLiquidityUSD),
      }
    }
    return null
  }

  const {
    loading: loading24h,
    error: error24h,
    data: data24h,
  } = useQuery<OverviewResponse>(GLOBAL_DATA(block24h?.number ?? undefined), { client: activeDataClient })

  const {
    loading: loading48h,
    error: error48h,
    data: data48h,
  } = useQuery<OverviewResponse>(GLOBAL_DATA(block48h?.number ?? undefined), { client: activeDataClient })

  const anyError = Boolean(error || error24h || error48h || blockError)
  const anyLoading = Boolean(loading || loading24h || loading48h)

  const parsed = formatProdFactoryResponse(data?.prodFactories?.[0])
  const parsed24h = formatProdFactoryResponse(data24h?.prodFactories?.[0])
  const parsed48h = formatProdFactoryResponse(data48h?.prodFactories?.[0])

  const formattedData: ProtocolData | undefined = useMemo(() => {
    if (anyError || anyLoading || !parsed || !parsed24h || !parsed48h || !blocks) {
      return undefined
    }
    // volume data
    const [volumeUSD, volumeUSDChange] = getChangeForPeriod(
      parsed?.totalVolumeUSD,
      parsed24h?.totalVolumeUSD,
      parsed48h?.totalVolumeUSD
    )

    // total value locked
    const liquidityUSDChange = getPercentChange(parsed?.totalLiquidityUSD, parsed24h?.totalLiquidityUSD)

    // 24H transactions
    const [totalTransactions, totalTransactionsChange] = getChangeForPeriod(
      parsed?.totalTransactions,
      parsed24h?.totalTransactions,
      parsed48h?.totalTransactions
    )

    return {
      volumeUSD,
      volumeUSDChange: typeof volumeUSDChange === 'number' ? volumeUSDChange : 0,
      liquidityUSD: parsed?.totalLiquidityUSD,
      liquidityUSDChange,
      totalTransactions,
      totalTransactionsChange,
    }
  }, [anyError, anyLoading, blocks, parsed, parsed24h, parsed48h])

  return {
    loading: anyLoading,
    error: anyError,
    data: formattedData,
  }
}
