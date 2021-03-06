import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {useAppContext} from "../context";
import useFieldOperation from "./useFieldOperation";
import classnames from "classnames";
import style from "./style.module.scss";
import {getComponentMap, isFormField} from "../../form-render";
import uniqueId from "lodash/uniqueId";
import ResizeObserver from 'rc-resize-observer';
import {ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, EnterOutlined, SaveOutlined} from "@ant-design/icons";

const ComponentMap = getComponentMap();

const ActiveObject = ({open, children}) => {
    const {fieldList, setFieldList, activeId, setActiveId} = useAppContext();
    const outerRef = useRef(null);
    const [targetList, setTargetList] = useState([]);
    const fieldOperation = useFieldOperation();
    useEffect(() => {
        const handler = (e) => {
            if (e.target !== document.body) {
                return;
            }
            if (activeId) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    fieldOperation.toRoot();
                }
                if (e.keyCode === 37) {
                    e.preventDefault();
                    fieldOperation.toSuper();
                }
                if (e.keyCode === 38) {
                    e.preventDefault();
                    fieldOperation.up();
                }
                if (e.keyCode === 39) {
                    e.preventDefault();
                    fieldOperation.toFirstChild();
                }
                if (e.keyCode === 40) {
                    e.preventDefault();
                    fieldOperation.down();
                }

                if (e.keyCode === 8) {
                    e.preventDefault();
                    fieldOperation.del();
                }
            }
        };
        document.addEventListener('keydown', handler);
        return () => {
            document.removeEventListener('keydown', handler);
        };
    }, [activeId, fieldOperation]);
    const currentActive = useMemo(() => {
        if (!activeId) {
            return;
        }
        return targetList.find((item) => item.id === activeId);
    }, [activeId, targetList]);
    const computedTargetList = useCallback(() => {
        const outer = outerRef.current;
        const outerRect = outer.getBoundingClientRect();
        const left = outerRect.left + document.documentElement.scrollLeft;
        const top = outerRect.top + document.documentElement.scrollTop;
        const output = fieldList.slice(0).sort((a, b) => {
            return b.depth - a.depth
        }).map(({id, depth, fieldName}) => {
            const targetDom = outer.querySelector(`.id_${id}`);
            const rect = targetDom.getBoundingClientRect();
            const targetRect = {
                left: rect.left + document.documentElement.scrollLeft,
                top: rect.top + document.documentElement.scrollTop,
                width: rect.width,
                height: rect.height
            };
            return {
                id,
                fieldName,
                title: ComponentMap[fieldName].title,
                depth,
                top: Math.round(targetRect.top - top),
                left: Math.round(targetRect.left - left),
                width: Math.round(targetRect.width),
                height: Math.round(targetRect.height),
                outer: {left, top, width: outerRect.width, height: outerRect.height}
            };
        });
        setTargetList(output);
    }, [fieldList]);

    const findTarget = useCallback((e, childCheck = false) => {
        return targetList.find(({fieldName, left, top, width, height, outer}) => {
            const clickLeft = e.clientX + document.documentElement.scrollLeft - outer.left,
                clickTop = e.clientY + document.documentElement.scrollTop - outer.top;
            return clickLeft > left && clickLeft < left + width && clickTop > top && clickTop < top + height && (!childCheck || ComponentMap[fieldName].hasChildNodes);
        });
    }, [targetList]);
    useEffect(() => {
        computedTargetList();
    }, [computedTargetList]);
    return <ResizeObserver onResize={() => {
        computedTargetList();
    }}>
        <div className={classnames(style['form-outer'], {
            [style['is-open']]: open
        })} ref={outerRef}>
            {children}
            {open ? <div className={style['active-area']} onClick={(e) => {
                e.preventDefault();
                const target = findTarget(e);
                if (target) {
                    if (target.id === activeId) {
                        setActiveId(null);
                        return;
                    }
                    setActiveId(target.id);
                }
            }} onDragOver={(e) => {
                e.preventDefault();
            }} onDrop={(e) => {
                const target = findTarget(e, true);
                if (target && ComponentMap[target.fieldName].hasChildNodes === true) {
                    e.stopPropagation();
                    const transferData = JSON.parse(e.dataTransfer.getData("Text"));
                    if (transferData.type === 'String') {
                        const fieldName = transferData.data;
                        const newId = uniqueId(`${fieldName}_`);
                        setFieldList((oldData) => [...oldData, {
                            id: newId,
                            parentId: target.id,
                            fieldName,
                            depth: target.depth + 1,
                            props: isFormField(fieldName) ? {
                                label: ComponentMap[fieldName].title,
                                name: newId
                            } : {},
                            styleProps: {}
                        }]);
                    } else {
                        const idsMap = {};
                        transferData.data.forEach((item) => {
                            idsMap[item.id] = uniqueId(`${item.fieldName}_`);
                        });
                        setFieldList((oldData) => [...oldData, ...transferData.data.map((item) => {
                            if (item.parentId === 'root') {
                                item.parentId = target.id;
                                item.depth = target.depth + 1;
                            } else {
                                item.parentId = idsMap[item.parentId];
                                item.depth = item.depth + target.depth;
                            }
                            item.id = idsMap[item.id];
                            return item;
                        })]);
                    }
                }
            }}>
                {activeId && currentActive ? <div className={classnames(style['active'])} style={{
                    top: currentActive.top,
                    left: currentActive.left,
                    width: currentActive.width,
                    height: currentActive.height
                }}>
                <span
                    className={style['tip']}>{currentActive.title}</span>
                    <span className={style['edit']}>{(currentActive.id === 'root' ?
                        <EnterOutlined rotate={-90} className={style['opt-btn']} onClick={(e) => {
                            e.stopPropagation();
                            fieldOperation.toFirstChild();
                        }}/> : <>
                            <EnterOutlined rotate={90} className={style['opt-btn']} onClick={(e) => {
                                e.stopPropagation();
                                fieldOperation.toSuper();
                            }}/>
                            <EnterOutlined rotate={-90} className={style['opt-btn']} onClick={(e) => {
                                e.stopPropagation();
                                fieldOperation.toFirstChild();
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
                            <SaveOutlined className={style['opt-btn']} onClick={(e) => {
                                e.stopPropagation();
                                fieldOperation.save();
                            }}/>
                        </>)}</span>
                </div> : null}
            </div> : null}
        </div>
    </ResizeObserver>
};

export default ActiveObject;