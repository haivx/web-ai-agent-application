import type { ReactNode } from "react";

export function createPortal(children: ReactNode, container: unknown): ReactNode;
export function render(...args: unknown[]): void;
export function unmountComponentAtNode(container: unknown): void;
export function findDOMNode(instance: unknown): unknown;
export function flushSync(fn: () => void): void;

export const version: string;
