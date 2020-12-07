import React from 'react';
import classnames from 'classnames';

const Word = ({className, children, ...props}) => {
    return <span {...props} className={classnames(className,'form-render_word')}>{children}</span>
};

export default Word;