"use client";

import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export type VehicleModelName = "hyundai" | "mercedes" | "volkswagen";

const vehicleConfig: Record<
  VehicleModelName,
  { scale: number; camera: [number, number, number] }
> = {
  hyundai: { scale: 1.22, camera: [0, 0.52, 5.4] },
  mercedes: { scale: 1.05, camera: [0, 0.52, 5.2] },
  volkswagen: { scale: 1.34, camera: [0, 0.52, 5.35] },
};

export default function VehicleModelPreview({
  model,
}: Readonly<{ model: VehicleModelName }>) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">(
    "loading",
  );

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    setStatus("loading");
    host.innerHTML = "";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const group = new THREE.Group();
    let frameId = 0;
    let disposed = false;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    scene.add(group);
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x7dd3fc, 1.2);
    fillLight.position.set(-5, 2, -3);
    scene.add(fillLight);

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const render = () => {
      frameId = window.requestAnimationFrame(render);
      const t = performance.now() / 1000;
      group.rotation.y = Math.sin(t * 0.35) * 0.25;
      group.position.y = Math.sin(t * 0.9) * 0.04;
      renderer.render(scene, camera);
    };

    resize();
    window.addEventListener("resize", resize);

    const config = vehicleConfig[model];
    camera.position.set(...config.camera);
    camera.lookAt(0, 0, 0);

    const loader = new GLTFLoader();
    loader.load(
      `/assets/models/${model}.glb`,
      (gltf) => {
        if (disposed) return;
        const object = gltf.scene;
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxAxis = Math.max(size.x, size.y, size.z) || 1;

        object.position.sub(center);
        object.scale.setScalar((3.45 / maxAxis) * config.scale);
        group.add(object);
        setStatus("ready");
        render();
      },
      undefined,
      () => {
        if (!disposed) setStatus("error");
      },
    );

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      host.innerHTML = "";
    };
  }, [model]);

  return (
    <Box
      sx={{
        position: "relative",
        height: 122,
        borderRadius: "8px",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 58%, rgba(125,211,252,0.20), transparent 42%), linear-gradient(135deg, rgba(15,23,42,0.96), rgba(31,97,141,0.88))",
        border: "1px solid rgba(255,255,255,0.16)",
      }}
    >
      <Box ref={hostRef} sx={{ width: "100%", height: "100%" }} />
      {status !== "ready" && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "white",
            px: 2,
            textAlign: "center",
          }}
        >
          {status === "loading" ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              Modelo 3D no disponible
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
