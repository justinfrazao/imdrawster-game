import React from 'react'

const PromptDisplay = (props) => {
  return (
    <>
      <p>Category: {props.category}</p>
      <p>Prompt: {props.prompt}</p>
    </>
  )
}

export default PromptDisplay;
