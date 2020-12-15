import React, {useState} from 'react';
import Layout from './Layout';
import {Provider} from './context';
import ComponentList from './ComponentList';
import OptionList from './OptionList';
import {FormModal, TextArea} from '@kne/react-form-antd';
import {Modal, Input} from 'antd';
import WorkArea from './WorkArea';

const FormGenerator = ({compositeItems, exportData, includeData, saveCompositeItems, delCompositeItem}) => {
    const [fieldList, setFieldList] = useState([]);
    const [activeId, setActiveId] = useState(null);
    return <Provider
        value={{
            activeId,
            setActiveId,
            fieldList,
            setFieldList,
            exportData,
            includeData,
            compositeItems,
            saveCompositeItems,
            delCompositeItem
        }}>
        <Layout left={<ComponentList/>} right={<OptionList/>}>
            <WorkArea/>
        </Layout>
    </Provider>
};

FormGenerator.defaultProps = {
    compositeItems: [],
    includeData: () => {
        return new Promise((resolve) => {
            const modal = FormModal.modal({
                title: '导入数据',
                content: <TextArea name="data" label="导入数据" rule="REQ IS_JSON"/>,
                formProps: {
                    rules: {
                        IS_JSON: (data) => {
                            try {
                                JSON.parse(data);
                                return {result: true};
                            } catch (e) {
                                return {result: false, errMsg: '%s必须为符合JSON格式'};
                            }
                        }
                    },
                    onSubmit({data}) {
                        resolve(JSON.parse(data));
                        modal.destroy();
                    }
                },
                onCancel() {
                    resolve([]);
                }
            });
        });
    },
    exportData: (data) => {
        Modal.info({
            title: "导出数据",
            content: <Input.TextArea value={data} readOnly rows={4}/>,
            okText: "确定"
        });
    },
    saveCompositeItems: () => {
        console.warn('请实现[saveCompositeItems]方法，存储复合组件');
    },
    delCompositeItem: () => {
        console.warn('请实现[delCompositeItem]方法，存储复合组件');
    }
};

export default FormGenerator;

export {preset} from '../form-render';