import { DexInfo, LitedexInfo } from 'constants/networks'

export function networkPrefix(activeNewtork: DexInfo) {
  const isLitedex = activeNewtork === LitedexInfo
  if (isLitedex) {
    return '/'
  }
  const prefix = '/' + activeNewtork.route.toLocaleLowerCase() + '/'
  return prefix
}
