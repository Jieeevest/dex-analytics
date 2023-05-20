import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { useClients } from 'state/application/hooks'
import { notEmpty } from 'utils'
import { POOL_HIDE } from '../../constants'

export const TOP_POOLS = gql`
  query topPools {
    pairs(first: 20, orderBy: reserveUSD, orderDirection: desc, where: { totalTransactions_gt: 5 }) {
      id
    }
  }
`

interface TopPoolsResponse {
  pairs: {
    id: string
  }[]
}

/**
 * Fetch top addresses by volume
 */
export function useTopPoolAddresses(): {
  loading: boolean
  error: boolean
  addresses: string[] | undefined
} {
  const { dataClient } = useClients()
  const { loading, error, data } = useQuery<TopPoolsResponse>(TOP_POOLS, {
    client: dataClient,
    fetchPolicy: 'cache-first',
  })

  const formattedData = useMemo(() => {
    if (data) {
      return data.pairs
        .map((p) => {
          if (POOL_HIDE.includes(p.id.toLocaleLowerCase())) {
            return undefined
          }
          return p.id
        })
        .filter(notEmpty)
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
