import React from "react";
import { iconNames } from "../utils/IconPickerList";
import {
  ServicioIcon,
  normalizeIconName,
} from "@nexoroute/commons";
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion } from "framer-motion";
import {
  Check,
  Close,
  ContentCopy,
  Search,
} from "@mui/icons-material";

type CustomPickerProps = {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
};

const CustomIconPicker = ({
  value,
  onChange,
  disabled,
}: CustomPickerProps) => {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const [icon_name, setIcon_name] = React.useState(
    value || "",
  );
  const [query, setQuery] = React.useState("");
  const [isCopied, setIsCopied] = React.useState(false);

  const sorted = React.useMemo(() => {
    if (!query) return iconNames;
    return iconNames.filter((icon) =>
      normalizeIconName(icon)
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  }, [query]);

  const theme = useTheme();

  const xl = useMediaQuery(theme.breakpoints.up("xl"));
  const md = useMediaQuery(theme.breakpoints.up("md"));
  const sm = useMediaQuery(theme.breakpoints.up("sm"));

  const columns = xl ? 6 : md ? 5 : sm ? 4 : 3;

  const rowCount = Math.ceil(sorted.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
  });

  React.useEffect(() => {
    if (value) {
      const iconIndex = iconNames.indexOf(value);
      if (iconIndex >= 0) {
        const row = Math.floor(iconIndex / columns);
        rowVirtualizer.scrollToIndex(row, {
          align: "center",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, columns, sorted]);

  React.useEffect(() => {
    if (query) {
      rowVirtualizer.scrollToOffset(0);
      setIsCopied(false);
    }
  }, [query]);

  const handleSelect = (icon: string) => {
    setIcon_name(icon);
    onChange?.(icon);
  };

  return (
    <Box
      sx={{
        minWidth: {
          xs: 100,
          md: 500,
        },
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          padding: "8px 0",
          zIndex: 1,
          width: "100%",
        }}
      >
        <TextField
          variant="outlined"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar un ícono por su nombre"
          value={query}
          slotProps={{
            input: {
              endAdornment: query ? (
                <IconButton onClick={() => setQuery("")}>
                  <Close fontSize="small" />
                </IconButton>
              ) : null,
              startAdornment: <Search />,
            },
          }}
          fullWidth
        />
      </Box>

      <Box
        ref={parentRef}
        sx={{
          height: "450px",
          overflow: "auto",
          width: "100%",
        }}
      >
        <Box
          sx={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer
            .getVirtualItems()
            .map((virtualRow) => {
              const startIndex = virtualRow.index * columns;
              const rowIcons = sorted.slice(
                startIndex,
                startIndex + columns,
              );

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                    display: "flex",
                    gap: 8,
                    padding: "4px",
                  }}
                >
                  {rowIcons.map((icon) => (
                    <Tooltip
                      title={normalizeIconName(icon)}
                      key={icon}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => handleSelect(icon)}
                        disabled={disabled}
                        color={
                          icon.toLocaleLowerCase() ===
                          icon_name?.toLocaleLowerCase()
                            ? "primary"
                            : "inherit"
                        }
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          flex: `1 1 calc(${100 / columns}% - 8px)`,
                          minWidth: 0,
                          borderColor:
                            icon.toLocaleLowerCase() ===
                            icon_name?.toLocaleLowerCase()
                              ? theme.palette.primary.main
                              : theme.palette.divider,
                        }}
                      >
                        <ServicioIcon
                          name={icon}
                          size="xl"
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: 10,
                            mt: 0.5,
                            textAlign: "center",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            width: "100%",
                          }}
                        >
                          {normalizeIconName(icon)}
                        </Typography>
                      </Button>
                    </Tooltip>
                  ))}
                  {/* Rellena espacios vacíos en la última fila para que no se estire el último botón */}
                  {rowIcons.length < columns &&
                    Array.from({
                      length: columns - rowIcons.length,
                    }).map((_, i) => (
                      <Box
                        key={`empty-${i + virtualRow.index * columns}`}
                        sx={{
                          flex: `1 1 calc(${100 / columns}% - 8px)`,
                        }}
                      />
                    ))}
                </div>
              );
            })}
        </Box>
      </Box>
      <motion.div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          padding: "8px 0",
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
          }}
        >
          <ServicioIcon name={icon_name} size="xl" />
          <Box>
            <Typography variant="body1" color="primary">
              Ícono seleccionado
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
            >
              {normalizeIconName(icon_name)}
            </Typography>
          </Box>
        </Box>
        <Tooltip
          title={
            isCopied
              ? "Nombre copiado"
              : "Copiar nombre del ícono"
          }
        >
          <IconButton
            color="inherit"
            aria-label="copy-name"
            onClick={async () => {
              await navigator.clipboard.writeText(
                normalizeIconName(icon_name),
              );
              setIsCopied(true);
            }}
            size="small"
          >
            {isCopied ? <Check /> : <ContentCopy />}
          </IconButton>
        </Tooltip>
      </motion.div>
    </Box>
  );
};

export default CustomIconPicker;
