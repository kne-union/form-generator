import React from 'react';
import classnames from 'classnames';
import style from './style.module.scss';

const Img = ({className, url, mod, alt}) => {
    return <img className={classnames(style['img'],'form-render_img', className, {
        [style['is-block']]: mod === 'block'
    })} src={url} alt={alt}/>
};

export default Img;