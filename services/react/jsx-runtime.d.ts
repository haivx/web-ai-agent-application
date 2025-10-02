import type { ReactNode } from "./index";

export interface JSXElement {
  type: any;
  key: string | number | null;
  props: Record<string, unknown> & { children?: ReactNode };
}

export declare const Fragment: unique symbol;
export declare function jsx(type: any, props: any, key?: string | number): JSXElement;
export declare function jsxs(type: any, props: any, key?: string | number): JSXElement;
