import React, {useCallback} from 'react';
import _get from "lodash/get";
import omit from 'lodash/omit';
import {getConfig, getComponentMap} from "./preset";
import classnames from "classnames";
import Img from "./components/Img";
import Word from "./components/Word";
import Container from './components/Container';
import Form, {ResetButton, SubmitButton} from "@kne/react-form-antd";
import {Col, Row} from "antd";

const {fields} = getConfig();
const renderFields = Object.assign({}, {Img, Word, Container, Form, SubmitButton, ResetButton, Col, Row}, fields);
const ComponentMap = getComponentMap();

const FormRender = (props) => {
    const renderChildren = useCallback(({parentId: target, fieldList: data, className}) => {
        const list = data.filter(({parentId}) => parentId === target);
        if (list.length === 0) {
            return null;
        }
        return list.map(({id, fieldName, styleProps, props}) => {
            const Component = renderFields[fieldName];

            const fieldConfig = ComponentMap[fieldName];

            const defaultProps = (() => {
                const output = {};
                const schemaProps = _get(fieldConfig, `['propsSchema']['properties']`, {});
                Object.keys(schemaProps).forEach((name) => {
                    const item = _get(schemaProps, name);
                    if (item) {
                        output[name] = item["default"];
                    }
                });
                return output;
            })();

            const defaultFormFieldProps = (() => {
                if (!fields.hasOwnProperty(fieldName)) {
                    return {};
                }
                return {
                    name: id,
                    label: fieldConfig.title
                };
            })();

            const classNameProps = {
                [fieldConfig.outerClassName || 'className']: classnames(className, styleProps.className, `id_${id}`)
            };

            const componentStyleProps = (() => {
                const props = omit(styleProps, ['className']);
                if (Object.keys(props).length > 0) {
                    return {
                        style: props
                    };
                }
                return {};
            })();

            const children = renderChildren({
                parentId: id,
                fieldList: data
            });

            const childrenProps = children ? {children} : {};

            const computedProps = Object.assign({}, defaultProps, defaultFormFieldProps, props, classNameProps, componentStyleProps, childrenProps);

            return <Component key={id} {...computedProps}/>
        });
    }, []);
    return renderChildren(props);
};

export default FormRender;

export {default as preset, getConfig, getComponentMap} from './preset';