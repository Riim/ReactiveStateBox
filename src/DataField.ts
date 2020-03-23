import { IType, TValidator } from 'omyumyum';
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

function getDataFields(modelCtor: IModelClass): IDataFields {
	return modelCtor.hasOwnProperty('$dataFields')
		? modelCtor.$dataFields!
		: (modelCtor.$dataFields = { __proto__: modelCtor.$dataFields || null } as any);
}

export function DataField<T = Object>(
	options?: IOptions<T>
): (target: Object, propName: string) => any;
export function DataField<T = Object>(
	keypath?: string | ((data: Record<string, any>, model: Object) => string) | null,
	options?: IOptions<T>
): (target: Object, propName: string) => any;
export function DataField<T = Object>(
	validate: TValidator | null,
	options?: IOptions<T>
): (target: Object, propName: string) => any;
export function DataField<T = Object>(
	keypath: string | ((data: Record<string, any>, model: Object) => string) | null,
	validate: TValidator | null,
	options?: IOptions<T>
): (target: Object, propName: string) => any;
export function DataField(
	arg1?:
		| string
		| ((data: Record<string, any>, model: Object) => string)
		| TValidator
		| IOptions
		| null,
	arg2?: TValidator | IOptions | null,
	options?: IOptions
) {
	let keypath: string | ((data: Record<string, any>, model: Object) => string) | undefined;
	let validate: TValidator | undefined;

	if (typeof arg1 == 'string' || (typeof arg1 == 'function' && !(arg1 as IType).isOmYumYum)) {
		keypath = arg1 as any;

		if (arg2) {
			if (typeof arg2 == 'function') {
				validate = arg2;
			} else {
				options = arg2;
			}
		}
	} else if (arg1) {
		if (typeof arg1 == 'function') {
			validate = arg1 as any;

			if (arg2) {
				options = arg2 as any;
			}
		} else {
			options = arg1;
		}
	} else if (arg2) {
		options = arg2 as any;
	}

	if (options) {
		if (keypath === undefined && options.keypath) {
			keypath = options.keypath;
		}
		if (!validate && options.validate) {
			validate = options.validate;
		}
	}

	return (target: Object, propName: string): any => {
		let dataFields = getDataFields(target.constructor as any);
		let dataField: IDataField = (dataFields[propName] = {
			__proto__: dataFields[propName] || Object.prototype
		} as any);

		dataField.keypath = keypath !== undefined ? keypath : propName;

		if (validate) {
			dataField.validate = validate;
		}
		if (options) {
			if (options.wrapper) {
				dataField.wrapper = options.wrapper;
			}
			if (options.type) {
				dataField.type = options.type;
			}
			if (options.placeholder !== undefined) {
				dataField.placeholder = options.placeholder;
			}
			if (options.default !== undefined) {
				dataField.default = options.default;
			}
			if (options.build) {
				dataField.build = options.build;
			}
		}
	};
}
