import React, {useCallback} from 'react';
import {Space, Row, Col} from "antd";
import config from '../config.json';
import chunk from 'lodash/chunk';
import style from './style.module.scss';

const ComponentList = () => {
    const listRender = useCallback(() => {
        return config.map(({title, children}) => {
            return <div className={style.con} key={title}>
                <div className={style['con-title']}>{title}</div>
                {chunk(children.filter(({hidden}) => hidden !== true), 2).map((item, index) => <Row
                    className={style['con-item']} gutter={[10, 10]}
                    key={index}>
                    {item.map(({title, fieldName}) => <Col span={12} key={title}>
                        <div className={style['con-content']} draggable="true" onDragStart={(e) => {
                            e.dataTransfer.setData('Text', fieldName);
                        }}>{title}</div>
                    </Col>)}
                </Row>)}
            </div>;
        });
    }, []);
    return <Space direction="vertical" style={{width: '100%'}}>
        {listRender()}
    </Space>
};

export default ComponentList;


export const FieldMap = (() => {
    const output = {};
    config.forEach(({children}) => {
        children.forEach((item) => {
            output[item.fieldName] = item;
        });
    });

    return output;
})();


