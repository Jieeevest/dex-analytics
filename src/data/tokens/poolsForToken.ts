import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import gql from 'graphql-tag'

export const POOLS_FOR_TOKEN = gql`
  query poolsForToken($address: String!) {
    asToken0: pairs(
      first: 15
      orderBy: trackedReserveBNB
      orderDirection: desc
      where: { token0: $address, totalTransactions_gt: 2 }
    ) {
      id
    }
    asToken1: pairs(
      first: 15
      orderBy: trackedReserveBNB
      orderDirection: desc
      where: { token1: $address, totalTransactions_gt: 2 }
    ) {
      id
    }
  }
`

interface PoolsForTokenResponse {
  asToken0: {
    id: string
  }[]
  asToken1: {
    id: string
  }[]
}

/**
 * Fetch top addresses by volume
 */
export async function fetchPoolsForToken(
  address: string,
  client: ApolloClient<NormalizedCacheObject>
): Promise<{
  loading: boolean
  error: boolean
  addresses: string[] | undefined
}> {
  try {
    const { loading, error, data } = await client.query<PoolsForTokenResponse>({
      query: POOLS_FOR_TOKEN,
      variables: {
        address: address,
      },
      fetchPolicy: 'cache-first',
    })

    if (loading || error || !data) {
      return {
        loading,
        error: Boolean(error),
        addresses: undefined,
      }
    }

    const formattedData = data.asToken0
      .concat(data.asToken1)
      .map((p) => p.id)
      .map((d) => d.toLocaleLowerCase())

    return {
      loading,
      error: Boolean(error),
      addresses: formattedData,
    }
  } catch {
    return {
      loading: false,
      error: true,
      addresses: undefined,
    }
  }
}
