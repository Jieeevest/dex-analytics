// used to mark unsupported tokens, these are hosted lists of unsupported tokens

export const UNSUPPORTED_LIST_URLS: string[] = []
// export const OPTIMISM_LIST = 'https://static.optimism.io/optimism.tokenlist.json'
// export const ARBITRUM_LIST = 'https://tokenlist.arbitrum.io/ArbTokenLists/arbed_arb_whitelist_era.json'
// export const POLYGON_LIST =
// 'https://unpkg.com/quickswap-default-token-list@1.2.2/build/quickswap-default.tokenlist.json'
// export const CELO_LIST = 'https://celo-org.github.io/celo-token-list/celo.tokenlist.json'

export const BSC_LIST = 'https://raw.githubusercontent.com/Jieeevest/assets/main/list/bscList.json'

// lower index == higher priority for token import
export const DEFAULT_LIST_OF_LISTS: string[] = [
  // OPTIMISM_LIST,
  // ARBITRUM_LIST,
  // POLYGON_LIST,
  // CELO_LIST,
  BSC_LIST,
  ...UNSUPPORTED_LIST_URLS, // need to load unsupported tokens as well
]

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [BSC_LIST]
