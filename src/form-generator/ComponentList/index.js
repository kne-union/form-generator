import React, {useCallback} from 'react';
import {Space, Row, Col} from "antd";
import {CloseOutlined} from '@ant-design/icons';
import {getConfig} from '../../form-render';
import chunk from 'lodash/chunk';
import {useAppContext} from "../context";
import defaultCompositeItems from './composite-items.json';
import style from './style.module.scss';


const {componentsConfig} = getConfig();

const ComponentList = () => {
    const {compositeItems, saveCompositeItems, delCompositeItem} = useAppContext();
    const listRender = useCallback(() => {
        return [...componentsConfig, {
            title: "复合组件",
            children: defaultCompositeItems.concat(compositeItems.map((item) => Object.assign({}, item, {
                type: 'Array',
                isCustom: true
            })))
        }].map(({title, children}) => {
            return <div className={style.con} key={title}>
                <div className={style['con-title']}>{title}</div>
                {chunk(children.filter(({hidden}) => hidden !== true), 2).map((item, index) => <Row
                    className={style['con-item']} gutter={[10, 10]}
                    key={index}>
                    {item.map((item) => {
                        const {title, type = "String", children, fieldName, isCustom} = item;
                        return <Col span={12} key={title}>
                            <div className={style['con-content']} draggable="true" onDragStart={(e) => {
                                e.dataTransfer.setData('Text', JSON.stringify({
                                    type,
                                    data: type === "String" ? fieldName : children
                                }));
                            }}>
                                <div className={style['con-content-inner']}>
                                    {title}
                                </div>
                                {isCustom ? <CloseOutlined className={style['con-close']} onClick={() => {
                                    delCompositeItem(item);
                                }}/> : null}
                            </div>
                        </Col>;
                    })}
                </Row>)}
            </div>;
        });
    }, [compositeItems, saveCompositeItems]);
    return <Space direction="vertical" style={{width: '100%'}}>
        {listRender()}
    </Space>
};

export default ComponentList;


