import React from "react";
import {
  Environment,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import {
  useFrame,
  Canvas,
  useThree,
} from "@react-three/fiber";
import Modelo3DName from "../types/Modelo3DName";
import { SkeletonUtils } from "three-stdlib";

type Props = {
  tipo: Modelo3DName;
  width?: number | string;
  cameraPosition?: [number, number, number];
  canRotate?: boolean;
  aspectRatio?: string;
};

const vehicleConfig = {
  volkswagen: {
    scale: 1,
    fov: 65,
  },
  hyundai: {
    scale: 0.75,
    fov: 105,
  },
  mercedes: {
    scale: 0.65,
    fov: 75,
  },
};

function CameraUpdater({ fov }: { fov: number }) {
  const { camera } = useThree();

  React.useEffect(() => {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }, [camera, fov]);

  return null;
}

export default function Vehiculo3D({
  tipo,
  width,
  cameraPosition = [0, 0, -6],
  canRotate = false,
  aspectRatio = "16/9",
}: Readonly<Props>) {
  const calcWidth =
    typeof width === "number" ? `${width}px` : width;
  const fovMemo = React.useMemo(
    () => vehicleConfig[tipo].fov,
    [tipo],
  );
  return (
    <Canvas
      camera={{
        position: cameraPosition,
        fov: fovMemo,
      }}
      style={{
        width: width ? `${calcWidth}` : "100%",
        aspectRatio,
        overflow: "hidden",
      }}
    >
      <CameraUpdater fov={vehicleConfig[tipo].fov} />
      <Environment preset="warehouse" background={false} />

      <ambientLight intensity={0.3} />

      <directionalLight
        position={[5, 10, 5]}
        intensity={1.5}
      />

      <Model tipo={tipo} />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={canRotate}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}

const Model = ({
  tipo = "hyundai",
}: {
  tipo: Modelo3DName;
}) => {
  const { scene } = useGLTF(`/assets/models/${tipo}.glb`);
  const clonedScene = React.useMemo(
    () => SkeletonUtils.clone(scene),
    [scene],
  );
  const groupRef = React.useRef<THREE.Group>(null);

  const scaleMemo = React.useMemo(
    () => vehicleConfig[tipo].scale,
    [tipo],
  );

  React.useEffect(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = box.getCenter(new THREE.Vector3());

    clonedScene.position.sub(center);

    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const t = state.clock.elapsedTime;

    groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.15;
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.05;
  });

  return (
    <group ref={groupRef} scale={scaleMemo}>
      <primitive object={clonedScene} />
    </group>
  );
};
