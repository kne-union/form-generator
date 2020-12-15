import React, {useEffect, useState} from 'react';
import FormRender from '../../form-render';
import {Switch, Space, Button, Row, Col} from 'antd';
import {useAppContext} from '../context';
import style from './style.module.scss';
import ActiveObject from "./ActiveObject";

const WorkArea = () => {
    const {fieldList, setFieldList, setActiveId, exportData, includeData} = useAppContext();
    const [open, setOpen] = useState(true);
    useEffect(() => {
        setFieldList([{
            id: 'root',
            fieldName: 'Form',
            depth: 0,
            props: {
                onSubmit: (data) => {
                    console.log(data);
                }
            },
            styleProps: {}
        }]);
    }, [setFieldList]);
    return <div className={style['con']}>
        <div className={style['header']}>
            <Row justify="space-between">
                <Col>
                    <Space>
                        <span>预览模式:</span><Switch checked={!open} onChange={(value) => {
                        setActiveId(null);
                        setOpen(!value);
                    }}/>
                    </Space>
                </Col>
                <Col>
                    <Space>
                        <Button shape="round" type="primary" size="small" onClick={() => {
                            includeData().then((list) => {
                                list && list.length > 0 && setFieldList(list);
                            });
                        }}>导入</Button>
                        <Button shape="round" size="small" onClick={() => {
                            exportData(JSON.stringify(fieldList));
                        }}>导出</Button>
                    </Space>
                </Col>
            </Row>
        </div>
        <ActiveObject open={open}>
            <FormRender fieldList={fieldList} className={style['form']}/>
        </ActiveObject>
    </div>
};

export default WorkArea;