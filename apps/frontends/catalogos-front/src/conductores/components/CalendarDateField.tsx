"use client";

import React from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  Box,
  IconButton,
  InputAdornment,
  Popover,
  TextField,
  Typography,
} from "@mui/material";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const WEEK_DAYS = ["L", "M", "M", "J", "V", "S", "D"];

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toInputValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toDisplayValue(value: string) {
  const date = parseDate(value);
  if (!date) return "";
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function getMonthCells(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - firstOffset + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) return null;
    return new Date(year, month, dayNumber);
  });
}

export default function CalendarDateField({
  label,
  value,
  onChange,
  error,
  helperText,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
}>) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [viewDate, setViewDate] = React.useState(() => parseDate(value) || new Date());
  const selectedValue = value;

  React.useEffect(() => {
    const parsed = parseDate(value);
    if (parsed) setViewDate(parsed);
  }, [value]);

  const moveMonth = (offset: number) => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      <Typography variant="body2" sx={{ fontWeight: 850 }}>
        {label}
      </Typography>
      <TextField
        fullWidth
        value={toDisplayValue(value)}
        placeholder="dd/mm/aaaa"
        error={error}
        helperText={helperText}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={`Abrir calendario de ${label}`}
                  edge="end"
                  onClick={(event) => setAnchorEl(event.currentTarget)}
                >
                  <CalendarMonthIcon />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Box sx={{ width: 316, p: 1.25 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <IconButton aria-label="Mes anterior" onClick={() => moveMonth(-1)}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography sx={{ fontWeight: 950 }}>
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </Typography>
            <IconButton aria-label="Mes siguiente" onClick={() => moveMonth(1)}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5 }}>
            {WEEK_DAYS.map((day, index) => (
              <Typography
                key={`${day}-${index}`}
                variant="caption"
                sx={{ textAlign: "center", fontWeight: 950, color: "text.secondary" }}
              >
                {day}
              </Typography>
            ))}
            {getMonthCells(viewDate).map((date, index) => {
              const dateValue = date ? toInputValue(date) : "";
              const selected = Boolean(date && dateValue === selectedValue);

              return (
                <Box
                  key={`${viewDate.getMonth()}-${index}`}
                  component="button"
                  disabled={!date}
                  onClick={() => {
                    if (!date) return;
                    onChange(dateValue);
                    setAnchorEl(null);
                  }}
                  sx={{
                    height: 34,
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: selected ? "primary.main" : "transparent",
                    bgcolor: selected ? "primary.main" : "transparent",
                    color: selected ? "primary.contrastText" : "text.primary",
                    cursor: date ? "pointer" : "default",
                    fontWeight: selected ? 950 : 700,
                    "&:hover": {
                      bgcolor: date && !selected ? "action.hover" : undefined,
                    },
                  }}
                >
                  {date?.getDate() || ""}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Popover>
    </Box>
  );
}
