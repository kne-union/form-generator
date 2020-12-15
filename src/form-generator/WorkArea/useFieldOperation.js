import React, {useCallback, useMemo} from 'react';
import {useAppContext} from "../context";
import findLastIndex from 'lodash/findLastIndex';
import findIndex from 'lodash/findIndex';
import {FormModal, Input} from '@kne/react-form-antd';


const useFieldOperation = () => {
    const {setFieldList, fieldList, activeId, setActiveId, saveCompositeItems, compositeItems} = useAppContext();
    const toSuper = useCallback(() => {
        if (!activeId || activeId === 'root') {
            return;
        }
        setActiveId((activeId) => {
            const item = fieldList.find((item) => item.id === activeId);
            if (item && item.parentId) {
                return item.parentId;
            }
            return activeId;
        });
    }, [activeId, setActiveId, fieldList]);
    const toRoot = useCallback(() => {
        setActiveId('root');
    }, [setActiveId]);
    const toFirstChild = useCallback(() => {
        if (!activeId) {
            return;
        }
        setActiveId((activeId) => {
            const item = fieldList.find((item) => item.parentId === activeId);
            if (item) {
                return item.id;
            }
            return activeId;
        });
    }, [activeId, setActiveId, fieldList]);
    const up = useCallback(() => {
        if (!activeId || activeId === 'root') {
            return;
        }
        setFieldList((oldList) => {
            const list = oldList.slice(0);
            const index = list.findIndex((item) => item.id === activeId);
            const targetIndex = findLastIndex(list.slice(0, index), (item) => item.parentId === list[index].parentId);
            if (index > -1 && targetIndex > -1) {
                const targetItem = list[targetIndex];
                list[targetIndex] = list[index];
                list[index] = targetItem;
            }
            return list;
        });
    }, [activeId, setFieldList]);
    const down = useCallback(() => {
        if (!activeId || activeId === 'root') {
            return;
        }
        setFieldList((oldList) => {
            const list = oldList.slice(0);
            const index = list.findIndex((item) => item.id === activeId);
            const targetIndex = findIndex(list.slice(index + 1), (item) => item.parentId === list[index].parentId);
            if (index > -1 && targetIndex > -1) {
                const item = list[index];
                list.splice(index, 1);
                list.splice(index + 1, 0, item);
            }

            return list;
        });
    }, [activeId, setFieldList]);
    const del = useCallback(() => {
        if (!activeId || activeId === 'root') {
            return;
        }
        setActiveId(null);

        setFieldList((oldList) => {
            const list = oldList.slice(0);
            const index = list.findIndex((item) => item.id === activeId);
            const removeChildren = (id) => {
                const childrenList = list.filter((item) => item.parentId === id);
                childrenList.forEach((item) => {
                    list.splice(list.indexOf(item), 1);
                    removeChildren(item.id);
                });
            };
            if (index > -1) {
                list.splice(index, 1);
                removeChildren(activeId);
            }
            return list;
        });
    }, [activeId, setActiveId, setFieldList]);
    const save = useCallback(() => {
        const modal = FormModal.modal({
            title: '请输入组件名',
            content: <Input name="fieldName" label="组件名" rule="REQ LEN-0-10 NO_REACT"/>,
            formProps: {
                rules: {
                    'NO_REACT': (value) => {
                        if (!!compositeItems.find((item) => item.title === value)) {
                            return {result: false, msg: "%s不能跟已有组件重复"};
                        }
                        return {result: true};
                    }
                },
                onSubmit: (data) => {
                    const targetList = [];
                    const findChildren = (id, depth) => {
                        const current = fieldList.find((item) => item.id === id);
                        const children = fieldList.filter((item) => item.parentId === id);
                        targetList.push(Object.assign({}, current, {depth}));
                        if (children.length > 0) {
                            children.forEach((item) => {
                                findChildren(item.id, depth + 1);
                            });
                        }
                    };
                    findChildren(activeId, 1);
                    const targetIndex = targetList.findIndex(({id}) => id === activeId);
                    targetList[targetIndex].parentId = 'root';
                    saveCompositeItems({
                        title: data.fieldName,
                        children: targetList
                    });
                    modal.destroy();
                }
            }
        });
    }, [activeId, fieldList, compositeItems, saveCompositeItems]);
    return useMemo(() => ({
        toRoot,
        toSuper,
        toFirstChild,
        up,
        down,
        del,
        save
    }), [toRoot, toSuper, toFirstChild, up, down, del, save]);
};

export default useFieldOperation;