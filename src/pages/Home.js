import React, { Fragment, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import DatePicker from 'react-modern-calendar-datepicker';
import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import { Button, Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import MVCard from '../components/MVCard';
import FFChart from '../components/FFChart';
import { getFootfall, getFootfallCount } from '../helpers/requests';
import { setFilter } from '../store/actions/filterActions';
import { setEntry, setExit, setToday, setTodayExit, setTotal, setTotalExit, setYesterday, setYesterdayExit } from '../store/actions/dataActions';

const Home = () => {
  // const [data, setData] = useState({totalEntry: 0, totalExits: 0, yesterdayEntry:0, yesterdayExits: 0, todayEntry: 0, todayExits: 0, entryData: [], exitData: []});
  const data = useSelector(state => state.data);
  const [type, setType] = useState("bar");
  const [start, setStart] = useState(false);
  const [autoSearched, setAutoSearched] = useState(false);
  const dispatch = useDispatch();
  const filter = useSelector(state => state.filter);
  const [selectedDayRange, setSelectedDayRange] = useState(filter);


  const defaultValue = {
    from: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate()
    },
    to: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate()
    }
  };
  const search = async () => {
    var requestData = {
      params: {
        start: moment(new Date(selectedDayRange.from.year, selectedDayRange.from.month - 1, selectedDayRange.from.day)).startOf("day").format("YYYY-MM-DD HH:MM:00"),
        end: moment(new Date(selectedDayRange.to.year, selectedDayRange.to.month - 1, selectedDayRange.to.day)).endOf("day").format("YYYY-MM-DD HH:MM:00"),
        entity: 1,
        page: 1,
        limit: 100000
      }
    };
    var entryData = await getFootfall(requestData);
    var exitData = await getFootfall({ params: { ...requestData.params, en: 0 } });
    // setData({...data, entryData: entryData.data, exitData: exitData.data});
    dispatch(setEntry(entryData.data));
    dispatch(setExit(exitData.data));
  }
  useEffect(() => {
    if (!autoSearched) {
      search();
      setAutoSearched(true);
    }
  }, [autoSearched])

  const setSelectedDayRangeFilter = (e) => {
    if (e.to && e.from) {
      dispatch(setFilter(e));
    }
    setSelectedDayRange(e);
  }

  const refresh = async () => {
    var requestData = {
      params: {
        en: 1,
        interval: "all"
      }
    }
    var totalEntry = await getFootfallCount(requestData);
    var totalExits = await getFootfallCount({ params: { ...requestData.params, en: 0 } });
    var yesterdayEntry = await getFootfallCount({ params: { ...requestData.params, en: 1, interval: "other", start: moment(new Date()).subtract(1, "day").startOf("day").format("YYYY-MM-DD HH:MM:SS"), end: moment(new Date()).subtract(1, "day").endOf("day").format("YYYY-MM-DD HH:MM:SS") } });
    var yesterdayExits = await getFootfallCount({ params: { ...requestData.params, en: 0, interval: "other", start: moment(new Date()).subtract(1, "day").startOf("day").format("YYYY-MM-DD HH:MM:SS"), end: moment(new Date()).subtract(1, "day").endOf("day").format("YYYY-MM-DD HH:MM:SS") } });
    var todayEntry = await getFootfallCount({ params: { ...requestData.params, en: 1, interval: "other", start: moment(new Date()).startOf("day").format("YYYY-MM-DD HH:MM:SS"), end: moment(new Date()).endOf("day").format("YYYY-MM-DD HH:MM:SS") } });
    var todayExits = await getFootfallCount({ params: { ...requestData.params, en: 0, interval: "other", start: moment(new Date()).startOf("day").format("YYYY-MM-DD HH:MM:SS"), end: moment(new Date()).endOf("day").format("YYYY-MM-DD HH:MM:SS") } });
    dispatch(setTotal(totalEntry.data.total));
    dispatch(setTotalExit(totalExits.data.total));
    dispatch(setYesterday(yesterdayEntry.data.total));
    dispatch(setYesterdayExit(yesterdayExits.data.total));
    dispatch(setToday(todayEntry.data.total));
    dispatch(setTodayExit(todayExits.data.total));
  }

  useEffect(async () => {
    if (!start) {
      refresh();
      setStart(true);
      search();
    }
  }, [start])

  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Row className='pt-5'>
        <Col sm={12} md={12} lg={12} className='mb-3'>
          <h4>Summary</h4>
        </Col>
        <Col sm={12} md={6} lg={4} className='mb-3'>
          <MVCard title="Overall" entry={data.totalEntry} exit={data.totalExits} />
        </Col>
        <Col sm={12} md={6} lg={4} className='mb-3'>
          <MVCard title="Yesterday" entry={data.yesterdayEntry} exit={data.yesterdayExits} />
        </Col>
        <Col sm={12} md={6} lg={4} className='mb-3'>
          <MVCard title="Live" entry={data.todayEntry} exit={data.todayExits} />
        </Col>
      </Row>
      <hr />
      <Row>
        <Col sm={12} md={6} lg={6} className='mb-3'>
          <h4>Timeline</h4>
        </Col>
        <Col sm={12} md={6} lg={6} className='mb-3 text-end'>
          <DatePicker
            value={selectedDayRange}
            onChange={setSelectedDayRangeFilter}
            inputPlaceholder="Select Interval"
            shouldHighlightWeekends
            inputClassName={"form-control w-100"}
          />
          <Button color="dark" className='' style={{ marginLeft: "20px" }} onClick={() => search()}>Search</Button>
        </Col>
        <Col sm={12} md={12} lg={6} className='mb-3'>
          <Card>
            <CardBody>
              {filter !== null &&
                <FFChart
                  start={filter.from}
                  end={filter.to}
                  data={data.entryData}
                  type={type}
                  title="Entries"
                />
              }
            </CardBody>
          </Card>
        </Col>
        <Col sm={12} md={12} lg={6} className='mb-3'>
          <Card>
            <CardBody>
              {filter !== null &&
                <FFChart
                  start={filter.from}
                  end={filter.to}
                  data={data.exitData}
                  type={type}
                  title="Exits"
                />
              }
            </CardBody>
          </Card>
        </Col>
      </Row>

    </>
  );
}

export default Home;