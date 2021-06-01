import { Placement, ModifierPhases } from "./enums";
export declare type Obj = {
    [key: string]: any;
};
export declare type Rect = {
    width: number;
    height: number;
    x: number;
    y: number;
};
export declare type Offsets = {
    y: number;
    x: number;
};
export declare type PositioningStrategy = "absolute" | "fixed";
export declare type StateRects = {
    reference: Rect;
    popper: Rect;
};
export declare type StateOffsets = {
    popper: Offsets;
    arrow?: Offsets;
};
export declare type State = {
    isCreated: boolean;
    elements: {
        reference: Element | VirtualElement;
        popper: HTMLElement;
        arrow?: HTMLElement;
    };
    options: Options;
    placement: Placement;
    strategy: PositioningStrategy;
    orderedModifiers: Array<Modifier<any>>;
    rects: StateRects;
    scrollParents: {
        reference: Array<Element>;
        popper: Array<Element>;
    };
    styles: {
        [key: string]: Partial<CSSStyleDeclaration>;
    };
    attributes: {
        [key: string]: {
            [key: string]: string | boolean;
        };
    };
    modifiersData: {
        [key: string]: any;
    };
    reset: boolean;
};
export declare type Instance = {
    state: State;
    destroy: () => void;
    forceUpdate: () => void;
    update: () => Promise<Partial<State>>;
    setOptions: (options: Partial<Options>) => Promise<Partial<State>>;
};
export declare type ModifierArguments<Options extends Obj> = {
    state: Partial<State>;
    instance: Instance;
    options: Partial<Options>;
    name: string;
};
export declare type Modifier<Options> = {
    name: string;
    enabled: boolean;
    phase: ModifierPhases;
    requires?: Array<string>;
    requiresIfExists?: Array<string>;
    fn: (arg0: ModifierArguments<Options>) => State | null | undefined;
    effect?: (arg0: ModifierArguments<Options>) => () => void | null | undefined;
    options?: Obj;
    data?: Obj;
};
export declare type EventListeners = {
    scroll: boolean;
    resize: boolean;
};
export declare type Options = {
    placement: Placement;
    modifiers: Array<Partial<Modifier<any>>>;
    strategy: PositioningStrategy;
    onFirstUpdate?: (arg0: Partial<State>) => void;
};
export declare type UpdateCallback = (arg0: State) => void;
export declare type ClientRectObject = {
    x: number;
    y: number;
    top: number;
    left: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
};
export declare type SideObject = {
    top: number;
    left: number;
    right: number;
    bottom: number;
};
export declare type Padding = number | Partial<SideObject>;
export declare type VirtualElement = {
    getBoundingClientRect: () => ClientRect | DOMRect;
};
