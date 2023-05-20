import React, { useMemo } from 'react'
import styled from 'styled-components'
import { isAddress } from 'utils'
import Logo from '../Logo'
import { useCombinedActiveList } from 'state/lists/hooks'
import useHttpLocations from 'hooks/useHttpLocations'
import { useActiveNetworkVersion } from 'state/application/hooks'
import LITEDEX_LOGO from '../../assets/logo/litedex_2.png'

export const getTokenLogoURL = (address: string) => {
  if (address.toLowerCase() == '0x8286387174b8667ae5222306a27e9ab5189b503b') {
    return LITEDEX_LOGO
  }
  return `https://assets-cdn.trustwallet.com/blockchains/smartchain/assets/${address}/logo.png`
}

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
  color: ${({ theme }) => theme.text4};
`

export default function CurrencyLogo({
  address,
  size = '24px',
  style,
  ...rest
}: {
  address?: string
  size?: string
  style?: React.CSSProperties
}) {
  // useOptimismList()
  const optimismList = useCombinedActiveList()?.[10]
  const arbitrumList = useCombinedActiveList()?.[42161]
  const polygon = useCombinedActiveList()?.[137]
  const celo = useCombinedActiveList()?.[42220]
  const bsc = useCombinedActiveList()?.[56]

  const [activeNetwork] = useActiveNetworkVersion()

  const checkSummed = isAddress(address)

  const optimismURI = useMemo(() => {
    if (checkSummed && optimismList?.[checkSummed]) {
      return optimismList?.[checkSummed].token.logoURI
    }
    return undefined
  }, [checkSummed, optimismList])
  const uriLocationsOptimism = useHttpLocations(optimismURI)

  const arbitrumURI = useMemo(() => {
    if (checkSummed && arbitrumList?.[checkSummed]) {
      return arbitrumList?.[checkSummed].token.logoURI
    }
    return undefined
  }, [checkSummed, arbitrumList])
  const uriLocationsArbitrum = useHttpLocations(arbitrumURI)

  const polygonURI = useMemo(() => {
    if (checkSummed && polygon?.[checkSummed]) {
      return polygon?.[checkSummed].token.logoURI
    }
    return undefined
  }, [checkSummed, polygon])
  const uriLocationsPolygon = useHttpLocations(polygonURI)

  const celoURI = useMemo(() => {
    if (checkSummed && celo?.[checkSummed]) {
      return celo?.[checkSummed].token.logoURI
    }
    return undefined
  }, [checkSummed, celo])
  const uriLocationsCelo = useHttpLocations(celoURI)

  const bscURI = useMemo(() => {
    if (checkSummed && bsc?.[checkSummed]) {
      return bsc?.[checkSummed].token.logoURI
    }
    return undefined
  }, [checkSummed, bsc])
  const uriLocationsBsc = useHttpLocations(bscURI)

  //temp until token logo issue merged
  const tempSources: { [address: string]: string } = useMemo(() => {
    return {
      ['0x4dd28568d05f09b02220b09c2cb307bfd837cb95']:
        'https://assets.coingecko.com/coins/images/18143/thumb/wCPb0b88_400x400.png?1630667954',
    }
  }, [])

  const srcs: string[] = useMemo(() => {
    const checkSummed = isAddress(address)

    if (checkSummed && address) {
      const override = tempSources[address]
      return [
        getTokenLogoURL(checkSummed),
        ...uriLocationsOptimism,
        ...uriLocationsArbitrum,
        ...uriLocationsPolygon,
        ...uriLocationsCelo,
        ...uriLocationsBsc,
        override,
      ]
    }
    return []
  }, [
    address,
    tempSources,
    uriLocationsArbitrum,
    uriLocationsOptimism,
    uriLocationsPolygon,
    uriLocationsCelo,
    uriLocationsBsc,
  ])

  return <StyledLogo size={size} srcs={srcs} alt={'token logo'} style={style} {...rest} />
}
