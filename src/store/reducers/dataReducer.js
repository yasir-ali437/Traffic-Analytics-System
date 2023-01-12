import { actionTypes } from "../constants/action-types";
let config = require("../../config.json");
let _total = {};
let _graph = {};
Object.keys(config.data.entities).forEach((key) => {
  _total[key] = 0;
  _graph[key] = new Array(24).fill(0);
});

const groupByKey = (list, key, { omitKey = false }) => {
  let data = [];

  let _data = list.reduce(
    (hash, { [key]: value, ...rest }) => ({
      ...hash,
      [value]: (hash[value] || []).concat(
        omitKey ? { ...rest } : { [key]: value, ...rest }
      ),
    }),
    {}
  );
  Object.keys(_data ? _data : {}).forEach((item) => {
    let obj = {
      CID: item,
      region: _data[item],
    };
    data.push(obj);
  });
  return data;
};

const groupData = (data) => {
  if (typeof data !== undefined && data && data.length > 0) {
    let _data = groupByKey(data, "CID", { omitKey: true });
    return _data;
  } else {
    return [];
  }
};

const initialState = {
  total: _total,
  graph: [],
  table: [],
  _table: [],
  thumbs: [],
  journey: {
    entry: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    exit: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
  },
  queue: {},
  config: config,
};

export const dataReducer = (state = initialState, { type, payload = {} }) => {
  switch (type) {
    case actionTypes.DATA_TOTAL:
      return { ...state, total: payload };
    case actionTypes.DATA_GRAPH:
      return { ...state, graph: payload };
    case actionTypes.DATA_THUMBS:
      return { ...state, thumbs: payload };
    case actionTypes.DATA_JOURNEY:
      return { ...state, journey: payload };
    case actionTypes.DATA_QUEUE:
      return { ...state, queue: payload };
    case actionTypes.DATA_TABLE:
      return { ...state, table: groupData(payload) };
    default:
      return state;
  }
};
