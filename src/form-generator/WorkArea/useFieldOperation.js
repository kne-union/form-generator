import {useCallback, useMemo} from 'react';
import {useAppContext} from "../context";
import findLastIndex from 'lodash/findLastIndex';
import findIndex from 'lodash/findIndex';


const useFieldOperation = () => {
    const {setFieldList, fieldList, activeId, setActiveId} = useAppContext();
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
            const childrenList = list.filter((item) => item.parentId === activeId);
            if (index > -1) {
                list.splice(index, 1);
                childrenList.forEach((item) => {
                    list.splice(list.indexOf(item), 1);
                });
            }
            return list;
        });
    }, [activeId, setActiveId, setFieldList]);
    return useMemo(() => ({
        toRoot,
        toSuper,
        toFirstChild,
        up,
        down,
        del
    }), [toRoot, toSuper, toFirstChild, up, down, del]);
};

export default useFieldOperation;