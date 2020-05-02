import { EventEmitter } from 'cellx';
export declare class BaseModel extends EventEmitter {
    $original: this;
    id: string | undefined;
    get $id(): string;
    _fixedChanges: this | undefined;
    constructor();
    clone(): this;
    _clone(): this;
    absorbFrom(that: BaseModel): boolean;
    _absorbFrom(that: BaseModel): boolean;
    fixChanges(): this;
    discardChanges(): this;
    toData<T = Record<string, any>>(): T;
}
