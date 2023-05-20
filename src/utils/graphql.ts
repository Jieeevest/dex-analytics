import { INFO_CLIENT } from 'apollo/client'

export const getGQLHeaders = (endpoint: string) => {
  if (endpoint === INFO_CLIENT) {
    return {
      'X-Sf':
        process.env.NEXT_PUBLIC_SF_HEADER ||
        // hack for inject CI secret on window
        (typeof window !== 'undefined' &&
          // @ts-ignore
          window.sfHeader),
    }
  }
  return undefined
}
