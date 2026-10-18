import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// False during SSR and hydration, true once running on the client.
// Lets components skip server rendering without setState-in-effect.
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
