import React, {useRef, useEffect, useMemo} from 'react';
import {useAppContext} from '../context';
import _get from 'lodash/get';
import {FieldMap} from '../ComponentList';
import preset from '../preset';
import {renderSchemaFormField} from './SchemaForm';
import Form from '@kne/react-form-antd';
import {Tabs, Space, Button} from 'antd';
import useFieldOperation from '../WorkArea/useFieldOperation';
import {EnterOutlined, ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined} from '@ant-design/icons';
import formConfig from '../form-config.json';
import style from './style.module.scss';

const fields = preset.fields;
const {TabPane} = Tabs;

const useFormData = (schema) => {
    const {fieldList, setFieldList, activeId} = useAppContext();
    const formRef = useRef(null);
    useEffect(() => {
        let sub;
        if (activeId) {
            const activeItem = fieldList.find((item) => item.id === activeId);
            const schemaProperties = _get(schema, 'properties', {});
            const defaultProps = {};
            Object.keys(schemaProperties).forEach((name) => {
                defaultProps[name] = schemaProperties[name]['default'];
            });
            setTimeout(() => {
                if (activeItem) {
                    formRef.current.data = Object.assign({}, defaultProps, {
                        name: activeItem.id,
                        label: FieldMap[activeItem.fieldName].title
                    }, _get(activeItem, 'props'));
                }
            }, 0);
            sub = formRef.current.emitter.addListener('form-field-validate-complete', ({name, value}) => {
                setFieldList((fieldList) => {
                    const activeItem = fieldList.find((item) => item.id === activeId);
                    const index = fieldList.indexOf(activeItem);
                    const newItem = Object.assign({}, activeItem, {
                        props: Object.assign({}, activeItem.props, {[name]: value})
                    });
                    const newFieldList = fieldList.slice(0);
                    newFieldList.splice(index, 1, newItem);
                    setFieldList(newFieldList);
                });
            });
        }
        return () => {
            sub && sub.remove();
        };
    }, [fieldList, schema, activeId, setFieldList]);
    return formRef;
};

const FieldOptions = () => {
    const {fieldList, activeId} = useAppContext();
    const schema = useMemo(() => {
        const activeItem = fieldList.find((item) => item.id === activeId);
        return _get(FieldMap, `["${_get(activeItem, 'fieldName')}"].propsSchema`, {});
    }, [fieldList, activeId]);
    const formRef = useFormData(schema);
    return <Form ref={formRef} type="inner">
        {renderSchemaFormField({schema})}
    </Form>
};

const FormOptions = () => {
    const formRef = useFormData(formConfig);
    return <Form ref={formRef} type="inner">
        {renderSchemaFormField({schema: formConfig})}
    </Form>
};

const Panel = () => {
    const {fieldList, activeId} = useAppContext();
    const item = useMemo(() => fieldList.find((item) => item.id === activeId), [fieldList, activeId]);
    const fieldOperation = useFieldOperation();
    if (!item) {
        return null;
    }
    return <Space className={style['panel']} direction={'vertical'} style={{width: '100%'}}>
        <Space className={style['active-info']}>
            ID:{activeId} 类型:{FieldMap[item.fieldName].title} {item.parentId ? <>父级ID:{item.parentId}</> : null}
        </Space>
        <Space className={style['active-opt']}>
            <span>操作:</span>
            <span>
                {item.id === 'root' ?
                    <Button type="link" icon={<EnterOutlined rotate={-90}/>}
                            onClick={fieldOperation.toFirstChild}/> : <>
                        <Button type="link" icon={<EnterOutlined rotate={90}/>} onClick={fieldOperation.toSuper}/>
                        <Button type="link" icon={<EnterOutlined rotate={-90}/>} onClick={fieldOperation.toFirstChild}/>
                        <Button type="link" icon={<ArrowUpOutlined/>} onClick={fieldOperation.up}/>
                        <Button type="link" icon={<ArrowDownOutlined/>} onClick={fieldOperation.down}/>
                        <Button type="link" icon={<DeleteOutlined/>} onClick={fieldOperation.del}/>
                    </>}
            </span>
        </Space>
    </Space>
};

const OptionList = () => {
    const {activeId, fieldList} = useAppContext();
    const isField = useMemo(() => {
        const activeItem = fieldList.find((item) => item.id === activeId);
        if (!activeItem) {
            return false;
        }
        return fields.hasOwnProperty(activeItem.fieldName);
    }, [activeId, fieldList]);
    if (!activeId) {
        return null;
    }
    return (
        <Space direction={'vertical'} style={{width: '100%'}}>
            <Panel/>
            <Tabs className={style['con']} defaultActiveKey="1">
                <TabPane tab="组件属性" key="1" forceRender>
                    <FieldOptions/>
                </TabPane>
                {isField ? <TabPane tab="表单属性" key="2" forceRender>
                    <FormOptions/>
                </TabPane> : null}
                <TabPane tab="样式属性" key="3" forceRender>
                    正在开发中
                </TabPane>
            </Tabs>
        </Space>
    );
};

export default OptionList;