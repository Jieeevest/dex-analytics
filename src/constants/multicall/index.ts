import { SupportedChainId } from 'constants/chains'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId: number]: string } = {
  [SupportedChainId.MAINNET]: '0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441',
  [SupportedChainId.BSC]: '0x1Ee38d535d541c55C9dae27B12edf090C608E6Fb',
  [SupportedChainId.AVALANCHE]: '0x1684C3C59c533A9062e54228d35eCA64db191AaC'
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
