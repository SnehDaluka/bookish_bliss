import React from 'react';
import DatePicker from 'react-datepicker';
import InputMask from 'react-input-mask';
import 'react-datepicker/dist/react-datepicker.css';

const MaskedInput = React.forwardRef((props, ref) => (
  <InputMask {...props} mask="99-99-9999" maskChar={null} inputRef={ref} />
));

const CustomDatePicker = ({ selectedDate, onChange, placeholder = "dd-MM-yyyy" }) => {
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <DatePicker
      selected={selectedDate}
      onChange={(date, event) => {
        if (event && event.type === 'change') {
          if (date !== null) {
            onChange(date);
          } else if (event.target.value === "") {
            onChange(null);
          }
        } else {
          onChange(date);
        }
      }}
      dateFormat="dd-MM-yyyy"
      customInput={<MaskedInput />}
      placeholderText={placeholder}
      className="form-control"
      showPopperArrow={false}
      fixedHeight
      renderCustomHeader={({
        date,
        changeYear,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
      }) => (
        <div className="custom-datepicker-header">
          <div className="year-selector text-start">
            <div className="dropdown w-auto d-inline-block">
              <button
                className="btn dropdown-toggle border-0 shadow-none fw-bold text-dark bg-transparent ps-1 p-0"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {date.getFullYear()}
              </button>
              <ul className="dropdown-menu custom-dropdown-menu" style={{ maxHeight: "250px", overflowY: "auto" }}>
                {years.map((option) => (
                  <li key={option}>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => changeYear(Number(option))}
                    >
                      {option}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="month-selector d-flex justify-content-between align-items-center mt-2 px-2">
            <button
              type="button"
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className="month-nav-btn border-0 bg-transparent"
              style={{cursor: "pointer"}}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <span className="month-name fw-bold" style={{ fontSize: "1rem" }}>
              {months[date.getMonth()]}
            </span>
            <button
              type="button"
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className="month-nav-btn border-0 bg-transparent"
              style={{cursor: "pointer"}}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    />
  );
};

export default CustomDatePicker;
