import { BaseModel } from './BaseModel';
import { IModelClass } from './DataField';
export { IDataField, IDataFields, IModelClass, IOptions, DataField } from './DataField';
export { BaseModel } from './BaseModel';
export declare class ReactiveStateBox {
    _models: Map<IModelClass, Map<any, BaseModel>>;
    initialize?: () => void;
    constructor(initialize?: () => void);
    get<T extends BaseModel = BaseModel>(type: Function, id?: any): T | null;
    get<T extends BaseModel = BaseModel>(type: Function, id?: Array<any>): Array<T | null>;
    getAll<T extends BaseModel = BaseModel>(type: Function): Array<T>;
    set(type: Function, model: BaseModel): this;
    model<T extends BaseModel | Array<BaseModel>>(type: IModelClass, data: Record<string, any>, prevModel?: BaseModel | null): T;
    discard(type: Function, id?: any): boolean;
    clear(): this;
}
