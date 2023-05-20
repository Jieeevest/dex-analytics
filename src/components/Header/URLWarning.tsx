import React from 'react'
import styled from 'styled-components'

import { AlertTriangle, X } from 'react-feather'
import { useURLWarningToggle, useURLWarningVisible } from '../../state/user/hooks'
import { isMobile } from 'react-device-detect'

export const StyledClose = styled(X)`
  :hover {
    cursor: pointer;
  }
`

export default function URLWarning() {
  const toggleURLWarning = useURLWarningToggle()
  const showURLWarning = useURLWarningVisible()

  return isMobile ? (
    <PhishAlert isActive={showURLWarning}>
      <div style={{ display: 'flex' }}>
        <AlertTriangle style={{ marginRight: 6 }} size={12} /> Make sure the URL is
        <code style={{ padding: '0 4px', display: 'inline', fontWeight: 'bold' }}>info.litedex.io</code>
      </div>
      <StyledClose size={12} onClick={toggleURLWarning} />
    </PhishAlert>
  ) : window.location.hostname === 'info.litedex.io' ? (
    <PhishAlert isActive={showURLWarning}>
      <div style={{ display: 'flex' }}>
        <AlertTriangle style={{ marginRight: 6 }} size={12} /> Always make sure the URL is
        <code style={{ padding: '0 4px', display: 'inline', fontWeight: 'bold' }}>info.litedex.io</code> - bookmark it
        to be safe.
      </div>
      <StyledClose size={12} onClick={toggleURLWarning} />
    </PhishAlert>
  ) : null
}

const PhishAlert = styled.div<{ isActive: any }>`
  width: 100%;
  padding: 6px 6px;
  background-color: ${({ theme }) => theme.primary1};
  color: white;
  font-size: 12px;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  display: ${({ isActive }) => (isActive ? 'flex' : 'none')};
`
