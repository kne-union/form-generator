import {createContext, useContext} from 'react';

const context = createContext({});

export const {Consumer, Provider} = context;

export default context;

export const useAppContext = () => {
    return useContext(context);
};