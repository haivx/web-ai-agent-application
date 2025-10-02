export type ReactNode = any;
export type Dispatch<A> = (value: A) => void;
export type SetStateAction<S> = S | ((prevState: S) => S);
export type MutableRefObject<T> = { current: T };

export interface FunctionComponent<P = {}> {
  (props: P & { children?: ReactNode }): ReactNode;
}

export const Fragment: FunctionComponent<{ children?: ReactNode }>;
export function createElement(type: any, props: any, ...children: ReactNode[]): ReactNode;
export function useState<S>(initialState: S | (() => S)): [S, (value: SetStateAction<S>) => void];
export function useMemo<T>(factory: () => T, deps?: unknown[]): T;
export function useCallback<T extends (...args: any[]) => any>(callback: T, deps?: unknown[]): T;
export function useRef<T>(initial: T): MutableRefObject<T>;
export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;

export const Children: {
  toArray(children: ReactNode): ReactNode[];
};

export interface JSX {
  IntrinsicElements: Record<string, any>;
}

export {}; 
