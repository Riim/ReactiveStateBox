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
            ? id.map(id => (models && models.get(id)) || null)
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
    model(type, data, prevModel) {
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
        let id = dataFields &&
            dataFields.id &&
            dataFields.id.keypath !== undefined &&
            keypath(dataFields.id.keypath, data);
        if (dataFields && dataFields.id && dataFields.id.validate) {
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
        let model = id && models.get(id);
        if (!model) {
            if (!id && prevModel) {
                model = prevModel;
            }
            else {
                model = new type();
                if (id) {
                    model.id = id;
                    models.set(id, model);
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
                    if (typeof value == 'object') {
                        if (dataField.build) {
                            value = dataField.build(value, data, model);
                        }
                        if (dataField.type) {
                            value = this.model(dataField.type(), value, model[name]);
                        }
                    }
                    else if (dataField.build) {
                        value = dataField.build(value, data, model);
                    }
                    if (dataField.wrapper) {
                        value =
                            typeof dataField.wrapper.from == 'function'
                                ? dataField.wrapper.from(value)
                                : new dataField.wrapper(value);
                    }
                }
                if (model[name] !== value) {
                    model[name] = value;
                }
            }
        }
        return model.fixChanges();
    }
    discard(type, id) {
        let models = this._models.get(type);
        if (models && models.size) {
            if (arguments.length == 1) {
                models.clear();
                return true;
            }
            return models.delete(id);
        }
        return false;
    }
    clear() {
        this._models = new Map();
        if (this.initialize) {
            this.initialize();
        }
        return this;
    }
}
