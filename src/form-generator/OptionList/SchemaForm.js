import React from 'react';
import _get from 'lodash/get';
import {Select, Input, InputNumber, Switch} from '@kne/react-form-antd';

export const renderSchemaFormField = ({name, schema}) => {
    switch (schema.type) {
        case 'string':
            if (Array.isArray(schema.enum) && schema.enum.length > 0) {
                return <Select key={name} name={name} label={schema.title || name} options={schema.enum.map((str) => ({
                    label: str, value: str
                }))} defaultValue={schema['default']}/>
            }
            return <Input key={name} type="text" name={name} label={schema.title || name}
                          defaultValue={schema['default']}/>;
        case 'boolean':
            return <Switch key={name} name={name} label={schema.title || name} defaultValue={schema['default']}/>
        case 'number':
            return <InputNumber key={name} name={name} label={schema.title || name} defaultValue={schema['default']}/>
        case 'object':
            const properties = _get(schema, 'properties', {});
            return Object.keys(properties).map((name) => {
                return renderSchemaFormField({name, schema: properties[name]});
            });
        default:
            return null;
    }
};