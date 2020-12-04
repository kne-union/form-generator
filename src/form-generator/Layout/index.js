import React from 'react';
import {Layout} from 'antd';
import style from './style.module.scss';
import {useAppContext} from "../context";

const {Header, Footer, Sider, Content} = Layout;

const PageLayout = ({left, right, children}) => {
    const {activeId} = useAppContext();
    return <Layout className={style['main']}>
        <Header>Header</Header>
        <Layout className={style['body']}>
            <Sider theme="light">{left}</Sider>
            <Content>{children}</Content>
            {activeId ? <Sider theme="light" width={320}>{right}</Sider> : null}
        </Layout>
        <Footer>Footer</Footer>
    </Layout>
};

export default PageLayout;