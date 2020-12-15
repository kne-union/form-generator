import React, {useRef,useEffect} from 'react';
import Form, {useField, Group, useSubmit} from '../react-form';

const {useGroup, GroupList} = Group;

const Input = (props) => {
    const {value, label, errMsg, errState, triggerValidate, onChange} = useField(props);
    return <div>{label}:<input type="text" value={value||''} onChange={onChange}
                               onBlur={triggerValidate}/>{errState}{errMsg}</div>
};

const DelButton = (props) => {
    const {onRemove} = useGroup();
    return <button onClick={onRemove}>删除</button>
};

const SubmitButton = ({children}) => {
    const {isPass, isLoading, ...submitProps} = useSubmit();
    return <button {...submitProps}>{children}({isPass}-{isLoading})</button>
};

export default () => {
    const formRef = useRef(null);
    const ref = useRef(null);
    useEffect(()=>{
        setTimeout(()=>{
            formRef.current.data = {name:['linzp1','linzp2']};
        },1000);
    },[]);
    return <Form
        debug
        ref={formRef}
        onSubmit={(data) => {
            console.log(JSON.stringify(data));
        }}>
        <button onClick={() => {
            ref.current.onAdd();
        }}>添加
        </button>
        <GroupList name="name" ref={ref}>
            <Input name="name" label="名称" rule="REQ"/>
            <DelButton/>
        </GroupList>
        <div>
            <SubmitButton>提交</SubmitButton>
        </div>
    </Form>
};
