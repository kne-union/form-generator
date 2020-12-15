import React, {useState} from 'react';
import FormGenerator from './form-generator';
import 'antd/dist/antd.css';

const getCompositeItems = () => JSON.parse(window.localStorage.getItem('composite_items') || '[]');

const getUUId = () => {
    const nextUUId = (window.localStorage.getItem('composite_uuid_creator') || 0) + 1;
    window.localStorage.setItem('composite_uuid_creator', nextUUId);
    return nextUUId;
};

const App = () => {
    const [list, setList] = useState(getCompositeItems);
    return <FormGenerator compositeItems={list} saveCompositeItems={(item) => {
        setList((oldList) => {
            item.id = getUUId();
            const newList = oldList.concat(item);
            window.localStorage.setItem('composite_items', JSON.stringify(newList));
            return newList;
        });
    }} delCompositeItem={({title}) => {
        setList((oldList) => {
            const index = oldList.findIndex((item) => item.title === title);
            const newList = oldList.slice(0);
            newList.splice(index, 1);
            window.localStorage.setItem('composite_items', JSON.stringify(newList));
            return newList;
        });
    }}/>
};

export default App;
