var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NonEnumerable } from '@riim/enumerable-decorator';
import { nextUID } from '@riim/next-uid';
import { Cell, EventEmitter } from 'cellx';
let cloned = null;
let absorbed = null;
export class BaseModel extends EventEmitter {
    constructor() {
        super();
        this.$original = this;
    }
    get $id() {
        return this.$original.id;
    }
    clone() {
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
    _clone() {
        let id = this.$original.id;
        if (id && cloned.has(id)) {
            return cloned.get(id);
        }
        let copy = new this.constructor();
        if (id) {
            cloned.set(id, copy);
        }
        for (let name in this) {
            if (name.charAt(0) == '_' || name.charAt(0) == '$') {
                continue;
            }
            let value = this[name];
            if (value === Object.prototype[name]) {
                continue;
            }
            if (name == 'id') {
                copy.id = `copy-${nextUID()}-[${value}]`;
            }
            else if (typeof value != 'function' &&
                !(value instanceof Cell) &&
                value !== copy[name]) {
                copy[name] =
                    value && typeof value == 'object' && value.clone
                        ? value.clone.length
                            ? value.clone(true)
                            : value.clone()
                        : value;
            }
        }
        copy.$original = this.$original;
        return copy;
    }
    absorbFrom(that) {
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
    _absorbFrom(that) {
        if (!(that instanceof BaseModel)) {
            throw TypeError('"that" must be instance of BaseModel');
        }
        if (absorbed.has(this)) {
            return false;
        }
        absorbed.add(this);
        let changed = false;
        for (let name in this) {
            if (name == 'id' || name.charAt(0) == '_' || name.charAt(0) == '$') {
                continue;
            }
            let value = this[name];
            if (value === Object.prototype[name]) {
                continue;
            }
            if (typeof value == 'function' || value instanceof Cell) {
                continue;
            }
            let thatValue = that[name];
            if (value !== thatValue) {
                if (value &&
                    thatValue &&
                    typeof value == 'object' &&
                    typeof thatValue == 'object' &&
                    value.absorbFrom &&
                    value.absorbFrom === thatValue.absorbFrom) {
                    if (value.absorbFrom(thatValue)) {
                        changed = true;
                    }
                }
                else {
                    this[name] = value;
                    changed = true;
                }
            }
        }
        return changed;
    }
    fixChanges() {
        if (this._fixedChanges) {
            this._fixedChanges.absorbFrom(this);
        }
        else {
            this._fixedChanges = this.clone();
        }
        return this;
    }
    discardChanges() {
        if (this._fixedChanges) {
            this.absorbFrom(this._fixedChanges);
        }
        return this;
    }
    toData() {
        let data = {};
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
                value && typeof value == 'object' && value.toData
                    ? value.toData()
                    : value;
        }
        return data;
    }
}
__decorate([
    NonEnumerable
], BaseModel.prototype, "$original", void 0);
