import {actionTypes} from '../constants/action-types'


export const setFilter = (payload) => {
    return {
        type: actionTypes.FILTER,
        payload: payload
    }
}
