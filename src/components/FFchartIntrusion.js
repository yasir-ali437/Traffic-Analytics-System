import React from 'react';
import ReactECharts from 'echarts-for-react';
import moment from 'moment';
import { graphColors } from '../helpers/meta';

const FFChartIntrusion = (props) => {
    var offset = new Date().getTimezoneOffset()/60;
    let formateString = "YYYY-MM-DD HH";
    let start = moment(moment(new Date(props.start.year, props.start.month-1, props.start.day)).startOf("day").format("YYYY-MM-DD HH:MM:00"));
    let end = moment(moment(new Date(props.end.year, props.end.month-1, props.end.day)).endOf("day").format("YYYY-MM-DD HH:MM:00"));
    let days = Math.abs(start.diff(end, "days"));
    let type = "hours";
    let delta = 1;
    if(days > 1){
        formateString = "YYYY-MM-DD";
        type = "days";
    }
    if(days >= 60){
        formateString = "YYYY-MM";
        type = "months";
    }
    if(days >= 730){
        formateString = "YYYY";
        type = "years";
    }

    let data = [];
    Object.keys(props.data).forEach((val, ind) => {
        data.push([]);
    });
    let cursor = start
    while(end.isAfter(cursor)) {
        var key = cursor.format(formateString);
        Object.keys(props.data).forEach((val, ind) => {
            data[ind][key] = 0;
        });
        cursor = cursor.add(delta, type);
    }
    Object.keys(props.data).forEach((val, ind) => {
        // console.log("Graph", props.data, val, ind);
        if(props.data[val]){
            props.data[val].forEach(row => {
                var key;
                if(offset > 0){
                    key = moment(new Date(row.T)).subtract(Math.abs(offset), "hours").format(formateString);
                }else{
                    key = moment(new Date(row.T)).add(Math.abs(offset), "hours").format(formateString);
                }
                data[ind][key]++;
            });
        }
        data[ind] = Object.keys(data[ind]).map(key => {
                return {name: key+"", value: [key, data[ind][key]]};
        });

        // console.log("Graph", data)
    });

    const option = {
        title: {
            text: props.config.data.label
        },
        color: graphColors,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                animation: false
            }
        },
        legend: {},
        xAxis: {
            type: 'time',
            splitLine: {
                show: false
            }
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, '100%'],
            splitLine: {
                show: false
            }
        },
        series: Object.keys(props.data).map((key, ind) => {
            return {
                name: props.config.data.entities[key],
                type: props.type,
                showSymbol: false,
                data: data[ind]
            }
        })
    };
    return (
        <>
            <ReactECharts option={option} />
        </>
    );
}


export default FFChartIntrusion;