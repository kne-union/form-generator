import React, {useMemo, useRef, useEffect, useState} from 'react';
import classnames from 'classnames';
import style from './style.module.scss';
import {useAppContext} from "../context";
import uniqueId from 'lodash/uniqueId';
import {FieldMap} from '../ComponentList';
import useFieldOperation from './useFieldOperation';
import {ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, EnterOutlined} from "@ant-design/icons";

const ActiveObject = ({id, open, children}) => {
    const {fieldList, setFieldList, activeId, setActiveId} = useAppContext();
    const [size, setSize] = useState([0, 0]);
    const fieldOperation = useFieldOperation();
    const current = useMemo(() => fieldList.find((item) => item.id === id), [fieldList]);
    /*const outerRef = useRef(null);
    useEffect(() => {
        const resizeObj = new window.ResizeObserver((e) => {
            const fieldEl = e[0].target;
            setSize([fieldEl.clientWidth, fieldEl.clientHeight]);
        });
        if (open) {
            const fieldEl = outerRef.current.lastChild;
            resizeObj.observe(fieldEl);
        }
        return () => {
            resizeObj.disconnect();
        };
    }, [open]);*/
    if (!open) {
        return children;
    }
    const isActive = id === activeId;

    return <>
        <div className={classnames({
            [style['active']]: isActive
        }, style['open'])} style={{
            width: size[0],
            height: size[1]
        }} onDragOver={(e) => {
            e.preventDefault();
        }} onDrop={(e) => {
            if (id === 'root' || (current && FieldMap[current.fieldName].hasChildNodes === true)) {
                e.stopPropagation();
                const fieldName = e.dataTransfer.getData("Text");
                const newId = uniqueId(`${fieldName}_`);
                setFieldList((oldData) => [...oldData, {
                    id: newId, parentId: id, fieldName, props: {}
                }]);
            }
        }} onClick={(e) => {
            e.stopPropagation();
            if (activeId === id) {
                setActiveId(null);
                return;
            }
            setActiveId(id);
        }}>
            <span
                className={style['tip']}>{isActive && (id === 'root' ? '表单' : FieldMap[current['fieldName']].title)}</span>
            <span className={style['edit']}>{isActive && (id === 'root' ? '' : <>
                <EnterOutlined rotate={90} className={style['opt-btn']} onClick={(e) => {
                    e.stopPropagation();
                    fieldOperation.toSuper();
                }}/>
                <ArrowUpOutlined className={style['opt-btn']} onClick={(e) => {
                    e.stopPropagation();
                    fieldOperation.up();
                }}/>
                <ArrowDownOutlined className={style['opt-btn']} onClick={(e) => {
                    e.stopPropagation();
                    fieldOperation.down();
                }}/>
                <DeleteOutlined className={style['opt-btn']} onClick={(e) => {
                    e.stopPropagation();
                    fieldOperation.del();
                }}/>
            </>)}</span>
        </div>
        {children}
    </>;
};

const withActiveObject = (WrappedComponent) => {
    return ({id, open, ...props}) => <ActiveObject id={id} open={open}><WrappedComponent {...props}/></ActiveObject>
};

export default withActiveObject;