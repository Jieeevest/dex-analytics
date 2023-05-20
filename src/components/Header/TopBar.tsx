import React from 'react'
import styled from 'styled-components'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { ExternalLink, TYPE } from 'theme'
import { useNativePrices } from 'hooks/useEthPrices'
import { formatDollarAmount } from 'utils/numbers'
import Polling from './Polling'

const Wrapper = styled.div`
  width: 100%;
  background-color: rgba(30, 192, 30, 0.04);
  padding: 10px 20px;
  backdrop-filter: blur(10px);
`

const Item = styled(TYPE.main)`
  font-size: 12px;
`

const StyledLink = styled(ExternalLink)`
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
`

const TopBar = () => {
  const nativePrices = useNativePrices()
  return (
    <Wrapper>
      <RowBetween>
        <Polling />
        {/* <AutoRow gap="6px">
          <RowFixed>
            <Item>Bnb Price:</Item>
            <Item fontWeight="700" ml="4px">
              {formatDollarAmount(nativePrices?.current)}
            </Item>
          </RowFixed>
        </AutoRow> */}
        <AutoRow gap="6px" style={{ justifyContent: 'flex-end' }}>
          <StyledLink href="https://litedex.io">Homepage</StyledLink>
          <StyledLink href="https://docs.litedex.io/">Docs</StyledLink>
          <StyledLink href="https://swap.litedex.io/#/swap">Swap</StyledLink>
          <StyledLink href="https://app.litedex.io/staking/">App</StyledLink>
          <StyledLink href="https://academy.litedex.io/">Academy</StyledLink>
        </AutoRow>
      </RowBetween>
    </Wrapper>
  )
}

export default TopBar
