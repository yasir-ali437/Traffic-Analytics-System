import { actionTypes } from "../constants/action-types";

const initialState = {
    from: {
        day: new Date().getDate(),
        month: new Date().getMonth()+1,
        year: new Date().getFullYear()
    },
    to: {
        day: new Date().getDate(),
        month: new Date().getMonth()+1,
        year: new Date().getFullYear()
    }
}


export const filterReducer = (state = initialState, {type, payload={}}) => {
    switch(type){
        case actionTypes.FILTER:
            return { ...state, ...payload };
        default:
            return state;
    }
}