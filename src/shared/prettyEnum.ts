type Value = string | number;

type OptionLike = {
  label: string;
  value: string | number;
  children?: OptionLike[];
};

export const isLabelInValue = (x: any): x is OptionLike => x?.label != null;

const isLabelInValueList = (x: any[]): x is OptionLike[] =>
  isLabelInValue(x?.[0]);

export const prettyEnum = (
  value: Value | OptionLike | Value[] | OptionLike[],
  options: OptionLike[],
): string[] => {
  let labels: string[] = [];
  if (Array.isArray(value)) {
    if (isLabelInValueList(value)) {
      return value.map((item) => item.label);
    } else {
      const found = value.reduce(
        (info, val) => {
          // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
          const me = info.parent.find((x) => x.value == val);
          if (me) {
            info.chain.push(me.label!);
            info.parent = me.children!;
          }
          return info;
        },
        { parent: options, chain: [] as string[] },
      );
      labels = found.chain;
    }
    return labels;
  } else {
    const label = isLabelInValue(value)
      ? value.label
      : // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
        options.find((x) => x.value == value)?.label;
    return label ? [label] : [];
  }
};
