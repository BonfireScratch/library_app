import React, { Component } from 'react';
import moment from 'moment';
import 'moment/locale/el';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import './calendar.scss';

moment.locale('el');

const Day = ({currentDate, date, startDate, endDate, onClick}) => {
  let className = [];

  if (moment().isSame(date, 'day')) {
    className.push('active');
  }

  if (date.isSame(startDate, 'day')) {
    className.push('start');
  }

  if (date.isBetween(startDate, endDate, 'day')) {
    className.push('between');
  }

  if (date.isSame(endDate, 'day')) {
    className.push('end');
  }

  if (!date.isSame(currentDate, 'month')) {
    className.push('muted');
  }

  return (
    <div className={`col d-flex justify-content-center dayNumber ${className.join(' ')}`} onClick={() => onClick(date)}>
      <span>{date.date()}</span>
    </div>
  )
};

const Days = ({date, startDate, endDate, onClick}) => {
  const thisDate = moment(date);
  const daysInMonth = moment(date).daysInMonth();
  const firstDayDate = moment(date).startOf('month');
  const nextsMonth = moment(date).add(1, 'month');
  const visibleDaysPreviousMonth = firstDayDate.day() ? firstDayDate.day() - 1 : 6

  let days = [];
  let dayNames = [];

  // Create the day labels

  for (let i = 0; i < 7; i++) {
    dayNames.push(
      <div className="col d-flex justify-content-center">
        <span className="dayLabel" key={i}>{moment().day(i + 1).format('ddd')}</span>
      </div>
    );
  }

  let dayToShow = firstDayDate.subtract(visibleDaysPreviousMonth + 1, 'd');

  // Create the visible days from the previous month

  for (let i = visibleDaysPreviousMonth; i > 0; i--) {
    dayToShow = firstDayDate.add(1, 'd');
  
    days.push( 
      <Day key={moment(dayToShow).format("YYYY-MM-DD")} onClick={(date) => onClick(date)} currentDate={date} date={moment(dayToShow)} startDate={startDate} endDate={endDate} />
    );
  }

  // Create the visible days from this month

  for (let i = 1; i <= daysInMonth; i++) {
    thisDate.date(i);

    days.push(
      <Day key={moment(thisDate).format("YYYY-MM-DD")} onClick={(date) => onClick(date)}  currentDate={date} date={moment(thisDate)} startDate={startDate} endDate={endDate} />
    );
  }

  // Create the visible days from next month

  const daysCount = days.length;
  
  for (let i = 1; i <= (42 - daysCount); i++) {
    nextsMonth.date(i);

    days.push(
      <Day key={moment(nextsMonth).format('YYYY-MM-DD')} onClick={(date) => onClick(date)} currentDate={date} date={moment(nextsMonth)} startDate={startDate} endDate={endDate} />
    );
  }

  let daysDisplay = [];

  // Add a grid system

  for (let i = 0; i < days.length; i += 7) {
    daysDisplay.push(
      <div className="row">
        {days.slice(i, i + 7)}
      </div>
    )
  }

  return (
    <div className="calendar-days px-5">
      <div className="row">
        {dayNames}
      </div>
      {daysDisplay}
    </div>
  );
};

export default class Calendar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      date: moment(),
      startDate: moment(),
      endDate: moment().add(7, 'day')
    };

    this.onDateChange(this.state.startDate, this.state.endDate);
  }

  resetDate() {
    this.setState({
      date: moment()
    });
  }

  changeMonth(month) {
    const { date } = this.state;

    date.month(month);

    this.setState( date );
  }

  onDateChange(startDate, endDate) {
    // Format the dates

    if (startDate !== null) {
      startDate = startDate.format('YYYY-MM-DD');
    }

    if (endDate === null) {
      endDate = startDate;
    } else {
      endDate = endDate.format('YYYY-MM-DD');
    }

    this.props.onDateChange({ startDate, endDate });
  }

  changeDate(date) {
    let { startDate, endDate } = this.state;

    // Handle date changes on the calendar GUI

    if (startDate === null || date.isBefore(startDate, 'day') || ! startDate.isSame(endDate, 'day')) {
      startDate = moment(date);
      endDate = moment(date);
    } else if (date.isSame(startDate, 'day') && date.isSame(endDate, 'day')) {
      startDate = null;
      endDate = null;
    } else if (date.isAfter(startDate, 'day')) {
      endDate = moment(date);
    }

    this.onDateChange(startDate, endDate);
    this.setState({ startDate, endDate });
  }

  render() {
    const {date, startDate, endDate} = this.state;

    return (
      <div className="calendar">
        <div className="calHeader d-flex justify-content-between align-items-center px-5">
          <FontAwesomeIcon icon={faChevronLeft} className="fa-icon" onClick={() => this.changeMonth(date.month() - 1)} />
          <h3 onClick={() => this.resetDate()}>{date.format('MMMM')} {date.format('YYYY')}</h3>
          <FontAwesomeIcon icon={faChevronRight} className="fa-icon" onClick={() => this.changeMonth(date.month() + 1)} />
        </div>
        <Days onClick={(date) => this.changeDate(date)} date={date} startDate={startDate} endDate={endDate} />
      </div>
    );
  }
}
