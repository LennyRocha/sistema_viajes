import React from "react";
import { Group, Rect, Shape, Text } from "react-konva";
import { useTheme } from "@mui/material";
import { AsientoEstado } from "../types/AsientoEstado";
import Asiento from "../types/Asiento";

interface AsientoProps {
  verticalRotation?: boolean;
  asiento: Asiento;
  onSelectAsiento?: (seat: Asiento) => void;
  onHoverAsiento?: (
    asiento: Asiento | null,
    position: { x: number; y: number } | null,
  ) => void;
  readonly?: boolean;
  showPopup?: boolean;
  disableHover?: boolean;
  canClickOnOutOfService?: boolean;
}

const AsientoBus = ({
  verticalRotation = false,
  asiento,
  onSelectAsiento = (seat: Asiento) => {},
  onHoverAsiento = (
    asiento: Asiento | null,
    position: { x: number; y: number } | null,
  ) => {},
  readonly = false,
  showPopup = true,
  disableHover = false,
  canClickOnOutOfService = false,
}: AsientoProps) => {
  const estado = asiento.estado || AsientoEstado.AVAILABLE;
  const [isHovered, setIsHovered] = React.useState(false);
  const theme = useTheme();
  const mapColorState = {
    [AsientoEstado.AVAILABLE]: theme.palette.text.secondary,
    [AsientoEstado.SELECTED]: theme.palette.accent.main,
    [AsientoEstado.RESERVED]: theme.palette.success.main,
    [AsientoEstado.SOLD]: theme.palette.secondary.main,
    [AsientoEstado.OUT_OF_SERVICE]: theme.palette.divider,
  };
  const textColorState = {
    [AsientoEstado.AVAILABLE]:
      theme.palette.background.default,
    [AsientoEstado.SELECTED]:
      theme.palette.background.default,
    [AsientoEstado.RESERVED]:
      theme.palette.background.default,
    [AsientoEstado.SOLD]: "white",
    [AsientoEstado.OUT_OF_SERVICE]:
      theme.palette.text.disabled,
  };
  const fillColor = isHovered
    ? theme.palette.primary.main
    : mapColorState[estado] || theme.palette.text.secondary;
  const fillText = isHovered
    ? "white"
    : textColorState[estado] ||
      theme.palette.background.default;
  return (
    <Group
      x={asiento.x}
      y={asiento.y}
      draggable={false}
      onMouseEnter={(e) => {
        if (
          estado === AsientoEstado.OUT_OF_SERVICE ||
          disableHover
        )
          return;
        setIsHovered(true);
        e.target
          .getStage()
          ?.container()
          .style.setProperty("cursor", "pointer");

        if (!showPopup) return;

        const stage = e.target.getStage();

        if (!stage) return;

        const pointer = stage.getPointerPosition();
        const rect = stage
          .container()
          .getBoundingClientRect();

        if (!pointer) return;

        onHoverAsiento(asiento, {
          x: rect.left + pointer.x,
          y: rect.top + pointer.y,
        });
      }}
      onMouseLeave={(e) => {
        if (
          estado === AsientoEstado.OUT_OF_SERVICE ||
          disableHover
        )
          return;
        setIsHovered(false);
        e.target
          .getStage()
          ?.container()
          .style.setProperty("cursor", "default");
        if (!showPopup) return;
        onHoverAsiento(null, null);
      }}
      rotation={verticalRotation ? 0 : 90}
      scale={{
        x: isHovered ? 1.08 : 1,
        y: isHovered ? 1.08 : 1,
      }}
      onClick={() => {
        if (
          estado === AsientoEstado.OUT_OF_SERVICE &&
          !canClickOnOutOfService
        )
          return;
        if (readonly) return;
        setIsHovered(false);
        onSelectAsiento(asiento);
      }}
      onTap={() => {
        if (
          estado === AsientoEstado.OUT_OF_SERVICE &&
          !canClickOnOutOfService
        )
          return;
        if (readonly) return;
        onSelectAsiento(asiento);
      }}
    >
      <Rect
        x={2}
        y={0}
        width={30}
        height={30}
        fill={fillColor}
        cornerRadius={[4, 4, 0, 0]}
        stroke={theme.palette.background.default}
        strokeWidth={0.5}
      />
      <Text
        text={asiento.label}
        fontSize={10}
        x={0}
        y={5}
        width={34}
        fontFamily="Nebulas"
        fill={fillText}
        align="center"
        padding={5}
      />
      <Rect
        x={0}
        y={10}
        width={4}
        height={20}
        fill={fillColor}
        cornerRadius={2}
        stroke={theme.palette.background.default}
        strokeWidth={0.5}
      />
      <Rect
        x={30}
        y={10}
        width={4}
        height={20}
        fill={fillColor}
        cornerRadius={2}
        stroke={theme.palette.background.default}
        strokeWidth={0.5}
      />
      <Rect
        x={0}
        y={28}
        width={34}
        height={4}
        fill={fillColor}
        cornerRadius={[0, 0, 8, 8]}
      />
      <Shape
        sceneFunc={(context, shape) => {
          context.beginPath();
          context.moveTo(4, 28);
          context.lineTo(30, 28);
          context.lineTo(26, 25);
          context.lineTo(8, 25);
          context.lineTo(4, 28);
          context.closePath();
          context.fillStrokeShape(shape);
        }}
        fill={fillColor}
        stroke={theme.palette.background.default}
        strokeWidth={0.5}
      />
    </Group>
  );
};

export default AsientoBus;
