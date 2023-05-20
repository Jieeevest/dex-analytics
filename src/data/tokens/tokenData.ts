import { getAmountChange, getChangeForPeriod, getPercentChange } from './../../utils/data'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { useDeltaTimestamps } from 'utils/queries'
import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { TokenData } from 'state/tokens/reducer'
import { useNativePrices } from 'hooks/useEthPrices'
import { formatTokenSymbol, formatTokenName } from 'utils/tokens'
import { useActiveNetworkVersion, useClients } from 'state/application/hooks'

export const TOKENS_BULK = (block: number | null, tokens: string[]) => {
  let tokenString = `[`
  tokens.map((address) => {
    return (tokenString += `"${address}",`)
  })
  tokenString += ']'
  const queryString =
    `
    query tokens {
      tokens(where: {id_in: ${tokenString}},` +
    (block ? `block: {number: ${block}} ,` : ``) +
    ` orderBy: tradeVolumeUSD, orderDirection: desc) {
        id
        symbol
        name
        derivedBNB
        derivedUSD
        tradeVolumeUSD
        totalTransactions
        totalLiquidity
      }
    }
    `
  return gql(queryString)
}

interface TokenFields {
  id: string
  symbol: string
  name: string
  derivedBNB: string // Price in BNB per token
  derivedUSD: string // Price in USD per token
  tradeVolumeUSD: string
  totalTransactions: string
  totalLiquidity: string
}

interface FormattedTokenFields
  extends Omit<TokenFields, 'derivedBNB' | 'derivedUSD' | 'tradeVolumeUSD' | 'totalTransactions' | 'totalLiquidity'> {
  derivedBNB: number
  derivedUSD: number
  tradeVolumeUSD: number
  totalTransactions: number
  totalLiquidity: number
}

interface TokenQueryResponse {
  tokens: TokenFields[]
}

/**
 * Fetch top addresses by volume
 */
export function useFetchedTokenDatas(tokenAddresses: string[]): {
  loading: boolean
  error: boolean
  data:
    | {
        [address: string]: TokenData
      }
    | undefined
} {
  const [activeNetwork] = useActiveNetworkVersion()
  const { dataClient } = useClients()

  // get blocks from historic timestamps
  const [t24h, t48h, t7d, t14d] = useDeltaTimestamps()

  const { blocks, error: blockError } = useBlocksFromTimestamps([t24h, t48h, t7d, t14d])
  const [block24h, block48h, block7d, block14d] = blocks ?? []
  const nativePrices = useNativePrices()

  const { loading, error, data } = useQuery<TokenQueryResponse>(TOKENS_BULK(null, tokenAddresses), {
    client: dataClient,
  })

  const {
    loading: loading24h,
    error: error24h,
    data: data24h,
  } = useQuery<TokenQueryResponse>(TOKENS_BULK(parseInt(block24h?.number), tokenAddresses), { client: dataClient })

  const {
    loading: loading48h,
    error: error48h,
    data: data48h,
  } = useQuery<TokenQueryResponse>(TOKENS_BULK(parseInt(block48h?.number), tokenAddresses), { client: dataClient })

  const {
    loading: loading7d,
    error: error7d,
    data: data7d,
  } = useQuery<TokenQueryResponse>(TOKENS_BULK(parseInt(block7d?.number), tokenAddresses), { client: dataClient })

  const {
    loading: loading14d,
    error: error14d,
    data: data14d,
  } = useQuery<TokenQueryResponse>(TOKENS_BULK(parseInt(block14d?.number), tokenAddresses), { client: dataClient })

  const anyError = Boolean(error || error24h || error48h || blockError || error7d || error14d)
  const anyLoading = Boolean(loading || loading24h || loading48h || loading7d || loading14d || !blocks)

  if (!nativePrices) {
    return {
      loading: true,
      error: false,
      data: undefined,
    }
  }

  // return early if not all data yet
  if (anyError || anyLoading) {
    return {
      loading: anyLoading,
      error: anyError,
      data: undefined,
    }
  }

  // Transforms tokens into "0xADDRESS: { ...TokenFields }" format and cast strings to numbers
  const parseTokenData = (tokens?: TokenFields[]) => {
    if (!tokens) {
      return {}
    }
    return tokens.reduce((accum: { [address: string]: FormattedTokenFields }, tokenData) => {
      const { derivedBNB, derivedUSD, tradeVolumeUSD, totalTransactions, totalLiquidity } = tokenData
      accum[tokenData.id.toLowerCase()] = {
        ...tokenData,
        derivedBNB: derivedBNB ? 0 : parseFloat(derivedBNB),
        derivedUSD: parseFloat(derivedUSD),
        tradeVolumeUSD: parseFloat(tradeVolumeUSD),
        totalTransactions: parseFloat(totalTransactions),
        totalLiquidity: parseFloat(totalLiquidity),
      }
      return accum
    }, {})
  }

  //parseData
  const parsed = parseTokenData(data?.tokens)
  const parsed24h = parseTokenData(data24h?.tokens)
  const parsed48h = parseTokenData(data48h?.tokens)
  const parsed7d = parseTokenData(data7d?.tokens)
  const parsed14d = parseTokenData(data14d?.tokens)

  const formatted = tokenAddresses.reduce((accum: { [address: string]: TokenData }, address) => {
    const current: FormattedTokenFields | undefined = parsed[address]
    const oneDay: FormattedTokenFields | undefined = parsed24h[address]
    const twoDays: FormattedTokenFields | undefined = parsed48h[address]
    const week: FormattedTokenFields | undefined = parsed7d[address]
    const twoWeeks: FormattedTokenFields | undefined = parsed14d[address]

    const [volumeUSD, volumeUSDChange] = getChangeForPeriod(
      current?.tradeVolumeUSD,
      oneDay?.tradeVolumeUSD,
      twoDays?.tradeVolumeUSD
    )
    const [volumeUSDWeek] = getChangeForPeriod(current?.tradeVolumeUSD, week?.tradeVolumeUSD, twoWeeks?.tradeVolumeUSD)
    const liquidityUSD = current ? current.totalLiquidity * current.derivedUSD : 0
    const liqudityUSDOneDayAgo = oneDay ? oneDay.totalLiquidity * oneDay.derivedUSD : 0
    const liquidityUSDChange = getPercentChange(liquidityUSD, liqudityUSDOneDayAgo)
    const liquidityToken = current ? current.totalLiquidity : 0
    // Prices of tokens for now, 24h ago and 7d ago
    const priceUSD = current ? current.derivedUSD : 0
    const priceUSDOneDay = oneDay ? oneDay.derivedUSD : 0
    const priceUSDWeek = week ? week.derivedUSD : 0
    const priceUSDChange = getPercentChange(priceUSD, priceUSDOneDay)
    const priceUSDChangeWeek = getPercentChange(priceUSD, priceUSDWeek)
    const totalTransactions = getAmountChange(current?.totalTransactions, oneDay?.totalTransactions)

    accum[address] = {
      exists: !!current,
      address,
      name: current ? formatTokenName(address, current.name, activeNetwork) : '',
      symbol: current ? formatTokenSymbol(address, current.symbol, activeNetwork) : '',
      volumeUSD,
      volumeUSDChange,
      volumeUSDWeek,
      totalTransactions,
      liquidityUSD,
      liquidityUSDChange,
      liquidityToken,
      priceUSD,
      priceUSDChange,
      priceUSDChangeWeek,
    }

    return accum
  }, {})

  return {
    loading: anyLoading,
    error: anyError,
    data: formatted,
  }
}
