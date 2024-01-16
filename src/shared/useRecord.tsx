import { useExpressionScope, useField } from "@formily/react";

export const useRecord = () => {
  const field = useField();
  const scope = useExpressionScope();
  // https://github.com/alibaba/formily/releases/tag/v2.2.19
  //  >= 2.2.19
  const has = "record" in field;
  return has ? field.record : scope.$record;
};
