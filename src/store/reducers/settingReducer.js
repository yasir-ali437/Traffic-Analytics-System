import { actionTypes } from "../constants/action-types";

const initialState = {
  data: {
    type: "regions",
    exit: [],
    entry: [],
    queue: {},
    stream: null,
    ready: false,
    restart: false,
    frame: false,
    url: null,
    confidence:0.05,
    percentage: 1,
  },
  details : [],
  allSettings : [],
  types: [
    { val: "line", lable: "Line" },
    { val: "region", lable: "Single Region" },
    { val: "regions", lable: "Multiple Regions" },
  ],
  response: null,
};

export const settingReducer = (
  state = initialState,
  { type, payload = [] }
) => {
  switch (type) {
    case actionTypes.SETTINGS_GET:
      return { ...state, data: payload.data, response: payload };
    case actionTypes.SETTINGS_SET:
      var data = state.data;
      return {
        ...state,
        data: { ...data, ...payload.data },
        response: payload,
      };
    case actionTypes.SET_ALL_SETTINGS : 
    console.log('allSettingsInRedu',payload);
        return {...state , allSettings : payload}
    case actionTypes.SET_DETAILS : 
        return {...state, details : payload}
    default:
      return state;
  }
};
