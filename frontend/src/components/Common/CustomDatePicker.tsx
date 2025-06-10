import React, { useState, useEffect } from "react";
import { Icon } from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";
import { parse, isValid, format, isDate } from "date-fns";
import { SingleDatepicker } from "chakra-dayzed-datepicker";

interface CustomDatePickerProps {
  date: string | Date | null;
  onDateChange: (val: string) => void;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ date, onDateChange }) => {
  const getCurrentDate = () => new Date();

  const [validDate, setValidDate] = useState<Date | string>(() => {
    if (!date) return getCurrentDate();

    if (typeof date === "string" && date.trim() !== "" && !isNaN(Date.parse(date))) {
      return parse(date, "MM/dd/yyyy", new Date());
    } else if (isDate(date)) {
      const parsedDate = parse(date.toLocaleDateString("en-US"), "MM/dd/yyyy", new Date());
      if (isValid(parsedDate)) {
        return format(parsedDate, "MM/dd/yyyy");
      }
      return getCurrentDate();
    }

    return getCurrentDate();
  });

  useEffect(() => {
    if (!date) {
      setValidDate(getCurrentDate());
    } else if (typeof date === "string") {
      setValidDate(parse(date, "MM/dd/yyyy", new Date()));
    } else if (isDate(date)) {
      const parsedDate = parse(date.toLocaleDateString("en-US"), "MM/dd/yyyy", new Date());
      if (isValid(parsedDate)) {
        const formattedDate = format(parsedDate, "MM/dd/yyyy");
        setValidDate(formattedDate);
      } else {
        setValidDate(getCurrentDate());
      }
    } else {
      setValidDate(getCurrentDate());
    }
  }, [date]);

  const handleDateChange = (newDate: Date) => {
    if (isValid(newDate)) {
      const formattedDate = format(newDate, "MM/dd/yyyy");
      setValidDate(formattedDate);
      onDateChange(formattedDate);
    }
  };

  return (
    <SingleDatepicker
      configs={{
        dateFormat: "MM/dd/yyyy",
      }}
      date={
        typeof validDate === "string"
          ? parse(validDate, "MM/dd/yyyy", new Date())
          : validDate
      }
      onDateChange={handleDateChange}
      propsConfigs={{
        triggerBtnProps: {
          w: "100%",
          justifyContent: "space-between",
          padding: "0.75rem 1rem",
          border: "1px solid #E2E8F0",
          borderRadius: "0.375rem",
          bg: "white",
          iconSpacing: "0",
          rightIcon: <Icon as={CalendarIcon} boxSize={5} color="gray.500" />,
        },
      }}
    />
  );
};

export default CustomDatePicker;
