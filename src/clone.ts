const hasOwn = Object.prototype.hasOwnProperty;

export function cloneArray(arr: Array<any>): Array<any> {
	let i = arr.length;
	let copy = new Array(i);

	while (i) {
		copy[i] = clone(arr[--i]);
	}

	return copy;
}

export function clone(value: any): any {
	if (value == null || typeof value != 'object') {
		return value;
	}
	if (value instanceof Date) {
		return new Date(value);
	}
	if (Array.isArray(value)) {
		return cloneArray(value);
	}
	if (typeof value.clone == 'function') {
		return value.clone.length ? value.clone(true) : value.clone();
	}

	let copy = {};

	for (let key in value) {
		if (hasOwn.call(value, key)) {
			copy[key] = clone(value[key]);
		}
	}

	return copy;
}
