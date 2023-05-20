import React, { useContext, useRef } from 'react'
import { BookOpen, Code, Info, MessageCircle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components'
import { ReactComponent as MenuIcon } from '../../assets/images/menu.svg'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleModal } from '../../state/application/hooks'
import { ExternalLink } from '../../theme'

const CODE_LINK = 'https://github.com/Litedex-Protocol'

export default function Menu() {
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.MENU)
  const toggle = useToggleModal(ApplicationModal.MENU)
  useOnClickOutside(node, open ? toggle : undefined)
  const theme = useContext(ThemeContext)

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any}>
      <StyledMenuButton onClick={toggle}>
        <StyledMenuIcon />
      </StyledMenuButton>

      {open && (
        <MenuFlyout>
          <MenuItem id="link" href="https://litedex.io/">
            <Info color={theme.primary1} size={14} />
            About
          </MenuItem>
          <MenuItem id="link" href="https://docs.litedex.io/">
            <BookOpen color={theme.primary1} size={14} />
            Docs
          </MenuItem>
          <MenuItem id="link" href={CODE_LINK}>
            <Code color={theme.primary1} size={14} />
            Github
          </MenuItem>
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}

const StyledMenuIcon = styled(MenuIcon)`
  path {
    stroke: ${({ theme }) => theme.primary1};
  }
`

const StyledMenuButton = styled.button`
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  /* background-color: ${({ theme }) => theme.bg0}; */

  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    /* background-color: ${({ theme }) => theme.bg4}; */
  }

  svg {
    margin-top: 2px;
  }
`

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

const MenuFlyout = styled.span`
  min-width: 8.125rem;
  background-color: ${({ theme }) => theme.bg0};
  box-shadow: inset 0px 0px 0px 1px ${({ theme }) => theme.shadowBrand};
  border-radius: 12px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 2.6rem;
  right: 0rem;
  z-index: 100;
`

const MenuItem = styled(ExternalLink)`
  flex: 1;
  padding: 0.5rem 0.5rem;
  color: ${({ theme }) => theme.text2};
  :hover {
    color: ${({ theme }) => theme.text1};
    cursor: pointer;
    text-decoration: none;
    opacity: 0.6;
  }
  > svg {
    margin-right: 8px;
  }
`
