import React, {useRef, useMemo} from 'react';
import _get from 'lodash/get';
import {Button, Space, Row, Col} from 'antd';
import {Select, Input, InputNumber, Switch} from '@kne/react-form-antd';
import {Group, useFieldInfo} from '@kne/react-form';
import {PlusOutlined} from '@ant-design/icons';
import style from './style.module.scss';

const GroupList = Group.GroupList;
const useGroup = Group.useGroup;

const DelButton = () => {
    const {onRemove} = useGroup();
    return <Button shape="round" size="small" onClick={onRemove}>删除</Button>
};


const ItemList = ({name, schema}) => {
    const items = _get(schema, 'items', {});
    const groupRef = useRef(null);
    const children = useMemo(() => {
        return renderSchemaFormField({name, schema: items});
    }, [items, name]);
    return <>
        <Row justify="space-between">
            <Col>
                <span className={style['list-title']}>{schema.title}</span>
            </Col>
            <Col>
                <Button type="primary" shape="round" size="small" icon={<PlusOutlined/>} onClick={() => {
                    groupRef.current.onAdd();
                }}/>
            </Col>
        </Row>
        <div className={style['list-con']}>
            <GroupList ref={groupRef} name={name} groupKey={(item, index) => index}>
                <Space className={style['list-item']}>
                    {children}
                    <DelButton/>
                </Space>
            </GroupList>
        </div>
    </>
};

const AnyOfField = ({name, schema}) => {
    const fields = useFieldInfo();
    const current = _get(fields, `["${name}_type"].field.value`);
    const targetSchema = schema.find((item) => item.type === current);
    return useMemo(() => {
        if (!(current && targetSchema)) {
            return null;
        }
        return <div className={style['list-con']}>
            {renderSchemaFormField({name, schema: targetSchema})}
        </div>
    }, [name, current, targetSchema]);
};

const AnyOf = ({name, schema}) => {
    const schemaAnyOf = schema.anyOf;
    const options = schemaAnyOf.map(({title, type}) => {
        return {
            label: title,
            value: type
        };
    })
    return <>
        <Row className={style['anyof-title']} justify="space-between">
            <Col>
                <span className={style['list-title']}>{schema.title || name}</span>
            </Col>
            <Col>
                <Select size="small" placeholder="请选择类型" name={`${name}_type`} options={options}/>
            </Col>
        </Row>
        <AnyOfField name={name} schema={schemaAnyOf}/>
    </>
};

export const renderSchemaFormField = ({name, schema}) => {
    switch (schema.type) {
        case 'string':
            if (Array.isArray(schema.enum) && schema.enum.length > 0) {
                return <Select size="small" key={name} name={name} label={schema.title || name}
                               options={schema.enum.map((str) => ({
                                   label: str, value: str
                               }))} defaultValue={schema['default']}/>
            }
            return <Input size="small" key={name} type="text" name={name} label={schema.title || name}
                          defaultValue={schema['default']}/>;
        case 'boolean':
            return <Switch size="small" key={name} name={name} label={schema.title || name}
                           defaultValue={schema['default']}/>
        case 'number':
        case 'integer':
            return <InputNumber size="small" key={name} name={name} label={schema.title || name}
                                defaultValue={schema['default']}/>
        case 'object':
            const properties = _get(schema, 'properties', {});
            return Object.keys(properties).map((name) => {
                return renderSchemaFormField({name, schema: properties[name]});
            });
        case 'array':
            return <ItemList key={name} name={name} schema={schema}/>
        default:
            if (schema.anyOf) {
                return <AnyOf key={name} name={name} schema={schema}/>
            }
            return null;
    }
};