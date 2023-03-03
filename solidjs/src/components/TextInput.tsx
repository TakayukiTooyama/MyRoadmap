import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import { JSX } from 'solid-js';

export const TextInput: Component = () => {
  const [text, setText] = createSignal('default');

  const onChangeHandler: JSX.EventHandlerUnion<HTMLInputElement, Event> = event => {
    setText((event.target as HTMLInputElement).value);
  };

  return (
    <>
      <input type="text" onChange={onChangeHandler} />
      <p>Current input: {text()}</p>
    </>
  );
};
