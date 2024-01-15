import { Form, GeneralField } from "@formily/core";
import { isSupportObservable, observe, toJS } from "@formily/reactive";
import { useEffect, useMemo, useState } from "react";
import type { IExpandableProps } from "./use-expandable-attach";
import type { IPaginationProps } from "./use-pagination-attach";
import type { IRowSelection } from "./use-row-selection-attach";

export const useObState = <T extends object>(
  $ob?: T,
): [T | undefined, T | undefined] => {
  const [state, setFeature] = useState($ob ? toJS($ob) : undefined);

  useEffect(() => {
    if (!state || !isSupportObservable(!$ob)) return;
    const disposer = observe($ob!, () => {
      setFeature(toJS($ob));
    });
    return disposer;
  }, [$ob]);
  return [state, $ob];
};

type SupportedProps = {
  rowSelection: IRowSelection;
  pagination: IPaginationProps;
  expandable: IExpandableProps;
};
export const useArrayCompPropsOf = <K extends keyof SupportedProps>(
  field: GeneralField | undefined,
  key: K,
) => {
  const $props = (field?.componentProps as any)?.[key];
  return useObState<SupportedProps[K]>($props);
};

export const useFormArrayProps = <K extends keyof SupportedProps>(
  form: Form,
  pattern: string,
  featureName: K,
) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  const array = useMemo(() => {
    return mounted ? form.query(pattern).take() : undefined;
  }, [mounted, pattern]);

  const $feature = array?.componentProps?.[featureName];

  return useObState<SupportedProps[K]>($feature);
};
