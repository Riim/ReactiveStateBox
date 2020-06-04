function getDataFields(modelCtor) {
    return modelCtor.hasOwnProperty('$dataFields')
        ? modelCtor.$dataFields
        : (modelCtor.$dataFields = { __proto__: modelCtor.$dataFields || null });
}
export function DataField(arg1, arg2, options) {
    let keypath;
    let validate;
    if (typeof arg1 == 'string' || (typeof arg1 == 'function' && !arg1.isOmYumYum)) {
        keypath = arg1;
        if (arg2) {
            if (typeof arg2 == 'function') {
                validate = arg2;
            }
            else {
                options = arg2;
            }
        }
    }
    else if (arg1) {
        if (typeof arg1 == 'function') {
            validate = arg1;
            if (arg2) {
                options = arg2;
            }
        }
        else {
            options = arg1;
        }
    }
    else if (arg2) {
        options = arg2;
    }
    if (options) {
        if (keypath === undefined && options.keypath) {
            keypath = options.keypath;
        }
        if (!validate && options.validate) {
            validate = options.validate;
        }
    }
    return (target, propName) => {
        let dataFields = getDataFields(target.constructor);
        let dataField = (dataFields[propName] = {
            __proto__: dataFields[propName] || Object.prototype
        });
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
            if (options.buildData) {
                dataField.buildData = options.buildData;
            }
        }
    };
}
