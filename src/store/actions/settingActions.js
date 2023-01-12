import {actionTypes} from '../constants/action-types'

export const getSettings = (payload) => {
    return {
        type: actionTypes.SETTINGS_GET,
        payload: payload
    }
}

export const setSettings = (payload) => {
    return {
        type: actionTypes.SETTINGS_SET,
        payload: payload
    }
}

export const setAllSettings = (payload) => {
    return {
        type: actionTypes.SET_ALL_SETTINGS,
        payload: payload
    }
}

export const setDetails = (payload) => {
    return {
        type: actionTypes.SET_DETAILS,
        payload: payload
    }
}




