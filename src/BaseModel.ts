import { NonEnumerable } from '@riim/enumerable-decorator';
import { nextUID } from '@riim/next-uid';
import { Cell, EventEmitter } from 'cellx';

let cloned: Map<string, BaseModel> | null = null;
let absorbed: Set<BaseModel> | null = null;

export class BaseModel extends EventEmitter {
	@NonEnumerable
	$original: this;

	id: string | undefined;

	get $id(): string {
		return this.$original.id!;
	}

	_fixedChanges: this | undefined;

	constructor() {
		super();
		this.$original = this;
	}

	clone(): this {
		let c = !cloned;

		if (c) {
			cloned = new Map();
		}

		let result = this._clone();

		if (c) {
			cloned = null;
		}

		return result;
	}

	_clone(): this {
		let id = this.$original.id;

		if (id && cloned!.has(id)) {
			return cloned!.get(id) as any;
		}

		let copy: BaseModel = new (this.constructor as any)();

		if (id) {
			cloned!.set(id, copy);
		}

		for (let name in this) {
			if (name.charAt(0) == '_' || name.charAt(0) == '$') {
				continue;
			}

			let value = this[name];

			if (value === (Object.prototype as any)[name]) {
				continue;
			}

			if (name == 'id') {
				copy.id = `copy-${nextUID()}-[${value}]`;
			} else if (
				typeof value != 'function' &&
				!(value instanceof Cell) &&
				value !== (copy as any)[name]
			) {
				(copy as any)[name] =
					value && typeof value == 'object' && (value as any).clone
						? (value as any).clone.length
							? (value as any).clone(true)
							: (value as any).clone()
						: value;
			}
		}

		copy.$original = this.$original;

		return copy as this;
	}

	absorbFrom(that: BaseModel): boolean {
		if (that == this) {
			return false;
		}

		let notAbsorbed = !absorbed;

		if (notAbsorbed) {
			absorbed = new Set();
		}

		let result = this._absorbFrom(that);

		if (notAbsorbed) {
			absorbed = null;
		}

		return result;
	}

	_absorbFrom(that: BaseModel): boolean {
		if (!(that instanceof BaseModel)) {
			throw TypeError('"that" must be instance of BaseModel');
		}

		if (absorbed!.has(this)) {
			return false;
		}

		absorbed!.add(this);

		let changed = false;

		for (let name in this) {
			if (name == 'id' || name.charAt(0) == '_' || name.charAt(0) == '$') {
				continue;
			}

			let value = this[name];

			if (value === (Object.prototype as any)[name]) {
				continue;
			}

			if (typeof value == 'function' || value instanceof Cell) {
				continue;
			}

			let thatValue = (that as any)[name];

			if (value !== thatValue) {
				if (
					value &&
					thatValue &&
					typeof value == 'object' &&
					typeof thatValue == 'object' &&
					((value as any) as BaseModel).absorbFrom &&
					((value as any) as BaseModel).absorbFrom === (thatValue as BaseModel).absorbFrom
				) {
					if ((value as any).absorbFrom(thatValue)) {
						changed = true;
					}
				} else {
					this[name] = value;
					changed = true;
				}
			}
		}

		return changed;
	}

	fixChanges(): this {
		if (this._fixedChanges) {
			this._fixedChanges.absorbFrom(this);
		} else {
			this._fixedChanges = this.clone();
		}

		return this;
	}

	discardChanges(): this {
		if (this._fixedChanges) {
			this.absorbFrom(this._fixedChanges);
		}

		return this;
	}

	toData<T = Record<string, any>>(): T {
		let data: Record<string, any> = {};

		for (let name in this) {
			if (name.charAt(0) == '_' || name.charAt(0) == '$') {
				continue;
			}

			if (name == 'id') {
				data.id = this.$id;
			}

			let value = this[name];

			if (typeof value == 'function' || value instanceof Cell) {
				continue;
			}

			data[name] =
				value && typeof value == 'object' && (value as any).toData
					? (value as any).toData()
					: value;
		}

		return data as T;
	}
}
