import {combineReducers} from 'redux';
import { dataReducer } from './dataReducer';
import { filterReducer } from './filterReducer';
import { settingReducer } from './settingReducer';
const reducers = combineReducers({
    settings: settingReducer,
    data: dataReducer,
    filter: filterReducer
})

export default reducers;