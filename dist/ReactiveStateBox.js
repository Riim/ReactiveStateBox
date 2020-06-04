import { keypath } from '@riim/keypath';
import { error } from '@riim/log';
import om from 'omyumyum';
import { clone } from './clone';
export { DataField } from './DataField';
export { BaseModel } from './BaseModel';
export class ReactiveStateBox {
    constructor(initialize) {
        this._models = new Map();
        if (initialize) {
            this.initialize = initialize;
            this.initialize();
        }
    }
    get(type, id) {
        let models = this._models.get(type);
        return Array.isArray(id)
            ? id.map((id) => (models && models.get(id)) || null)
            : (models && models.get(id)) || null;
    }
    getAll(type) {
        let models = [];
        (this._models.get(type) || []).forEach((model) => {
            models.push(model);
        });
        return models;
    }
    set(type, model) {
        let models = this._models.get(type);
        if (!models) {
            models = new Map();
            this._models.set(type, models);
        }
        models.set(model.$id, model.$original);
        return this;
    }
    model(type, data, model, _prevModel) {
        var _a, _b;
        if (Array.isArray(data)) {
            let arrLength = data.length;
            let arr = new Array(arrLength);
            for (let i = 0; i < arrLength; i++) {
                arr[i] = this.model(type, data[i]);
            }
            return arr;
        }
        let dataFields = type.$dataFields;
        let models = this._models.get(type);
        if (!models) {
            models = new Map();
            this._models.set(type, models);
        }
        let id = ((_a = dataFields === null || dataFields === void 0 ? void 0 : dataFields.id) === null || _a === void 0 ? void 0 : _a.keypath) !== undefined && keypath(dataFields.id.keypath, data);
        if ((_b = dataFields === null || dataFields === void 0 ? void 0 : dataFields.id) === null || _b === void 0 ? void 0 : _b.validate) {
            try {
                om(dataFields.id.validate, id);
            }
            catch (err) {
                error(err, {
                    modelName: type.name,
                    dataFieldName: 'id',
                    dataFieldKeypath: dataFields.id.keypath,
                    value: JSON.stringify(id)
                });
            }
        }
        if (model) {
            if (id && !model.id) {
                model.id = id;
                model.$original = model;
                models.set(id, model);
            }
        }
        else {
            if (!id && _prevModel) {
                model = _prevModel;
            }
            else {
                model = id && models.get(id);
                if (!model) {
                    model = new type();
                    if (id) {
                        model.id = id;
                        models.set(id, model);
                    }
                }
            }
        }
        if (dataFields) {
            for (let name in dataFields) {
                if (name == 'id') {
                    continue;
                }
                let dataField = dataFields[name];
                if (dataField.keypath === undefined) {
                    throw new TypeError('dataField.keypath is required');
                }
                let value = keypath(typeof dataField.keypath == 'function'
                    ? dataField.keypath(data, model)
                    : dataField.keypath, data);
                if (value === null && dataField.placeholder !== undefined) {
                    model[name] =
                        typeof dataField.placeholder == 'function'
                            ? dataField.placeholder()
                            : clone(dataField.placeholder);
                    continue;
                }
                if (value === undefined && dataField.default !== undefined) {
                    model[name] =
                        typeof dataField.default == 'function'
                            ? dataField.default()
                            : clone(dataField.default);
                    continue;
                }
                if (dataField.validate) {
                    try {
                        om(dataField.validate, value);
                    }
                    catch (err) {
                        error(err, {
                            modelName: type.name,
                            dataFieldName: name,
                            dataFieldKeypath: dataField.keypath,
                            value: JSON.stringify(value)
                        });
                    }
                }
                if (value === undefined) {
                    continue;
                }
                if (value !== null) {
                    if (dataField.build) {
                        value = dataField.build(value, data, model);
                    }
                    if (typeof value == 'object' && dataField.type) {
                        value = this.model(dataField.type(), value, model[name]);
                    }
                    if (dataField.wrapper) {
                        value =
                            typeof dataField.wrapper.from == 'function'
                                ? dataField.wrapper.from(value)
                                : new dataField.wrapper(value);
                    }
                    else if (dataField.wrap) {
                        value = dataField.wrap(value);
                    }
                }
                if (model[name] !== value) {
                    if (value &&
                        model[name] &&
                        typeof value == 'object' &&
                        typeof model[name] == 'object' &&
                        value.absorbFrom &&
                        value.absorbFrom === model[name].absorbFrom) {
                        model[name].absorbFrom(value);
                    }
                    else {
                        model[name] = value;
                    }
                }
            }
        }
        return model.fixChanges();
    }
    discard(typeOrModel, id) {
        if (typeof typeOrModel == 'function') {
            let models = this._models.get(typeOrModel);
            if (models === null || models === void 0 ? void 0 : models.size) {
                if (id) {
                    return models.delete(id);
                }
                models.clear();
                return true;
            }
        }
        else {
            let models = this._models.get(typeOrModel.constructor);
            if (models === null || models === void 0 ? void 0 : models.size) {
                return models.delete(typeOrModel.id);
            }
        }
        return false;
    }
    clear() {
        var _a;
        this._models = new Map();
        (_a = this.initialize) === null || _a === void 0 ? void 0 : _a.call(this);
        return this;
    }
}
