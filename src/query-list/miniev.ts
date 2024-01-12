/**
 * @deprecated
 */
export const QueryListEvent = {
  RESET: "QUERY_LIST_RESET",
  RESPONSE: "QUERY_LIST_RESPONSE",
  ERROR: "QUERY_LIST_ERROR",
} as const;
type ValueOf<T extends object, K extends keyof T = keyof T> = T[K];

export type TQueryListEvent = ValueOf<typeof QueryListEvent>;
const miniev = <EventKey extends string>() => {
  const ev = {
    _id: 1,
    _map: {} as Record<string, { fn: (payload?: any) => void; type: string }>,
    on(event: EventKey, listener: (payload?: any) => void) {
      const id = (this._id++).toString();
      this._map[id] = { fn: listener, type: event };
      return () => {
        delete this._map[id];
      };
    },
    off(id: string) {
      delete this._map[id];
    },
    trigger<T extends object>(event: EventKey, payload?: T) {
      const keys = Object.keys(this._map);
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        // 在极端情况下, 会出现 key 已经删除, 但循环还没跑完
        if (this._map[key] && this._map[key].type === event) {
          this._map[key].fn(payload);
        }
      }
    },
    drop() {
      this._map = undefined as any;
    },
  };
  return ev;
};
