import { useFrame } from '@react-three/fiber/native';
import { type RefObject, useRef } from 'react';
import type { Group } from 'three';
import { type Joint, type MotionDefinition, samplePose } from './motion';

/*
 * Mobile copy of the clinician web avatar (frontend/src/components/exercise3d) — keep in sync.
 * Only the react-three-fiber import differs.
 */

const COLORS = {
  skin: '#f1c29c',
  hair: '#3b2a20',
  shirt: '#0e7c86',
  shorts: '#1e3a5f',
  shoe: '#ff7a59',
  chair: '#cbd5e1',
  eye: '#1f2937',
};

type GroupRef = RefObject<Group | null>;

interface ChildAvatarProps {
  motion: MotionDefinition;
  playing: boolean;
  /** Called every frame with the current rep phase (0–1) and completed rep count. */
  onFrame?: (phase: number, reps: number) => void;
  /** Shows glowing joint keypoints — a preview of future AI pose tracking. */
  showKeypoints?: boolean;
}

/** A small emissive marker at a joint origin (AI keypoint visual). */
function Keypoint({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <mesh>
      <sphereGeometry args={[0.035, 12, 12]} />
      <meshStandardMaterial color="#ff7a59" emissive="#ff7a59" emissiveIntensity={0.8} />
    </mesh>
  );
}

function Limb({ length, radius, color }: { length: number; radius: number; color: string }) {
  return (
    <mesh position={[0, -length / 2, 0]}>
      <capsuleGeometry args={[radius, length - radius * 2, 6, 16]} />
      <meshStandardMaterial color={color} roughness={0.65} />
    </mesh>
  );
}

function Arm({
  side,
  shoulder,
  elbow,
  keypoints,
}: {
  side: 1 | -1;
  shoulder: GroupRef;
  elbow: GroupRef;
  keypoints: boolean;
}) {
  return (
    <group ref={shoulder} position={[side * 0.24, 0.36, 0]}>
      <Keypoint visible={keypoints} />
      <Limb length={0.3} radius={0.065} color={COLORS.shirt} />
      <group ref={elbow} position={[0, -0.3, 0]}>
        <Keypoint visible={keypoints} />
        <Limb length={0.27} radius={0.055} color={COLORS.skin} />
        <mesh position={[0, -0.29, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={COLORS.skin} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

function Leg({
  side,
  hip,
  knee,
  keypoints,
}: {
  side: 1 | -1;
  hip: GroupRef;
  knee: GroupRef;
  keypoints: boolean;
}) {
  return (
    <group ref={hip} position={[side * 0.1, -0.02, 0]}>
      <Keypoint visible={keypoints} />
      <Limb length={0.42} radius={0.08} color={COLORS.shorts} />
      <group ref={knee} position={[0, -0.42, 0]}>
        <Keypoint visible={keypoints} />
        <Limb length={0.4} radius={0.065} color={COLORS.skin} />
        <mesh position={[0, -0.42, 0.05]}>
          <boxGeometry args={[0.13, 0.08, 0.22]} />
          <meshStandardMaterial color={COLORS.shoe} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

function Chair() {
  return (
    <group position={[0, 0, -0.12]}>
      <mesh position={[0, 0.56, -0.02]}>
        <boxGeometry args={[0.5, 0.06, 0.46]} />
        <meshStandardMaterial color={COLORS.chair} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.9, -0.24]}>
        <boxGeometry args={[0.5, 0.64, 0.05]} />
        <meshStandardMaterial color={COLORS.chair} roughness={0.8} />
      </mesh>
      {[-0.21, 0.21].flatMap((x) =>
        [-0.2, 0.16].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.27, z]}>
            <boxGeometry args={[0.04, 0.54, 0.04]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
        )),
      )}
    </group>
  );
}

function Head() {
  return (
    <>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 0.08, 12]} />
        <meshStandardMaterial color={COLORS.skin} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.16, 32, 32]} />
        <meshStandardMaterial color={COLORS.skin} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.25, -0.015]} rotation={[-0.25, 0, 0]}>
        <sphereGeometry args={[0.168, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={COLORS.hair} roughness={0.9} />
      </mesh>
      {[-0.055, 0.055].map((x) => (
        <mesh key={x} position={[x, 0.21, 0.145]}>
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshStandardMaterial color={COLORS.eye} />
        </mesh>
      ))}
      <mesh position={[0, 0.15, 0.15]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.035, 0.008, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>
    </>
  );
}

/** A friendly procedural child figure built from primitives and animated from motion keyframes. */
export function ChildAvatar({ motion, playing, onFrame, showKeypoints = false }: ChildAvatarProps) {
  const root = useRef<Group>(null);
  const spine = useRef<Group>(null);
  const neck = useRef<Group>(null);
  const leftShoulder = useRef<Group>(null);
  const rightShoulder = useRef<Group>(null);
  const leftElbow = useRef<Group>(null);
  const rightElbow = useRef<Group>(null);
  const leftHip = useRef<Group>(null);
  const rightHip = useRef<Group>(null);
  const leftKnee = useRef<Group>(null);
  const rightKnee = useRef<Group>(null);
  const clock = useRef(0);

  useFrame((_, delta) => {
    if (playing) clock.current += Math.min(delta, 0.1);
    const elapsed = clock.current / motion.repDuration;
    const phase = elapsed % 1;
    const pose = samplePose(motion, phase);

    if (root.current) {
      // Gentle breathing keeps the figure alive even when paused.
      const breathe = Math.sin(performance.now() / 700) * 0.006;
      root.current.position.y = 1.02 + pose.rootY + breathe;
      root.current.rotation.z = pose.rootTilt;
    }
    const joints: Record<Joint, GroupRef> = {
      spine,
      neck,
      leftShoulder,
      rightShoulder,
      leftElbow,
      rightElbow,
      leftHip,
      rightHip,
      leftKnee,
      rightKnee,
    };
    for (const joint of Object.keys(joints) as Joint[]) {
      const [x, y, z] = pose.joints[joint];
      joints[joint].current?.rotation.set(x, y, z);
    }
    onFrame?.(phase, Math.floor(elapsed));
  });

  return (
    <group>
      {motion.seated && <Chair />}

      <group ref={root} position={[0, 1.02, 0]}>
        {/* pelvis */}
        <mesh>
          <capsuleGeometry args={[0.13, 0.1, 6, 16]} />
          <meshStandardMaterial color={COLORS.shorts} roughness={0.7} />
        </mesh>
        <Leg side={1} hip={leftHip} knee={leftKnee} keypoints={showKeypoints} />
        <Leg side={-1} hip={rightHip} knee={rightKnee} keypoints={showKeypoints} />

        <group ref={spine} position={[0, 0.06, 0]}>
          {/* torso */}
          <mesh position={[0, 0.22, 0]}>
            <capsuleGeometry args={[0.17, 0.24, 8, 20]} />
            <meshStandardMaterial color={COLORS.shirt} roughness={0.6} />
          </mesh>
          <Arm side={1} shoulder={leftShoulder} elbow={leftElbow} keypoints={showKeypoints} />
          <Arm side={-1} shoulder={rightShoulder} elbow={rightElbow} keypoints={showKeypoints} />
          <group ref={neck} position={[0, 0.46, 0]}>
            <Head />
          </group>
        </group>
      </group>

      {/* soft contact shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[0.55, 48]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}
