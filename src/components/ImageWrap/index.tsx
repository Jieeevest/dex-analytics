import styled from 'styled-components'

export const ImageWrap = styled.img<{ size?: string; smSize?: string; mdSize?: string; xsSize?: string }>`
  height: ${({ size }) => size};
  @media (max-width: 500px) {
    height: ${({ xsSize }) => xsSize};
  }
  @media (max-width: 720px) {
    height: ${({ smSize }) => smSize};
  }
  @media (max-width: 960px) {
    height: ${({ mdSize }) => mdSize};
  }
`
