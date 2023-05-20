import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import gql from 'graphql-tag'
import { Transaction, TransactionType } from 'types'

const GLOBAL_TRANSACTIONS = gql`
  query overviewTransactions {
    mints: mints(first: 33, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
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
      to
      amount0
      amount1
      amountUSD
    }
    swaps: swaps(first: 33, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
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
      from
      amount0In
      amount1In
      amount0Out
      amount1Out
      amountUSD
    }
    burns: burns(first: 33, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
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
      sender
      amount0
      amount1
      amountUSD
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

export interface MintResponse {
  id: string
  timestamp: string
  pair: PairResponse
  to: string
  amount0: string
  amount1: string
  amountUSD: string
}

export interface SwapResponse {
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

export interface BurnResponse {
  id: string
  timestamp: string
  pair: PairResponse
  sender: string
  amount0: string
  amount1: string
  amountUSD: string
}

type TransactionEntry = {
  mints: MintResponse[]
  swaps: SwapResponse[]
  burns: BurnResponse[]
}

interface TransactionResults {
  transactions: TransactionEntry[]
}

export async function fetchTopTransactions(
  client: ApolloClient<NormalizedCacheObject>
): Promise<Transaction[] | undefined> {
  try {
    const { data, error, loading } = await client.query<TransactionEntry>({
      query: GLOBAL_TRANSACTIONS,
      fetchPolicy: 'cache-first',
    })

    if (error || loading || !data) {
      return undefined
    }
    const mints = data.mints.map((mint: MintResponse) => {
      return {
        type: TransactionType.MINT,
        hash: mint.id.split('-')[0],
        timestamp: mint.timestamp,
        sender: mint.to,
        token0Symbol: mint.pair.token0.symbol,
        token1Symbol: mint.pair.token1.symbol,
        token0Address: mint.pair.token0.id,
        token1Address: mint.pair.token1.id,
        amountUSD: parseFloat(mint.amountUSD),
        amountToken0: parseFloat(mint.amount0),
        amountToken1: parseFloat(mint.amount1),
      }
    })
    const burns = data.burns.map((burn: BurnResponse) => {
      return {
        type: TransactionType.BURN,
        hash: burn.id.split('-')[0],
        timestamp: burn.timestamp,
        sender: burn.sender,
        token0Symbol: burn.pair.token0.symbol,
        token1Symbol: burn.pair.token1.symbol,
        token0Address: burn.pair.token0.id,
        token1Address: burn.pair.token1.id,
        amountUSD: parseFloat(burn.amountUSD),
        amountToken0: parseFloat(burn.amount0),
        amountToken1: parseFloat(burn.amount1),
      }
    })
    const swaps = data.swaps.map((swap: SwapResponse) => {
      return {
        type: TransactionType.SWAP,
        hash: swap.id.split('-')[0],
        timestamp: swap.timestamp,
        sender: swap.from,
        token0Symbol: swap.pair.token0.symbol,
        token1Symbol: swap.pair.token1.symbol,
        token0Address: swap.pair.token0.id,
        token1Address: swap.pair.token1.id,
        amountUSD: parseFloat(swap.amountUSD),
        amountToken0: parseFloat(swap.amount0In) - parseFloat(swap.amount0Out),
        amountToken1: parseFloat(swap.amount1In) - parseFloat(swap.amount1Out),
      }
    })

    return [...mints, ...burns, ...swaps].sort((a, b) => {
      return parseInt(b.timestamp, 10) - parseInt(a.timestamp, 10)
    })
  } catch {
    return undefined
  }
}
