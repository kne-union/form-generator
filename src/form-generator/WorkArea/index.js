import React, {useEffect, useState} from 'react';
import FormRender from '../../form-render';
import {Switch, Space} from 'antd';
import {useAppContext} from '../context';
import style from './style.module.scss';
import ActiveObject from "./ActiveObject";

const WorkArea = () => {
    const {fieldList, setFieldList, setActiveId} = useAppContext();
    const [open, setOpen] = useState(true);
    useEffect(() => {
        setFieldList([{
            id: 'root',
            fieldName: 'Form',
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
            <Space>
                <span>预览模式:</span><Switch checked={!open} onChange={(value) => {
                setActiveId(null);
                setOpen(!value);
            }}/>
            </Space>
        </div>
        <ActiveObject open={open}>
            <FormRender fieldList={fieldList} className={style['form']}/>
        </ActiveObject>
    </div>
};

export default WorkArea;