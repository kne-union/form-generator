import React, {useEffect, useState, useCallback, useRef} from 'react';
import classnames from 'classnames';
import Form, {SubmitButton, ResetButton} from '@kne/react-form-antd';
import preset from '../preset';
import {Switch, Space, Col, Row} from 'antd';
import '@kne/react-form-antd/dist/style.scss';
import {FieldMap} from '../ComponentList';
import {useAppContext} from '../context';
import _get from 'lodash/get';
import style from './style.module.scss';
import ActiveObject from "./ActiveObject";
import Img from './Others/Img';
import Word from './Others/Word';

const fields = preset.fields;
const renderFields = Object.assign({}, {Img, Word, Form, SubmitButton, ResetButton, Col, Row}, fields);

const WorkArea = () => {
    const {fieldList, setFieldList, setActiveId} = useAppContext();
    const [open, setOpen] = useState(true);
    const outerRef = useRef(null);
    const renderChildren = useCallback(({parentId: target, fieldList: data, className}) => {
        const list = data.filter(({parentId}) => parentId === target);
        if (list.length === 0) {
            return null;
        }
        return list.map(({id, fieldName, props}) => {
            const Component = renderFields[fieldName];
            const defaultProps = (() => {
                const output = {};
                const schemaProps = _get(FieldMap, `[${fieldName}]["propsSchema"]['properties']`, {});
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
                    label: FieldMap[fieldName].title
                };
            })();
            const classNameProps = {
                [FieldMap[fieldName].outerClassName || 'className']: classnames(className, `id_${id}`)
            };

            const children = renderChildren({
                parentId: id,
                fieldList: data
            });

            const childrenProps = children ? {children} : {};

            return <Component
                key={id} {...defaultProps} {...defaultFormFieldProps} {...props} {...classNameProps} {...childrenProps}/>
        });
    }, []);
    useEffect(() => {
        setFieldList([{
            id: 'root',
            fieldName: 'Form',
            props: {
                onSubmit: (data) => {
                    console.log(data);
                }
            }
        }]);
    }, [setFieldList]);
    const readyCallbackRef = useRef(null);
    useEffect(() => {
        readyCallbackRef.current && readyCallbackRef.current(fieldList, outerRef.current);
    }, [fieldList]);
    return <div className={style['con']}>
        <div className={style['header']}>
            <Space>
                <span>预览模式:</span><Switch checked={!open} onChange={(value) => {
                setActiveId(null);
                setOpen(!value);
            }}/>
            </Space>
        </div>
        <ActiveObject open={open}>
            {renderChildren({fieldList, className: style['form']})}
        </ActiveObject>
    </div>
};

export default WorkArea;