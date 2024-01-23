export const isReactElement = (obj: any): obj is React.ReactElement =>
  obj?.$$typeof && obj?._owner;
