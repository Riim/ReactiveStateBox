import { TValidator } from 'omyumyum';
import { Class } from 'type-fest';
export interface IDataField {
    keypath?: string | ((data: Record<string, any>, model: Object) => string);
    validate?: TValidator;
    wrapper?: Class;
    type?: () => IModelClass;
    placeholder?: any;
    default?: any;
    build?: (value: any, data: Record<string, any>, model: Object) => any;
}
export interface IDataFields {
    [propName: string]: IDataField;
}
export interface IModelClass extends Class {
    $dataFields?: IDataFields;
}
export interface IOptions<T = Object> {
    keypath?: string | ((data: Record<string, any>, model: T) => string);
    validate?: TValidator;
    wrapper?: Class;
    type?: () => IModelClass;
    placeholder?: any;
    default?: any;
    build?: (value: any, data: Record<string, any>, model: T) => any;
}
export declare function DataField<T = Object>(options?: IOptions<T>): (target: Object, propName: string) => any;
export declare function DataField<T = Object>(keypath?: string | ((data: Record<string, any>, model: Object) => string) | null, options?: IOptions<T>): (target: Object, propName: string) => any;
export declare function DataField<T = Object>(validate: TValidator | null, options?: IOptions<T>): (target: Object, propName: string) => any;
export declare function DataField<T = Object>(keypath: string | ((data: Record<string, any>, model: Object) => string) | null, validate: TValidator | null, options?: IOptions<T>): (target: Object, propName: string) => any;
