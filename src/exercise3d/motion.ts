/**
 * Exercise motion library for the procedural 3D guide.
 * Pure data + math (no rendering) — the mobile app carries an identical copy so the
 * clinician preview and the caregiver session animate exactly the same.
 *
 * Conventions: Y is up, the avatar faces +Z (the camera). Limbs hang along -Y from their
 * joint, so rotating a joint by θ about X moves the limb to (0, -cos θ, -sin θ):
 * negative X = limb swings forward, positive X on a knee = shin folds backward.
 */

export type Vec3 = [number, number, number];

export type Joint =
  | 'spine'
  | 'neck'
  | 'leftShoulder'
  | 'rightShoulder'
  | 'leftElbow'
  | 'rightElbow'
  | 'leftHip'
  | 'rightHip'
  | 'leftKnee'
  | 'rightKnee';

export interface Pose {
  joints: Partial<Record<Joint, Vec3>>;
  /** Vertical offset of the hips (negative = lower, e.g. seated). */
  rootY?: number;
  /** Whole-body lean/sway about Z (radians). */
  rootTilt?: number;
}

export interface Keyframe {
  t: number;
  pose: Pose;
}

export interface MotionDefinition {
  key: string;
  label: string;
  /** Seconds per repetition. */
  repDuration: number;
  seated: boolean;
  keyframes: Keyframe[];
  /** Coaching cues shown in sync with the rep phase. */
  cues: { from: number; to: number; text: string }[];
}

const HALF_PI = Math.PI / 2;

const SEATED: Pose = {
  rootY: -0.42,
  joints: {
    leftHip: [-HALF_PI, 0, 0],
    rightHip: [-HALF_PI, 0, 0],
    leftKnee: [HALF_PI, 0, 0],
    rightKnee: [HALF_PI, 0, 0],
    leftShoulder: [0, 0, 0.12],
    rightShoulder: [0, 0, -0.12],
    leftElbow: [-0.2, 0, 0],
    rightElbow: [-0.2, 0, 0],
  },
};

const withJoints = (base: Pose, joints: Pose['joints']): Pose => ({
  ...base,
  joints: { ...base.joints, ...joints },
});

export const MOTIONS: Record<string, MotionDefinition> = {
  armRaise: {
    key: 'armRaise',
    label: 'Arm Raise',
    repDuration: 4,
    seated: false,
    keyframes: [
      { t: 0, pose: { joints: { leftShoulder: [0, 0, 0.08], rightShoulder: [0, 0, -0.08] } } },
      {
        t: 0.4,
        pose: {
          joints: {
            leftShoulder: [-2.95, 0, 0.1],
            rightShoulder: [-2.95, 0, -0.1],
            spine: [0.04, 0, 0],
          },
        },
      },
      {
        t: 0.6,
        pose: {
          joints: {
            leftShoulder: [-2.95, 0, 0.1],
            rightShoulder: [-2.95, 0, -0.1],
            spine: [0.04, 0, 0],
          },
        },
      },
      { t: 1, pose: { joints: { leftShoulder: [0, 0, 0.08], rightShoulder: [0, 0, -0.08] } } },
    ],
    cues: [
      { from: 0, to: 0.4, text: 'Raise both arms slowly' },
      { from: 0.4, to: 0.6, text: 'Hold at the top — keep breathing' },
      { from: 0.6, to: 1, text: 'Lower with control' },
    ],
  },
  legExtension: {
    key: 'legExtension',
    label: 'Leg Extension',
    repDuration: 5,
    seated: true,
    keyframes: [
      { t: 0, pose: SEATED },
      { t: 0.2, pose: withJoints(SEATED, { leftKnee: [0.05, 0, 0] }) },
      { t: 0.35, pose: withJoints(SEATED, { leftKnee: [0.05, 0, 0] }) },
      { t: 0.5, pose: SEATED },
      { t: 0.7, pose: withJoints(SEATED, { rightKnee: [0.05, 0, 0] }) },
      { t: 0.85, pose: withJoints(SEATED, { rightKnee: [0.05, 0, 0] }) },
      { t: 1, pose: SEATED },
    ],
    cues: [
      { from: 0, to: 0.2, text: 'Straighten the left knee' },
      { from: 0.2, to: 0.35, text: 'Hold for 3 seconds' },
      { from: 0.35, to: 0.5, text: 'Lower slowly' },
      { from: 0.5, to: 0.7, text: 'Now the right knee' },
      { from: 0.7, to: 0.85, text: 'Hold — back against the chair' },
      { from: 0.85, to: 1, text: 'Lower slowly' },
    ],
  },
  balance: {
    key: 'balance',
    label: 'Balance Exercise',
    repDuration: 6,
    seated: false,
    keyframes: [
      { t: 0, pose: { joints: { leftShoulder: [0, 0, 0.1], rightShoulder: [0, 0, -0.1] } } },
      {
        t: 0.15,
        pose: { joints: { leftShoulder: [0, 0, 1.5], rightShoulder: [0, 0, -1.5] } },
      },
      {
        t: 0.3,
        pose: {
          rootTilt: 0.03,
          joints: {
            leftShoulder: [0, 0, 1.5],
            rightShoulder: [0, 0, -1.5],
            rightHip: [-0.35, 0, 0],
            rightKnee: [1.25, 0, 0],
          },
        },
      },
      {
        t: 0.45,
        pose: {
          rootTilt: -0.02,
          joints: {
            leftShoulder: [0, 0, 1.45],
            rightShoulder: [0, 0, -1.55],
            rightHip: [-0.35, 0, 0],
            rightKnee: [1.25, 0, 0],
          },
        },
      },
      { t: 0.55, pose: { joints: { leftShoulder: [0, 0, 1.5], rightShoulder: [0, 0, -1.5] } } },
      {
        t: 0.7,
        pose: {
          rootTilt: -0.03,
          joints: {
            leftShoulder: [0, 0, 1.5],
            rightShoulder: [0, 0, -1.5],
            leftHip: [-0.35, 0, 0],
            leftKnee: [1.25, 0, 0],
          },
        },
      },
      {
        t: 0.85,
        pose: {
          rootTilt: 0.02,
          joints: {
            leftShoulder: [0, 0, 1.55],
            rightShoulder: [0, 0, -1.45],
            leftHip: [-0.35, 0, 0],
            leftKnee: [1.25, 0, 0],
          },
        },
      },
      { t: 1, pose: { joints: { leftShoulder: [0, 0, 0.1], rightShoulder: [0, 0, -0.1] } } },
    ],
    cues: [
      { from: 0, to: 0.15, text: 'Arms out like airplane wings' },
      { from: 0.15, to: 0.5, text: 'Lift the right foot — hold steady' },
      { from: 0.5, to: 0.55, text: 'Switch legs' },
      { from: 0.55, to: 1, text: 'Lift the left foot — eyes forward' },
    ],
  },
};

export const hasMotion = (key: string | null | undefined): key is keyof typeof MOTIONS =>
  Boolean(key && key in MOTIONS);

const smooth = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const JOINTS: Joint[] = [
  'spine',
  'neck',
  'leftShoulder',
  'rightShoulder',
  'leftElbow',
  'rightElbow',
  'leftHip',
  'rightHip',
  'leftKnee',
  'rightKnee',
];

export interface SampledPose {
  joints: Record<Joint, Vec3>;
  rootY: number;
  rootTilt: number;
}

/** Samples a motion at a phase in [0, 1) with smoothstep easing between keyframes. */
export function samplePose(motion: MotionDefinition, phase: number): SampledPose {
  const frames = motion.keyframes;
  let i = frames.findIndex((f) => f.t > phase);
  if (i <= 0) i = frames.length - 1;
  const a = frames[i - 1] ?? frames[0];
  const b = frames[i];
  const span = b.t - a.t || 1;
  const k = smooth(Math.min(1, Math.max(0, (phase - a.t) / span)));

  const joints = {} as Record<Joint, Vec3>;
  for (const joint of JOINTS) {
    const ja = a.pose.joints[joint] ?? [0, 0, 0];
    const jb = b.pose.joints[joint] ?? [0, 0, 0];
    joints[joint] = [lerp(ja[0], jb[0], k), lerp(ja[1], jb[1], k), lerp(ja[2], jb[2], k)];
  }
  return {
    joints,
    rootY: lerp(a.pose.rootY ?? 0, b.pose.rootY ?? 0, k),
    rootTilt: lerp(a.pose.rootTilt ?? 0, b.pose.rootTilt ?? 0, k),
  };
}

export function cueAt(motion: MotionDefinition, phase: number): string {
  return motion.cues.find((c) => phase >= c.from && phase < c.to)?.text ?? motion.cues[0].text;
}
