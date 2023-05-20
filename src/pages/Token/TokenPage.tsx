import React, { useMemo, useState, useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import {
  useTokenData,
  usePoolsForToken,
  useTokenChartData,
  useTokenPriceData,
  useTokenTransactions,
} from 'state/tokens/hooks'
import styled from 'styled-components'
import { useColor } from 'hooks/useColor'
import ReactGA from 'react-ga'
import { ThemedBackground, PageWrapper } from 'pages/styled'
import { shortenAddress, getEtherscanLink, currentTimestamp } from 'utils'
import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed, AutoRow, RowFlat } from 'components/Row'
import { TYPE, StyledInternalLink } from 'theme'
import Loader, { LocalLoader } from 'components/Loader'
import { ExternalLink, Download } from 'react-feather'
import { ExternalLink as StyledExternalLink } from '../../theme/components'
import useTheme from 'hooks/useTheme'
import CurrencyLogo from 'components/CurrencyLogo'
import { formatAmount, formatDollarAmount } from 'utils/numbers'
import Percent from 'components/Percent'
import { ButtonPrimary, ButtonGray, SavedIcon, ButtonOutlinePrimary } from 'components/Button'
import { DarkGreyCard, DarkOutlineCard, LightGreyCard } from 'components/Card'
import { usePoolDatas } from 'state/pools/hooks'
import PoolTable from 'components/pools/PoolTable'
import LineChart from 'components/LineChart/alt'
import { unixToDate } from 'utils/date'
import { ToggleWrapper, ToggleElementFree } from 'components/Toggle/index'
import BarChart from 'components/BarChart/alt'
import CandleChart from 'components/CandleChart'
import TransactionTable from 'components/TransactionsTable'
import { useSavedTokens } from 'state/user/hooks'
import { ONE_HOUR_SECONDS, TimeWindow } from 'constants/intervals'
import { MonoSpace } from 'components/shared'
import dayjs from 'dayjs'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { networkPrefix } from 'utils/networkPrefix'
import { LitedexInfo } from 'constants/networks'
import { GenericImageWrapper } from 'components/Logo'
import { useCMCLink } from 'hooks/useCMCLink'
import CMCLogo from '../../assets/images/cmc.png'
import { isMobile } from 'react-device-detect'

enum ChartView {
  TVL,
  VOL,
  PRICE,
}

const DEFAULT_TIME_WINDOW = TimeWindow.WEEK

export default function TokenPage({
  match: {
    params: { address },
  },
}: RouteComponentProps<{ address: string }>) {
  const [activeNetwork] = useActiveNetworkVersion()

  address = address.toLowerCase()
  // theming
  const backgroundColor = useColor(address)
  const theme = useTheme()

  // scroll on page view
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const tokenData = useTokenData(address)
  const poolsForToken = usePoolsForToken(address)
  const poolDatas = usePoolDatas(poolsForToken ?? [])

  const transactions = useTokenTransactions(address)

  const chartData = useTokenChartData(address)

  // check for link to CMC
  const cmcLink = useCMCLink(address)

  // format for chart component
  const formattedTvlData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.totalLiquidityUSD,
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
          value: day.dailyVolumeUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  // chart labels
  const [view, setView] = useState(ChartView.VOL)
  const [latestValue, setLatestValue] = useState<number | undefined>()
  const [valueLabel, setValueLabel] = useState<string | undefined>()
  const [timeWindow, setTimeWindow] = useState(DEFAULT_TIME_WINDOW)

  // pricing data
  const priceData = useTokenPriceData(address, ONE_HOUR_SECONDS, timeWindow)
  console.log(priceData)
  const adjustedToCurrent = useMemo(() => {
    if (priceData && tokenData && priceData.length > 0) {
      const adjusted = Object.assign([], priceData)
      adjusted.push({
        time: currentTimestamp() / 1000,
        open: priceData[priceData.length - 1].close,
        close: tokenData?.priceUSD,
        high: tokenData?.priceUSD,
        low: priceData[priceData.length - 1].close,
      })
      return adjusted
    } else {
      return undefined
    }
  }, [priceData, tokenData])
  // watchlist
  const [savedTokens, addSavedToken] = useSavedTokens()

  return (
    <PageWrapper>
      {/* <ThemedBackground backgroundColor={backgroundColor} /> */}
      {tokenData ? (
        !tokenData.exists ? (
          <LightGreyCard style={{ textAlign: 'center' }}>
            No pool has been created with this token yet. Create one
            <StyledExternalLink style={{ marginLeft: '4px' }} href={`https://swap.litedex.io/#/add/${address}`}>
              here.
            </StyledExternalLink>
          </LightGreyCard>
        ) : (
          <AutoColumn gap="32px">
            <AutoColumn gap="32px">
              <ResponsiveBetween>
                <AutoRow width="fit-content" gap="4px">
                  <StyledInternalLink to={networkPrefix(activeNetwork)}>
                    <TYPE.main>{`Home > `}</TYPE.main>
                  </StyledInternalLink>
                  <StyledInternalLink to={networkPrefix(activeNetwork) + 'tokens'}>
                    <TYPE.label>{` Tokens `}</TYPE.label>
                  </StyledInternalLink>
                  <TYPE.main>{` > `}</TYPE.main>
                  <TYPE.label>{` ${tokenData.symbol} `}</TYPE.label>
                  <StyledExternalLink href={getEtherscanLink(1, address, 'address', activeNetwork)}>
                    <TYPE.main>{` (${shortenAddress(address)}) `}</TYPE.main>
                  </StyledExternalLink>
                </AutoRow>
                <OtherLink>
                  <StyledExternalLink href={getEtherscanLink(1, address, 'address', activeNetwork)}>
                    <ButtonOutlinePrimary padding="4px 8px">
                      <TYPE.main fontSize={'14px'} color={theme.primary1} marginRight="6px">
                        {isMobile ? 'Bscscan' : 'View on Bscscan'}
                      </TYPE.main>
                      <ExternalLink stroke={theme.primary1} size={'14px'} />
                    </ButtonOutlinePrimary>
                    {/* <ExternalLink stroke={theme.primary1} size={'17px'} style={{ marginLeft: '12px' }} /> */}
                  </StyledExternalLink>
                  <SavedIcon
                    style={{ marginLeft: '12px' }}
                    fill={savedTokens.includes(address)}
                    onClick={() => addSavedToken(address)}
                  />
                  {cmcLink && (
                    <StyledExternalLink
                      href={cmcLink}
                      style={{ marginLeft: '12px' }}
                      onClickCapture={() => {
                        ReactGA.event({
                          category: 'CMC',
                          action: 'CMC token page click',
                        })
                      }}
                    >
                      <StyledCMCLogo src={CMCLogo} />
                    </StyledExternalLink>
                  )}
                </OtherLink>
              </ResponsiveBetween>
              <ResponsiveRow gap="24px" align="flex-end">
                <AutoColumn gap="md">
                  <RowFixed gap="lg">
                    <CurrencyLogo address={address} />
                    <TYPE.label ml={'10px'} fontSize="20px">
                      {tokenData.name}
                    </TYPE.label>
                    <TYPE.main ml={'6px'} fontSize="20px">
                      ({tokenData.symbol})
                    </TYPE.main>
                    {activeNetwork === LitedexInfo ? null : (
                      <GenericImageWrapper src={activeNetwork.imageURL} style={{ marginLeft: '8px' }} size={'26px'} />
                    )}
                  </RowFixed>
                  <RowFlat style={{ marginTop: '8px' }}>
                    <PriceText mr="10px"> {formatAmount(tokenData.priceUSD, { notation: 'standard' })}</PriceText>
                    <Percent value={tokenData.priceUSDChange} />
                  </RowFlat>
                </AutoColumn>
                {activeNetwork !== LitedexInfo ? null : (
                  <RowFixed>
                    <StyledExternalLink href={`https://swap.litedex.io/#/add/${address}`}>
                      <ButtonOutlinePrimary width="170px" mr="12px">
                        <RowBetween>
                          <Download size={20} />
                          <div style={{ display: 'flex', alignItems: 'center' }}>Add Liquidity</div>
                        </RowBetween>
                      </ButtonOutlinePrimary>
                    </StyledExternalLink>
                    <StyledExternalLink href={`https://swap.litedex.io/#/swap?inputCurrency=${address}`}>
                      <ButtonPrimary width="100px" bgColor={backgroundColor}>
                        Trade
                      </ButtonPrimary>
                    </StyledExternalLink>
                  </RowFixed>
                )}
              </ResponsiveRow>
            </AutoColumn>
            <ContentLayout>
              <DarkOutlineCard>
                <AutoColumn gap="lg">
                  <AutoColumn gap="4px">
                    <TYPE.main fontWeight={400}>TVL</TYPE.main>
                    <TYPE.label fontSize="24px">{formatDollarAmount(tokenData.liquidityUSD)}</TYPE.label>
                    <Percent value={tokenData.liquidityUSDChange} />
                  </AutoColumn>
                  <AutoColumn gap="4px">
                    <TYPE.main fontWeight={400}>24h Trading Vol</TYPE.main>
                    <TYPE.label fontSize="24px">{formatDollarAmount(tokenData.volumeUSD)}</TYPE.label>
                    <Percent value={tokenData.volumeUSDChange} />
                  </AutoColumn>
                  <AutoColumn gap="4px">
                    <TYPE.main fontWeight={400}>7d Trading Vol</TYPE.main>
                    <TYPE.label fontSize="24px">{formatDollarAmount(tokenData.volumeUSDWeek)}</TYPE.label>
                  </AutoColumn>
                </AutoColumn>
              </DarkOutlineCard>
              <DarkOutlineCard>
                <RowBetween align="flex-start">
                  <AutoColumn>
                    <RowFixed>
                      <TYPE.label fontSize="24px" height="30px">
                        <MonoSpace>
                          {latestValue
                            ? formatAmount(latestValue)
                            : view === ChartView.VOL
                            ? formatDollarAmount(formattedVolumeData[formattedVolumeData.length - 1]?.value)
                            : view === ChartView.TVL
                            ? formatDollarAmount(formattedTvlData[formattedTvlData.length - 1]?.value)
                            : formatAmount(tokenData.priceUSD, { notation: 'standard' })}
                        </MonoSpace>
                      </TYPE.label>
                    </RowFixed>
                    <TYPE.main height="20px" fontSize="12px">
                      {valueLabel ? (
                        <MonoSpace>{valueLabel} (UTC)</MonoSpace>
                      ) : (
                        <MonoSpace>{dayjs.utc().format('MMM D, YYYY')}</MonoSpace>
                      )}
                    </TYPE.main>
                  </AutoColumn>
                  <ToggleWrapper width="180px">
                    <ToggleElementFree
                      isActive={view === ChartView.VOL}
                      fontSize="12px"
                      onClick={() => (view === ChartView.VOL ? setView(ChartView.TVL) : setView(ChartView.VOL))}
                    >
                      Volume
                    </ToggleElementFree>
                    <ToggleElementFree
                      isActive={view === ChartView.TVL}
                      fontSize="12px"
                      onClick={() => (view === ChartView.TVL ? setView(ChartView.PRICE) : setView(ChartView.TVL))}
                    >
                      TVL
                    </ToggleElementFree>
                    <ToggleElementFree
                      isActive={view === ChartView.PRICE}
                      fontSize="12px"
                      onClick={() => setView(ChartView.PRICE)}
                    >
                      Price
                    </ToggleElementFree>
                  </ToggleWrapper>
                </RowBetween>
                {view === ChartView.TVL ? (
                  <LineChart
                    style={{ boxShadow: 'none', padding: '0px' }}
                    data={formattedTvlData}
                    color={backgroundColor}
                    height={280}
                    value={latestValue}
                    label={valueLabel}
                    setValue={setLatestValue}
                    setLabel={setValueLabel}
                  />
                ) : view === ChartView.VOL ? (
                  <BarChart
                    style={{ boxShadow: 'none', padding: '0px' }}
                    data={formattedVolumeData}
                    color={backgroundColor}
                    height={280}
                    value={latestValue}
                    label={valueLabel}
                    setValue={setLatestValue}
                    setLabel={setValueLabel}
                  />
                ) : view === ChartView.PRICE ? (
                  adjustedToCurrent ? (
                    <CandleChart
                      data={adjustedToCurrent}
                      setValue={setLatestValue}
                      setLabel={setValueLabel}
                      color={backgroundColor}
                      height={280}
                    />
                  ) : (
                    <LocalLoader fill={false} />
                  )
                ) : null}
                {/* <RowBetween width="100%">
                  <div> </div>
                  <AutoRow gap="4px" width="fit-content">
                    <SmallOptionButton
                      active={timeWindow === TimeWindow.DAY}
                      onClick={() => setTimeWindow(TimeWindow.DAY)}
                    >
                      24H
                    </SmallOptionButton>
                    <SmallOptionButton
                      active={timeWindow === TimeWindow.WEEK}
                      onClick={() => setTimeWindow(TimeWindow.WEEK)}
                    >
                      1W
                    </SmallOptionButton>
                    <SmallOptionButton
                      active={timeWindow === TimeWindow.MONTH}
                      onClick={() => setTimeWindow(TimeWindow.MONTH)}
                    >
                      1M
                    </SmallOptionButton>
                    <SmallOptionButton
                      active={timeWindow === TimeWindow.DAY}
                      onClick={() => setTimeWindow(TimeWindow.DAY)}
                    >
                      All
                    </SmallOptionButton>
                  </AutoRow>
                </RowBetween> */}
              </DarkOutlineCard>
            </ContentLayout>
            <TYPE.main>Pools</TYPE.main>
            <PoolTable poolDatas={poolDatas} />
            <TYPE.main>Transactions</TYPE.main>
            {transactions ? (
              <TransactionTable transactions={transactions} color={backgroundColor} />
            ) : (
              <LocalLoader fill={false} />
            )}
          </AutoColumn>
        )
      ) : (
        <Loader />
      )}
    </PageWrapper>
  )
}

const PriceText = styled(TYPE.label)`
  font-size: 36px;
  line-height: 0.8;
`

const ContentLayout = styled.div`
  margin-top: 16px;
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-gap: 1em;

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
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

const StyledCMCLogo = styled.img`
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
`
const ResponsiveRow = styled(RowBetween)<{ gap?: string }>`
  @media (max-width: 720px) {
    flex-direction: column;
    align-items: flex-start;
    row-gap: ${({ gap }) => gap ?? '10px'};
    width: 100%;
  }
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
