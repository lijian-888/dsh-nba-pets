export const ATLAS_COLUMNS = 8
export const ATLAS_ROWS = 11

export type AnimationName =
  | 'idle'
  | 'running-right'
  | 'running-left'
  | 'waving'
  | 'jumping'
  | 'blocked'
  | 'waiting'
  | 'running'
  | 'review'

export interface AnimationSpec {
  row: number
  frames: number
  intervalMs: number
}

export const ANIMATIONS: Record<AnimationName, AnimationSpec> = {
  idle: { row: 0, frames: 6, intervalMs: 220 },
  'running-right': { row: 1, frames: 8, intervalMs: 105 },
  'running-left': { row: 2, frames: 8, intervalMs: 105 },
  waving: { row: 3, frames: 4, intervalMs: 180 },
  jumping: { row: 4, frames: 5, intervalMs: 120 },
  blocked: { row: 5, frames: 8, intervalMs: 220 },
  waiting: { row: 6, frames: 6, intervalMs: 190 },
  running: { row: 7, frames: 6, intervalMs: 135 },
  review: { row: 8, frames: 6, intervalMs: 210 },
}

export function pointerDirectionIndex(dx: number, dy: number): number {
  const clockwiseFromUp = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360
  return Math.round(clockwiseFromUp / 22.5) % 16
}

export function lookCell(index: number): { row: number; column: number } {
  const normalized = ((index % 16) + 16) % 16
  return normalized < 8
    ? { row: 9, column: normalized }
    : { row: 10, column: normalized - 8 }
}

export function backgroundPosition(column: number, row: number): string {
  return `${column / (ATLAS_COLUMNS - 1) * 100}% ${row / (ATLAS_ROWS - 1) * 100}%`
}
