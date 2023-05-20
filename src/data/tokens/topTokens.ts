import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { useActiveNetworkVersion, useClients } from 'state/application/hooks'
import { useDeltaTimestamps } from 'utils/queries'

export const TOP_TOKENS = (timestamp24hAgo: number) => {
  const [activeNetwork] = useActiveNetworkVersion()
  const whereQuery = activeNetwork.id === 0 ? `` : `where: { date_gt: ${timestamp24hAgo}}`
  const queryString = `query topTokens {
    tokenDayDatas(first: 30, orderDirection: desc, orderBy: dailyVolumeUSD, ${whereQuery}) {
      id
    }
  }`
  return gql(queryString)
}

interface TopTokensResponse {
  tokenDayDatas: {
    id: string
  }[]
}

/**
 * Fetch top addresses by volume
 */
export function useTopTokenAddresses(): {
  loading: boolean
  error: boolean
  addresses: string[] | undefined
} {
  const { dataClient } = useClients()
  const [timestamp24hAgo] = useDeltaTimestamps()
  const { loading, error, data } = useQuery<TopTokensResponse>(TOP_TOKENS(timestamp24hAgo), { client: dataClient })

  const formattedData = useMemo(() => {
    if (data) {
      return data.tokenDayDatas.map((t) => t.id.split('-')[0])
    } else {
      return undefined
    }
  }, [data])

  return {
    loading: loading,
    error: Boolean(error),
    addresses: formattedData,
  }
}
