import componentsConfig from './config.json';
import memoize from 'lodash/memoize';
import {fields, preset as formPreset} from '@kne/react-form-antd';
import '@kne/react-form-antd/dist/style.scss';

let config = {componentsConfig, fields, rules: {}, field: {}};

const preset = (callback) => {
    config = callback(Object.assign({}, config));
    formPreset({
        rules: config.rules,
        field: config.field
    });
};

export default preset;

export const getConfig = () => {
    return config;
};


const _getComponentMap = memoize((componentsConfig) => {
    const output = {};
    componentsConfig.forEach(({children}) => {
        children.forEach((item) => {
            output[item.fieldName] = item;
        });
    });
    return output;
});

export const getComponentMap = () => {
    return _getComponentMap(getConfig().componentsConfig);
};