import React, { createContext, useRef, useState } from "react";

export interface IArrayTableDelegateContext {
  act: string;
  index: number;
  setAct: React.Dispatch<React.SetStateAction<{ index: number; act: string }>>;
  initLoader?: React.MutableRefObject<
    (record: any) => object | Promise<object>
  >;
}

export const ArrayTableDelegateContext =
  createContext<IArrayTableDelegateContext>({
    act: "",
    index: -1,
    setAct: () => {},
    initLoader: {
      current: () => ({}),
    },
  });

export const useDelegate = () => {
  const [info, setInfo] = useState({
    act: "",
    index: -1,
  });
  const initLoader = useRef(() => ({}));

  const ctx: IArrayTableDelegateContext = {
    act: info.act,
    index: info.index,
    initLoader,
    setAct: setInfo,
  };
  return ctx;
};

export const DATE_DELEGATE_INDEX_KEY = "data-pro-delegate-index";
export const DATE_DELEGATE_ACT_KEY = "data-pro-delegate-act";

export const isDelegateTarget = (x?: HTMLElement) => {
  const maybeIndex = x?.getAttribute(DATE_DELEGATE_INDEX_KEY);
  const maybeAct = x?.getAttribute(DATE_DELEGATE_ACT_KEY);
  return maybeIndex && maybeAct;
};

export const getDelegateInfo = (x?: HTMLElement) => {
  const maybeIndex = x?.getAttribute(DATE_DELEGATE_INDEX_KEY);
  const maybeAct = x?.getAttribute(DATE_DELEGATE_ACT_KEY);
  if (!isDelegateTarget(x)) return null;
  return {
    act: maybeAct,
    index: Number(maybeIndex),
  };
};
