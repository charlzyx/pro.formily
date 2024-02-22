import { useReducer } from "react";
const acc = (x: number) => x + 1;

export const useUpdate = () => {
  const [_, update] = useReducer(acc, 0);
  return update;
};
