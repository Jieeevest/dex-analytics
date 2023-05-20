import { useAllTokenData } from 'state/tokens/hooks'
import { TokenData } from 'state/tokens/reducer'
import { useFetchedTokenDatas } from 'data/tokens/tokenData'
import gql from 'graphql-tag'
import { useState, useEffect, useMemo } from 'react'
import { client } from 'apollo/client'
import { usePoolDatas, useAllPoolData } from 'state/pools/hooks'
import { PoolData } from 'state/pools/reducer'
import { notEmpty, escapeRegExp } from 'utils'

const TOKEN_SEARCH = gql`
  query tokens($symbol: String, $name: String, $id: ID) {
    asSymbol: tokens(first: 10, where: { symbol_contains: $symbol }, orderBy: tradeVolumeUSD, orderDirection: desc) {
      id
    }
    asName: tokens(first: 10, where: { name_contains: $name }, orderBy: tradeVolumeUSD, orderDirection: desc) {
      id
    }
    asAddress: tokens(first: 1, where: { id: $id }, orderBy: tradeVolumeUSD, orderDirection: desc) {
      id
    }
  }
`

const POOL_SEARCH = gql`
  query pools($tokens: [String!]!, $id: ID) {
    as0: pairs(first: 10, where: { token0_in: $tokens }) {
      id
    }
    as1: pairs(first: 10, where: { token1_in: $tokens }) {
      id
    }
    asAddress: pairs(first: 1, where: { id: $id }) {
      id
    }
  }
`

interface SingleQueryResponse {
  id: string
}

interface TokenSearchResponse {
  asSymbol: SingleQueryResponse[]
  asName: SingleQueryResponse[]
  asAddress: SingleQueryResponse[]
}
interface PoolSearchResponse {
  as0: SingleQueryResponse[]
  as1: SingleQueryResponse[]
  asAddress: SingleQueryResponse[]
}

export function useFetchSearchResults(value: string): {
  tokens: TokenData[]
  pools: PoolData[]
  loading: boolean
} {
  const allTokens = useAllTokenData()
  const allPools = useAllPoolData()

  const [tokenData, setTokenData] = useState<TokenSearchResponse | undefined>()
  const [poolData, setPoolData] = useState<PoolSearchResponse | undefined>()

  // fetch data based on search input
  useEffect(() => {
    async function fetch() {
      try {
        const tokens = await client.query<TokenSearchResponse>({
          query: TOKEN_SEARCH,
          variables: {
            value: value ? value.toUpperCase() : '',
            id: value,
          },
        })
        const pools = await client.query<PoolSearchResponse>({
          query: POOL_SEARCH,
          variables: {
            tokens: tokens.data.asSymbol?.map((t) => t.id),
            id: value,
          },
        })

        if (tokens.data) {
          setTokenData(tokens.data)
        }
        if (pools.data) {
          setPoolData(pools.data)
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (value && value.length > 0) {
      fetch()
    }
  }, [value])

  const allFetchedTokens = useMemo(() => {
    if (tokenData) {
      return [...tokenData.asAddress, ...tokenData.asName, ...tokenData.asSymbol]
    }
    return []
  }, [tokenData])

  const allFetchedPools = useMemo(() => {
    if (poolData) {
      return [...poolData.asAddress, ...poolData.as0, ...poolData.as1]
    }
    return []
  }, [poolData])

  // format as token and pool datas
  const { data: tokenFullDatas, loading: tokenFullLoading } = useFetchedTokenDatas(allFetchedTokens.map((t) => t.id))

  const poolDatasFull = usePoolDatas(allFetchedPools.map((p) => p.id))
  const formattedTokens = useMemo(() => (tokenFullDatas ? Object.values(tokenFullDatas) : []), [tokenFullDatas])

  const newTokens = useMemo(() => {
    return formattedTokens.filter((t) => !Object.keys(allTokens).includes(t.address))
  }, [allTokens, formattedTokens])

  const combinedTokens = useMemo(() => {
    return [
      ...newTokens,
      ...Object.values(allTokens)
        .map((t) => t.data)
        .filter(notEmpty),
    ]
  }, [allTokens, newTokens])

  const filteredSortedTokens = useMemo(() => {
    return combinedTokens.filter((t) => {
      const regexMatches = Object.keys(t).map((tokenEntryKey) => {
        const isAddress = value.slice(0, 2) === '0x'
        if (tokenEntryKey === 'address' && isAddress) {
          return t[tokenEntryKey].match(new RegExp(escapeRegExp(value), 'i'))
        }
        if (tokenEntryKey === 'symbol' && !isAddress) {
          return t[tokenEntryKey].match(new RegExp(escapeRegExp(value), 'i'))
        }
        if (tokenEntryKey === 'name' && !isAddress) {
          return t[tokenEntryKey].match(new RegExp(escapeRegExp(value), 'i'))
        }
        return false
      })
      return regexMatches.some((m) => m)
    })
  }, [combinedTokens, value])

  const newPools = useMemo(() => {
    return poolDatasFull.filter((p) => !Object.keys(allPools).includes(p.address))
  }, [allPools, poolDatasFull])

  const combinedPools = useMemo(() => {
    return [
      ...newPools,
      ...Object.values(allPools)
        .map((p) => p.data)
        .filter(notEmpty),
    ]
  }, [allPools, newPools])

  const filteredSortedPools = useMemo(() => {
    return combinedPools.filter((t) => {
      const regexMatches = Object.keys(t).map((key) => {
        const isAddress = value.slice(0, 2) === '0x'
        if (key === 'address' && isAddress) {
          return t[key].match(new RegExp(escapeRegExp(value), 'i'))
        }
        if ((key === 'token0' || key === 'token1') && !isAddress) {
          return (
            t[key].name.match(new RegExp(escapeRegExp(value), 'i')) ||
            t[key].symbol.toLocaleLowerCase().match(new RegExp(escapeRegExp(value.toLocaleLowerCase()), 'i'))
          )
        }
        return false
      })
      return regexMatches.some((m) => m)
    })
  }, [combinedPools, value])

  return {
    tokens: filteredSortedTokens,
    pools: filteredSortedPools,
    loading: tokenFullLoading,
  }
}
