import {actionTypes} from '../constants/action-types'

export const setTotal = (payload) => {
    return {
        type: actionTypes.DATA_TOTAL,
        payload: payload
    }
}

export const setGraph = (payload) => {
    return {
        type: actionTypes.DATA_GRAPH,
        payload: payload
    }
}

export const setThumbs = (payload) => {
    return {
        type: actionTypes.DATA_THUMBS,
        payload: payload
    }
}

export const setTable = (payload) => {
    return {
        type: actionTypes.DATA_TABLE,
        payload: payload
    }
}


export const setJourney = (payload) => {
    return {
        type: actionTypes.DATA_JOURNEY,
        payload: payload
    }
}

export const setIntrusion = (payload) => {
    return {
        type: actionTypes.DATA_JOURNEY,
        payload: payload
    }
}


export const setQueue = (payload) => {
    return {
        type: actionTypes.DATA_QUEUE,
        payload: payload
    }
}
