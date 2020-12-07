import React from 'react';
import classnames from 'classnames';
import style from './style.module.scss';


const Container = ({children, mode, className, ...props}) => {
    return <div
        className={classnames(className, 'form-render_container', style['container'], {
            [style['is-inline-block']]: mode === 'inline-block'
        })} {...props}>{children}</div>
};

export default Container;