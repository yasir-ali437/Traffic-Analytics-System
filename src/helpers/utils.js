
import moment from 'moment';
import { useRef } from 'react';
import { useEffect } from 'react';
import  {colors, graphColors}  from "./meta"

export const checkString = (value, key) => {
  var digits = /^[0-9]+$/
  var letters = /^([A-Za-z ]+|\d+)$/;
  if (value.target.value == "" || (value.target.value.match(letters) && !value.target.value.match(digits))) {
    return value
  }
}

export const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export const getDateObject = (momentObj) => {


  let obj = {
    year: momentObj.year(),
    month: momentObj.month() + 1,
    day: momentObj.date()
  }
  return obj
}


export const createDateFilters = () => {
  var dateFilters = {};
  let today = moment(new Date());
  console.log('today', today);

  let yesterday = moment(new Date()).subtract(1, "days");
  let thisWeek = moment(new Date()).startOf("week");
  let lastWeek = moment(new Date()).subtract(1, "week").startOf("week");
  let thisMonth = moment(new Date()).startOf("month");
  let lastMonth = moment(new Date()).subtract(1, "month").startOf("month");
  let thisYear = moment(new Date()).startOf("year");
  let lastYear = moment(new Date()).subtract(1, "year").startOf("year");
  dateFilters["today"] = { type: "day", label: "Today", from: getDateObject(today), to: getDateObject(today) };
  dateFilters["yesterday"] = { type: "day", label: "Yesterday", from: getDateObject(yesterday), to: getDateObject(yesterday) };
  dateFilters["thisWeek"] = { type: "week", label: "Current Week", from: getDateObject(thisWeek), to: getDateObject(today) };
  dateFilters["lastWeek"] = { type: "week", label: "Previous Week", from: getDateObject(lastWeek), to: getDateObject(lastWeek.endOf("week")) };
  dateFilters["thisMonth"] = { type: "month", label: thisMonth.format("MMMM"), from: getDateObject(thisMonth), to: getDateObject(today) };
  dateFilters["lastMonth"] = { type: "month", label: lastMonth.format("MMMM"), from: getDateObject(lastMonth), to: getDateObject(lastMonth.endOf("month")) };
  dateFilters["thisYear"] = { type: "year", label: thisYear.format("YYYY"), from: getDateObject(thisYear), to: getDateObject(today) };
  dateFilters["lastYear"] = { type: "year", label: lastYear.format("YYYY"), from: getDateObject(lastYear), to: getDateObject(lastYear.endOf("year")) };
  console.log('dateFilters', dateFilters);
  return dateFilters;
}

export const convertObjectIntoArray = (object) => {
  if (typeof object !== undefined && object) {
    let array = Object.keys(object ? object : {}).map(item => { return item })
    return array;
  }
  else {
    return []
  }
}

export const getCameraObject = (stores) => {
  let cameras = stores.slice();
  let cids = [];
  let rids = [];
  if (cameras.length > 0) {
    cameras.map((row) => {
      cids.push(row.id);
      if (typeof row !== undefined && row && "setting" in row && typeof row.setting !== undefined && row.setting && "regions" in row.setting && row.setting.regions.length > 0) {
        for (let i = 0; i < row.setting.regions.length; i++) {
          if ("id" in row.setting.regions[i]) {
            rids.push(row.setting.regions[i].id)

          }
        }
      }
    })
  }


  let obj = {
    cids: cids,
    rids: rids,
  }

  return obj


}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}



export const tabStyle = (type, selected) => {
  console.log('type, selected',type, selected);
  return {
    fontSize: "16px",
    border: "0px",
    color: selected === type ? colors.dark : "inherit",
    background: "white",
    padding: "20px 20px 17px 20px",
    borderBottom:
      selected === type
        ? "3px solid " + colors.primary
        : "3px solid transparent",
  };
};
