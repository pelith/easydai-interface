import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { transparentize } from 'polished'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  > *:not(:first-child) {
    margin-top: 24px;
  }
`

const Headline = styled.h2`
  margin: 0;
  font-size: 32px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.barlow};
  color: ${({ theme }) => theme.colors.blue800};
`

const QAWrapper = styled.div`
  width: 90%;
  max-width: 600px;
  padding: 24px;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 2px 6px
      ${({ theme }) => transparentize(0.85, theme.colors.blue700)},
    0 -2px 20px -4px
      ${({ theme }) => transparentize(0.85, theme.colors.blue700)};
`

const QuestionText = styled.div`
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
`

const AnswerText = styled.div`
  font-size: 14px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  white-space: pre-line;

  &:not(:first-child) {
    margin-top: 12px;
  }
`

export default function Faq() {
  const { t } = useTranslation()

  const QAs = t('faq', { returnObjects: true })

  const renderQAs = () => {
    return QAs.map(QA => (
      <QAWrapper key={QA.question}>
        <QuestionText>{QA.question}</QuestionText>
        {QA.answer.split('/n').map((text, index) => (
          <AnswerText key={`${text}-${index}`}>{text}</AnswerText>
        ))}
      </QAWrapper>
    ))
  }

  return (
    <Container>
      <Headline>FAQ</Headline>
      {renderQAs()}
    </Container>
  )
}
