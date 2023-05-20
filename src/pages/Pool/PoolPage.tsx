import React, { useMemo, useState, useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import styled from 'styled-components'
import { useColor } from 'hooks/useColor'
import { ThemedBackground, PageWrapper } from 'pages/styled'
import { getEtherscanLink } from 'utils'
import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed, AutoRow } from 'components/Row'
import { TYPE, StyledInternalLink } from 'theme'
import Loader, { LocalLoader } from 'components/Loader'
import { ExternalLink, Download } from 'react-feather'
import { ExternalLink as StyledExternalLink } from '../../theme/components'
import useTheme from 'hooks/useTheme'
import CurrencyLogo from 'components/CurrencyLogo'
import { formatDollarAmount, formatAmount } from 'utils/numbers'
import Percent from 'components/Percent'
import { ButtonPrimary, ButtonGray, SavedIcon, ButtonOutlinePrimary } from 'components/Button'
import { DarkGreyCard, DarkOutlineCard, GreyCard, OutlineCard } from 'components/Card'
import { usePoolDatas, usePoolChartData, usePoolTransactions } from 'state/pools/hooks'
import { ToggleWrapper, ToggleElementFree } from 'components/Toggle/index'
import BarChart from 'components/BarChart/alt'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import TransactionTable from 'components/TransactionsTable'
import { useSavedPools } from 'state/user/hooks'
import { MonoSpace } from 'components/shared'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { networkPrefix } from 'utils/networkPrefix'
import { unixToDate } from 'utils/date'
import LineChart from 'components/LineChart/alt'
import { LitedexInfo } from 'constants/networks'
import { isMobile } from 'react-device-detect'

enum ChartView {
  VOL,
  PRICE,
  DENSITY,
  FEES,
}

export default function PoolPage({
  match: {
    params: { address },
  },
}: RouteComponentProps<{ address: string }>) {
  const [activeNetwork] = useActiveNetworkVersion()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // theming
  const backgroundColor = useColor()
  const theme = useTheme()

  // token data
  const poolData = usePoolDatas([address])[0]
  const chartData = usePoolChartData(address)
  const transactions = usePoolTransactions(address)

  const [view, setView] = useState(ChartView.VOL)
  const [latestValue, setLatestValue] = useState<number | undefined>()
  const [valueLabel, setValueLabel] = useState<string | undefined>()

  const formattedLiquidityData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.liquidityUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  const formattedVolumeData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.volumeUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  //watchlist
  const [savedPools, addSavedPool] = useSavedPools()
  return (
    <PageWrapper>
      {/* <ThemedBackground backgroundColor={backgroundColor} /> */}
      {poolData ? (
        <AutoColumn gap="32px">
          <ResponsiveBetween>
            <AutoRow width="fit-content" gap="4px">
              <StyledInternalLink to={networkPrefix(activeNetwork)}>
                <TYPE.main>{`Home > `}</TYPE.main>
              </StyledInternalLink>
              <StyledInternalLink to={networkPrefix(activeNetwork) + 'pools'}>
                <TYPE.label>{` Pools `}</TYPE.label>
              </StyledInternalLink>
              <TYPE.main>{` > `}</TYPE.main>
              <TYPE.label>{` ${poolData.token0.symbol} / ${poolData.token1.symbol} `}</TYPE.label>
            </AutoRow>
            <OtherLink>
              <StyledExternalLink href={getEtherscanLink(1, address, 'address', activeNetwork)}>
                <ButtonOutlinePrimary padding="4px 8px">
                  <TYPE.main fontSize={'14px'} color={theme.primary1} marginRight="6px">
                    {isMobile ? 'Bscscan' : 'View on Bscscan'}
                  </TYPE.main>
                  <ExternalLink stroke={theme.primary1} size={'14px'} />
                </ButtonOutlinePrimary>
              </StyledExternalLink>
              <SavedIcon
                fill={savedPools.includes(address)}
                style={{ marginLeft: '12px' }}
                onClick={() => addSavedPool(address)}
              />
            </OtherLink>
          </ResponsiveBetween>
          <ResponsiveRow gap="24px" align="flex-end">
            <AutoColumn gap="lg">
              <RowFixed>
                <DoubleCurrencyLogo address0={poolData.token0.address} address1={poolData.token1.address} size={24} />
                <TYPE.label
                  ml="8px"
                  mr="8px"
                  fontSize="36px"
                >{` ${poolData.token0.symbol} / ${poolData.token1.symbol} `}</TYPE.label>
              </RowFixed>
              <ResponsiveRow>
                <StyledInternalLink to={networkPrefix(activeNetwork) + 'tokens/' + poolData.token0.address}>
                  <TokenButton>
                    <RowFixed>
                      <CurrencyLogo address={poolData.token0.address} size={'20px'} />
                      <TYPE.label fontSize="16px" ml="4px" style={{ whiteSpace: 'nowrap' }} width={'fit-content'}>
                        {`1 ${poolData.token0.symbol} =  ${formatAmount(poolData.token1Price, {
                          notation: 'standard',
                        })} ${poolData.token1.symbol}`}
                      </TYPE.label>
                    </RowFixed>
                  </TokenButton>
                </StyledInternalLink>
                <CutomInternalLink to={networkPrefix(activeNetwork) + 'tokens/' + poolData.token1.address}>
                  <TokenButton>
                    <RowFixed>
                      <CurrencyLogo address={poolData.token1.address} size={'20px'} />
                      <TYPE.label fontSize="16px" ml="4px" style={{ whiteSpace: 'nowrap' }} width={'fit-content'}>
                        {`1 ${poolData.token1.symbol} =  ${formatAmount(poolData.token0Price, {
                          notation: 'standard',
                        })} ${poolData.token0.symbol}`}
                      </TYPE.label>
                    </RowFixed>
                  </TokenButton>
                </CutomInternalLink>
              </ResponsiveRow>
            </AutoColumn>
            {activeNetwork !== LitedexInfo ? null : (
              <RowFixed>
                <StyledExternalLink
                  href={`https://swap.litedex.io/#/add/${poolData.token0.address}/${poolData.token1.address}`}
                >
                  <ButtonOutlinePrimary width="170px" mr="12px">
                    <RowBetween>
                      <Download size={20} />
                      <div style={{ display: 'flex', alignItems: 'center' }}>Add Liquidity</div>
                    </RowBetween>
                  </ButtonOutlinePrimary>
                </StyledExternalLink>
                <StyledExternalLink
                  href={`https://swap.litedex.io/#/swap?inputCurrency=${poolData.token0.address}&outputCurrency=${poolData.token1.address}`}
                >
                  <ButtonPrimary width="100px">Swap</ButtonPrimary>
                </StyledExternalLink>
              </RowFixed>
            )}
          </ResponsiveRow>
          <ContentLayout>
            <DarkOutlineCard>
              <AutoColumn gap="lg">
                <GreyCard padding="16px">
                  <AutoColumn gap="md">
                    <TYPE.main>Total Tokens Locked</TYPE.main>
                    <RowBetween>
                      <RowFixed>
                        <CurrencyLogo address={poolData.token0.address} size={'20px'} />
                        <TYPE.label fontSize="14px" ml="8px">
                          {poolData.token0.symbol}
                        </TYPE.label>
                      </RowFixed>
                      <TYPE.label fontSize="14px">{formatAmount(poolData.liquidityToken0)}</TYPE.label>
                    </RowBetween>
                    <RowBetween>
                      <RowFixed>
                        <CurrencyLogo address={poolData.token1.address} size={'20px'} />
                        <TYPE.label fontSize="14px" ml="8px">
                          {poolData.token1.symbol}
                        </TYPE.label>
                      </RowFixed>
                      <TYPE.label fontSize="14px">{formatAmount(poolData.liquidityToken1)}</TYPE.label>
                    </RowBetween>
                  </AutoColumn>
                </GreyCard>
                <AutoColumn gap="4px">
                  <TYPE.main fontWeight={400}>Total Value Locked</TYPE.main>
                  <TYPE.label fontSize="24px">{formatDollarAmount(poolData.liquidityUSD)}</TYPE.label>
                  <Percent value={poolData.liquidityUSDChange} />
                </AutoColumn>
                <AutoColumn gap="4px">
                  <TYPE.main fontWeight={400}>Volume 24h</TYPE.main>
                  <TYPE.label fontSize="24px">{formatDollarAmount(poolData.volumeUSD)}</TYPE.label>
                  <Percent value={poolData.volumeUSDChange} />
                </AutoColumn>
              </AutoColumn>
            </DarkOutlineCard>
            <DarkOutlineCard>
              <ToggleRow align="center">
                <AutoColumn>
                  <TYPE.label fontSize="24px" height="30px">
                    <MonoSpace>
                      {latestValue
                        ? formatDollarAmount(latestValue)
                        : view === ChartView.VOL
                        ? formatDollarAmount(formattedVolumeData[formattedVolumeData.length - 1]?.value)
                        : view === ChartView.DENSITY
                        ? formatDollarAmount(formattedLiquidityData[formattedLiquidityData.length - 1]?.value)
                        : formatDollarAmount(formattedLiquidityData[formattedLiquidityData.length - 1]?.value)}{' '}
                    </MonoSpace>
                  </TYPE.label>
                  <TYPE.main height="20px" fontSize="12px">
                    {valueLabel ? <MonoSpace>{valueLabel} (UTC)</MonoSpace> : ''}
                  </TYPE.main>
                </AutoColumn>
                <ToggleWrapper width="240px">
                  <ToggleElementFree
                    isActive={view === ChartView.VOL}
                    fontSize="12px"
                    padding="4px 8px"
                    onClick={() => (view === ChartView.VOL ? setView(ChartView.DENSITY) : setView(ChartView.VOL))}
                  >
                    Volume
                  </ToggleElementFree>
                  <ToggleElementFree
                    isActive={view === ChartView.DENSITY}
                    fontSize="12px"
                    padding="4px 8px"
                    onClick={() => (view === ChartView.DENSITY ? setView(ChartView.VOL) : setView(ChartView.DENSITY))}
                  >
                    Liquidity
                  </ToggleElementFree>
                </ToggleWrapper>
              </ToggleRow>
              {view === ChartView.VOL ? (
                <BarChart
                  style={{ boxShadow: 'none', padding: '0px' }}
                  data={formattedVolumeData}
                  color={backgroundColor}
                  height={340}
                  setValue={setLatestValue}
                  setLabel={setValueLabel}
                  value={latestValue}
                  label={valueLabel}
                />
              ) : view === ChartView.DENSITY ? (
                <LineChart
                  style={{ boxShadow: 'none', padding: '0px' }}
                  data={formattedLiquidityData}
                  height={340}
                  color={backgroundColor}
                />
              ) : null}
            </DarkOutlineCard>
          </ContentLayout>
          <TYPE.main fontSize="24px">Transactions</TYPE.main>
          {transactions ? <TransactionTable transactions={transactions} /> : <LocalLoader fill={false} />}
        </AutoColumn>
      ) : (
        <Loader />
      )}
    </PageWrapper>
  )
}

const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-gap: 1em;

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
`

const TokenButton = styled(GreyCard)`
  padding: 8px 12px;
  border-radius: 10px;
  :hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const ResponsiveRow = styled(RowBetween)<{ gap?: string }>`
  @media (max-width: 720px) {
    flex-direction: column;
    align-items: flex-start;
    row-gap: ${({ gap }) => gap ?? '10px'};
    width: 100%;
  }
`

const ToggleRow = styled(RowBetween)`
  @media screen and (max-width: 600px) {
    flex-direction: column;
  }
`

const OtherLink = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  margin-top: 1rem;
`}
`

const CutomInternalLink = styled(StyledInternalLink)`
  margin-left: 10px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  margin-left: 0px;
`}
`

const ResponsiveBetween = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
flex-direction: column;
align-items: start;
`}
`
