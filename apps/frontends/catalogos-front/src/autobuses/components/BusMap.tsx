"use client";
import React from "react";
import {
  Stage,
  Layer,
  Rect,
  Text,
  Shape,
  Group,
  Image,
} from "react-konva";
import { useTheme, useMediaQuery } from "@mui/material";
import AsientoBus from "./AsientoBus";
import tiposBus from "../../tipos_autobus/constants/TiposBusMapper";
import Asiento from "../types/Asiento";
import { Vector2d } from "konva/lib/types";
import AsientoPopup from "./AsientoPopup";
import useImage from "use-image";

interface BusMapProps {
  idTipo?: number;
  asientos?: Asiento[];
  onSelectAsiento?: (seat: Asiento) => void;
  scale?: Vector2d;
  readonly?: boolean;
  canClickOnOutOfService?: boolean;
}

const BusMap = ({
  idTipo = 1,
  asientos,
  onSelectAsiento = (seat: Asiento) => {},
  scale = { x: 1, y: 1 },
  readonly = false,
  canClickOnOutOfService = false,
}: BusMapProps) => {
  const theme = useTheme();
  const [popup, setPopup] = React.useState<{
    seat: Asiento | null;
    position: { x: number; y: number } | null;
  }>({
    seat: null,
    position: null,
  });
  const onHover = (
    asiento: Asiento | null,
    position: { x: number; y: number } | null,
  ) => {
    setPopup({ seat: asiento, position });
  };
  function handleSelectAsiento(asiento: Asiento) {
    if (
      readonly ||
      (asiento.estado === "OUT_OF_SERVICE" &&
        !canClickOnOutOfService)
    ) {
      return;
    }
    onSelectAsiento(asiento);
  }
  const busRow = {
    1: 9,
    2: 11,
    3: 6,
  };
  const size = React.useMemo(
    () => busRow[idTipo],
    [idTipo],
  );
  const md = useMediaQuery(theme.breakpoints.up("md"));
  const stageSize = React.useMemo(() => {
    const num = md ? 102 : 100;
    const calc = size * 40 + num;
    if (md) {
      return {
        width: calc,
        height: 220,
      };
    } else {
      return {
        width: 220,
        height: calc,
      };
    }
  }, [size, md]);
  const plantillas = asientos || tiposBus[idTipo - 1].seats;
  return (
    <>
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        style={{
          border: `2px solid ${theme.palette.divider}`,
          width: "fit-content",
          borderRadius: "4px",
        }}
        scale={scale}
      >
        <Layer>
          <DriverSeat
            rotate={md}
            x={md ? stageSize.width - 22 : 10}
            y={md ? 10 : 20}
          />
          <Group x={0} y={0}>
            {plantillas.map((asiento, index) => {
              return md ? (
                <AsientoBus
                  key={index + 1}
                  verticalRotation={!md}
                  asiento={asiento}
                  onSelectAsiento={handleSelectAsiento}
                  onHoverAsiento={onHover}
                  showPopup
                  canClickOnOutOfService={
                    canClickOnOutOfService
                  }
                />
              ) : (
                <AsientoBus
                  key={index + 1}
                  verticalRotation={!md}
                  asiento={{
                    ...asiento,
                    x: asiento.y,
                    y: asiento.x,
                  }}
                  onSelectAsiento={handleSelectAsiento}
                  onHoverAsiento={onHover}
                  showPopup
                />
              );
            })}
          </Group>
          <BackPart
            x={md ? 30 : 10}
            y={md ? 10 : stageSize.height - 30}
            width={md ? 200 : stageSize.width - 20}
            height={20}
            rotate={md}
          />
        </Layer>
      </Stage>
      {popup.seat && popup.position && (
        <AsientoPopup
          seat={popup.seat}
          position={popup.position}
        />
      )}
    </>
  );
};

const DriverSeat = ({
  rotate = false,
  x = 200,
  y = 175,
}) => {
  const [img] = useImage("/assets/konva/volante.png");
  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.up("md"));
  return (
    <Group x={x} y={y} rotation={rotate ? 90 : 0}>
      <Rect
        x={3}
        y={0}
        width={35}
        height={35}
        fill={theme.palette.text.secondary}
        cornerRadius={[4, 4, 0, 0]}
        stroke={theme.palette.background.default}
        strokeWidth={1}
      />
      <Image
        image={img}
        x={8}
        y={md ? -12 : -10}
        width={25}
        height={25}
      />
      <Rect
        x={0}
        y={10}
        width={6}
        height={30}
        fill={theme.palette.text.secondary}
        cornerRadius={4}
        stroke={theme.palette.background.default}
        strokeWidth={0.5}
      />
      <Rect
        x={35}
        y={10}
        width={6}
        height={30}
        fill={theme.palette.text.secondary}
        cornerRadius={4}
        stroke={theme.palette.background.default}
        strokeWidth={0.5}
      />
      <Rect
        x={0}
        y={35}
        width={41}
        height={6}
        fill={theme.palette.text.secondary}
        cornerRadius={[0, 0, 16, 16]}
      />
      <Shape
        sceneFunc={(context, shape) => {
          context.beginPath();
          context.moveTo(6, 35);
          context.lineTo(35, 35);
          context.lineTo(30, 30);
          context.lineTo(11, 30);
          context.lineTo(6, 35);
          context.closePath();
          context.fillStrokeShape(shape);
        }}
        fill={theme.palette.text.secondary}
        stroke={theme.palette.background.default}
        strokeWidth={0.5}
      />
    </Group>
  );
};

const BackPart = ({
  x = 200,
  y = 175,
  width = 300,
  height = 200,
  rotate = false,
}) => {
  const theme = useTheme();
  return (
    <Group x={x} y={y} rotation={rotate ? 90 : 0}>
      <Rect
        x={0}
        y={0}
        strokeWidth={5}
        fill={theme.palette.text.secondary}
        width={width}
        height={height} // Approximate height
        cornerRadius={4}
      />
      <Text
        x={0}
        y={0}
        text={"Parte trasera "}
        fontSize={12}
        fontFamily="Nebulas"
        fill={theme.palette.background.default}
        width={width}
        align="center"
        height={height}
        padding={5}
      />
    </Group>
  );
};

export default BusMap;
