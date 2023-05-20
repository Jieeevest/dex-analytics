import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import gql from 'graphql-tag'
import { Transaction, TransactionType } from 'types'

const POOL_TRANSACTIONS = gql`
  query poolTransactions($address: ID!) {
    mints(first: 35, orderBy: timestamp, orderDirection: desc, where: { pair: $address }, subgraphError: allow) {
      id
      timestamp
      to
      amount0
      amount1
      amountUSD
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
    }
    swaps(first: 35, orderBy: timestamp, orderDirection: desc, where: { pair: $address }, subgraphError: allow) {
      id
      timestamp
      from
      amount0In
      amount1In
      amount0Out
      amount1Out
      amountUSD
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
    }
    burns(first: 35, orderBy: timestamp, orderDirection: desc, where: { pair: $address }, subgraphError: allow) {
      id
      timestamp
      sender
      amount0
      amount1
      amountUSD
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
    }
  }
`
interface PairResponse {
  token0: {
    id: string
    symbol: string
  }
  token1: {
    id: string
    symbol: string
  }
}
interface MintResponse {
  id: string
  timestamp: string
  pair: PairResponse
  to: string
  amount0: string
  amount1: string
  amountUSD: string
}

interface SwapResponse {
  id: string
  timestamp: string
  pair: PairResponse
  from: string
  amount0In: string
  amount1In: string
  amount0Out: string
  amount1Out: string
  amountUSD: string
}

interface BurnResponse {
  id: string
  timestamp: string
  pair: PairResponse
  sender: string
  amount0: string
  amount1: string
  amountUSD: string
}
interface TransactionResults {
  mints: MintResponse[]
  swaps: SwapResponse[]
  burns: BurnResponse[]
}

export async function fetchPoolTransactions(
  address: string,
  client: ApolloClient<NormalizedCacheObject>
): Promise<{ data: Transaction[] | undefined; error: boolean; loading: boolean }> {
  const { data, error, loading } = await client.query<TransactionResults>({
    query: POOL_TRANSACTIONS,
    variables: {
      address: address,
    },
    fetchPolicy: 'cache-first',
  })

  if (error) {
    return {
      data: undefined,
      error: true,
      loading: false,
    }
  }

  if (loading && !data) {
    return {
      data: undefined,
      error: false,
      loading: true,
    }
  }

  const mints = data.mints.map((m) => {
    return {
      type: TransactionType.MINT,
      hash: m.id.split('-')[0],
      timestamp: m.timestamp,
      sender: m.to,
      token0Symbol: m.pair?.token0.symbol,
      token1Symbol: m.pair?.token1.symbol,
      token0Address: m.pair?.token0.id,
      token1Address: m.pair?.token1.id,
      amountUSD: parseFloat(m.amountUSD),
      amountToken0: parseFloat(m.amount0),
      amountToken1: parseFloat(m.amount1),
    }
  })
  const burns = data.burns.map((b) => {
    return {
      type: TransactionType.BURN,
      hash: b.id.split('-')[0],
      timestamp: b.timestamp,
      sender: b.sender,
      token0Symbol: b.pair?.token0.symbol,
      token1Symbol: b.pair?.token1.symbol,
      token0Address: b.pair?.token0.id,
      token1Address: b.pair?.token1.id,
      amountUSD: parseFloat(b.amountUSD),
      amountToken0: parseFloat(b.amount0),
      amountToken1: parseFloat(b.amount1),
    }
  })

  const swaps = data.swaps.map((s) => {
    return {
      type: TransactionType.SWAP,
      hash: s.id.split('-')[0],
      timestamp: s.timestamp,
      sender: s.from,
      token0Symbol: s.pair?.token0.symbol,
      token1Symbol: s.pair?.token1.symbol,
      token0Address: s.pair?.token0.id,
      token1Address: s.pair?.token1.id,
      amountUSD: parseFloat(s.amountUSD),
      amountToken0: parseFloat(s.amount0In) - parseFloat(s.amount0Out),
      amountToken1: parseFloat(s.amount1In) - parseFloat(s.amount1Out),
    }
  })

  return { data: [...mints, ...burns, ...swaps], error: false, loading: false }
}
