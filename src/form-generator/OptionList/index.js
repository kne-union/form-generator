import React, {useRef, useEffect, useMemo} from 'react';
import {useAppContext} from '../context';
import _get from 'lodash/get';
import {getConfig, getComponentMap} from '../../form-render';
import {renderSchemaFormField} from './SchemaForm';
import Form from '@kne/react-form-antd';
import {Tabs, Space, Button, Empty} from 'antd';
import useFieldOperation from '../WorkArea/useFieldOperation';
import {EnterOutlined, ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined, SaveOutlined} from '@ant-design/icons';
import formConfig from '../form-config.json';
import commonStyleConfig from '../common-style.json';
import style from './style.module.scss';

const {fields} = getConfig();
const ComponentMap = getComponentMap();
const {TabPane} = Tabs;

const useFormData = (schema, propsName = 'props') => {
    const {fieldList, setFieldList, activeId} = useAppContext();
    const formRef = useRef(null);
    useEffect(() => {
        let sub, sub2;
        if (activeId) {
            const activeItem = fieldList.find((item) => item.id === activeId);
            const schemaProperties = _get(schema, 'properties', {});
            const defaultProps = {};
            Object.keys(schemaProperties).forEach((name) => {
                defaultProps[name] = schemaProperties[name]['default'];
            });
            if (activeItem && formRef.current) {
                formRef.current.data = Object.assign({}, defaultProps, {
                    name: activeItem.id,
                    label: ComponentMap[activeItem.fieldName].title
                }, formRef.current.data, _get(activeItem, propsName));
            }
            sub = formRef.current.emitter.addListener('form-field-validate-complete', ({name, index: SymbolIndex, value}) => {
                setFieldList((fieldList) => {
                    const activeItem = fieldList.find((item) => item.id === activeId);
                    const index = fieldList.indexOf(activeItem);
                    const newItem = Object.assign({}, activeItem, {
                        [propsName]: Object.assign({}, activeItem[propsName], (() => {
                            const fieldItem = _get(formRef.current.formState, `${name}.data`, {})[SymbolIndex];
                            if (fieldItem.groupName && name === fieldItem.groupName) {
                                const fieldValue = _get(formRef.current.data, `${fieldItem.groupName}`, []);
                                const target = fieldValue.slice(0);
                                target[fieldItem.index] = value;
                                return {[fieldItem.groupName]: target};
                            }
                            if (fieldItem.groupName) {
                                const fieldValue = _get(formRef.current.data, `${fieldItem.groupName}`, []);
                                const target = fieldValue.slice(0);
                                target[fieldItem.index] = Object.assign({}, target[fieldItem.index], {[name]: value});
                                return {[fieldItem.groupName]: target};
                            }
                            return {[name]: value};
                        })())
                    });

                    const newFieldList = fieldList.slice(0);
                    newFieldList.splice(index, 1, newItem);
                    setFieldList(newFieldList);
                });
            });

            sub2 = formRef.current.emitter.addListener('form-group-remove', ({index: groupIndex, name}) => {
                setFieldList((fieldList) => {
                    const activeItem = fieldList.find((item) => item.id === activeId);
                    const index = fieldList.indexOf(activeItem);
                    const newItem = Object.assign({}, activeItem, {
                        [propsName]: Object.assign({}, activeItem[propsName], (() => {
                            const fieldValue = _get(formRef.current.data, `${name}`) || [];
                            const target = fieldValue.slice(0);
                            target.splice(groupIndex, 1);
                            return {[name]: target};
                        })())
                    });

                    const newFieldList = fieldList.slice(0);
                    newFieldList.splice(index, 1, newItem);
                    setFieldList(newFieldList);
                });
            });
        }
        return () => {
            sub && sub.remove();
            sub2 && sub2.remove();
        };
    }, [fieldList, schema, propsName, activeId, setFieldList]);
    return formRef;
};

const FieldOptions = () => {
    const {fieldList, activeId} = useAppContext();
    const schema = useMemo(() => {
        const activeItem = fieldList.find((item) => item.id === activeId);
        return _get(ComponentMap, `["${_get(activeItem, 'fieldName')}"].propsSchema`, {});
    }, [fieldList, activeId]);
    const formRef = useFormData(schema);
    return <Form ref={formRef} type="inner" size="small">
        {Object.keys(_get(schema, 'properties', {})).length === 0 ?
            <Empty description=""/> : renderSchemaFormField({schema})}
    </Form>
};

const FormOptions = () => {
    const formRef = useFormData(formConfig);
    return <Form ref={formRef} type="inner" size="small">
        {renderSchemaFormField({schema: formConfig})}
    </Form>
};

const StyleOptions = () => {
    const {fieldList, activeId} = useAppContext();
    const schema = useMemo(() => {
        const activeItem = fieldList.find((item) => item.id === activeId);
        return Object.assign({}, commonStyleConfig, _get(ComponentMap, `["${_get(activeItem, 'fieldName')}"].stylePropsSchema`, {}));
    }, [fieldList, activeId]);
    const formRef = useFormData(schema, 'styleProps');
    return <Form ref={formRef} type="inner" size="small">
        {renderSchemaFormField({schema})}
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
            ID:{activeId} 类型:{ComponentMap[item.fieldName].title} {item.parentId ? <>父级ID:{item.parentId}</> : null}
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
                        <Button type="link" icon={<SaveOutlined/>} onClick={fieldOperation.save}/>
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
                    <StyleOptions/>
                </TabPane>
            </Tabs>
        </Space>
    );
};

export default OptionList;