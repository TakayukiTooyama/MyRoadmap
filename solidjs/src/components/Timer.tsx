import { createSignal, onCleanup } from 'solid-js';

export const Timer = () => {
  const [count, setCount] = createSignal(0);

  const timer = setInterval(() => setCount(count() + 1), 1000);
  onCleanup(() => clearInterval(timer));

  return <div>Count: {count()}</div>;
};
