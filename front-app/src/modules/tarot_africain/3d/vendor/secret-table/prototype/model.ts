/** Types extracted from Secret Table `packages/scene/src/prototype/model.ts` (CC BY-NC-SA 4.0). */
import type { GripName } from '../hands/poses';
export type Look = { yaw: number; pitch: number };
export type Vec3 = readonly [number, number, number];
export type Transform = { position: Vec3; rotation: Vec3 };
export type HandPose = Transform & { grip: GripName; blend?: { to: GripName; t: number } };
export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, Number.isFinite(v) ? v : 0));
