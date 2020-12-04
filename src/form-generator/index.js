import React, {useState} from 'react';
import Layout from './Layout';
import {Provider} from './context';
import ComponentList from './ComponentList';
import OptionList from './OptionList';
import WorkArea from './WorkArea';

const FormGenerator = () => {
    const [fieldList, setFieldList] = useState([]);
    const [activeId, setActiveId] = useState(null);
    return <Provider value={{activeId, setActiveId, fieldList, setFieldList}}>
        <Layout left={<ComponentList/>} right={<OptionList/>}>
            <WorkArea/>
        </Layout>
    </Provider>
};

export default FormGenerator;