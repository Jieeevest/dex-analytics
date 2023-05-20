import { useState, useLayoutEffect, useMemo } from 'react'
import { shade } from 'polished'
import Vibrant from 'node-vibrant'
import { hex } from 'wcag-contrast'
import { Token } from '@uniswap/sdk-core'
import uriToHttp from 'utils/uriToHttp'
import { isAddress } from 'utils'

async function getColorFromToken(token: Token): Promise<string | null> {
  const path =
    token.address.toLowerCase() == '0x8286387174b8667ae5222306a27e9ab5189b503b'
      ? `https://raw.githubusercontent.com/Litedex-Protocol/brand-assets/main/symbol-litedex.svg`
      : `https://assets-cdn.trustwallet.com/blockchains/smartchain/assets/${token.address}/logo.png`

  return Vibrant.from(path)
    .getPalette()
    .then((palette) => {
      if (palette?.Vibrant) {
        let detectedHex = palette.Vibrant.hex
        let AAscore = hex(detectedHex, '#FFF')
        while (AAscore < 3) {
          detectedHex = shade(0.005, detectedHex)
          AAscore = hex(detectedHex, '#FFF')
        }
        return detectedHex
      }
      return null
    })
    .catch(() => null)
}

async function getColorFromUriPath(uri: string): Promise<string | null> {
  const formattedPath = uriToHttp(uri)[0]

  return Vibrant.from(formattedPath)
    .getPalette()
    .then((palette) => {
      if (palette?.Vibrant) {
        return palette.Vibrant.hex
      }
      return null
    })
    .catch(() => null)
}

export function useColor(address?: string) {
  const [color, setColor] = useState('#1ec01e')

  const formattedAddress = isAddress(address)

  const token = useMemo(() => {
    return formattedAddress ? new Token(1, formattedAddress, 0) : undefined
  }, [formattedAddress])

  useLayoutEffect(() => {
    let stale = false

    if (token) {
      getColorFromToken(token).then((tokenColor) => {
        if (!stale && tokenColor !== null) {
          setColor(tokenColor)
        }
      })
    }

    return () => {
      stale = true
      setColor('#1ec01e')
    }
  }, [token])

  return color
}

export function useListColor(listImageUri?: string) {
  const [color, setColor] = useState('#1ec01e')

  useLayoutEffect(() => {
    let stale = false

    if (listImageUri) {
      getColorFromUriPath(listImageUri).then((color) => {
        if (!stale && color !== null) {
          setColor(color)
        }
      })
    }

    return () => {
      stale = true
      setColor('#1ec01e')
    }
  }, [listImageUri])

  return color
}
