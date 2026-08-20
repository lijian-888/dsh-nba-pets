import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import type {
  HostObservable,
  InjectFace,
  PropsRuntime,
} from '@deepseek-ai/dsh-client-ui-slots'
import type {
  SessionId,
  SessionListState,
  SessionSummary,
} from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import { PET_ASSETS } from './assets.generated.js'
import type { PetActivitySnapshot } from './activity.js'
import {
  ANIMATIONS,
  ATLAS_COLUMNS,
  ATLAS_ROWS,
  backgroundPosition,
  lookCell,
  pointerDirectionIndex,
  type AnimationName,
} from './sprite.js'
import { PET_STYLES } from './styles.js'

type PetId = keyof typeof PET_ASSETS
type StatusKind = 'needs-input' | 'blocked' | 'ready' | 'running' | 'idle'

interface PersistedPreferences {
  petId: PetId
  hidden: boolean
  x: number
  y: number
}

interface ActivityItem {
  id: SessionId
  title: string
  updatedAt: number
  kind: StatusKind
  label: string
  color: string
}

interface PetStatus {
  kind: StatusKind
  label: string
  color: string
  target?: SessionId
}

export interface PetOverlayInjected {
  hooks: {
    activity: HostObservable<PetActivitySnapshot>
  }
  openSession: (sessionId: SessionId) => void
}

export type PetOverlayProps = PropsRuntime<'shell.overlay'> & InjectFace<PetOverlayInjected>

const STORAGE_KEY = 'dsh.nba-pets.v1'
const DEFAULT_PREFERENCES: PersistedPreferences = {
  petId: 'curry', hidden: false, x: 0.82, y: 0.68,
}

const CHARACTERS: ReadonlyArray<{ id: PetId; name: string; meta: string }> = [
  { id: 'curry', name: 'Curry 30', meta: '三分射手形象' },
  { id: 'king23', name: 'King 23', meta: 'LeBron 致敬形象' },
]

const STATUS_COPY: Record<StatusKind, { label: string; color: string }> = {
  'needs-input': { label: '需要你的输入', color: '#f59e0b' },
  blocked: { label: '任务受阻', color: '#ef4444' },
  ready: { label: '任务已就绪', color: '#22c55e' },
  running: { label: '任务执行中', color: '#38bdf8' },
  idle: { label: '待机投篮', color: '#94a3b8' },
}

function loadPreferences(): PersistedPreferences {
  if (typeof localStorage === 'undefined') return DEFAULT_PREFERENCES
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<PersistedPreferences> | null
    if (parsed === null) return DEFAULT_PREFERENCES
    return {
      petId: parsed.petId === 'king23' ? 'king23' : 'curry',
      hidden: parsed.hidden === true,
      x: typeof parsed.x === 'number' ? Math.min(1, Math.max(0, parsed.x)) : DEFAULT_PREFERENCES.x,
      y: typeof parsed.y === 'number' ? Math.min(1, Math.max(0, parsed.y)) : DEFAULT_PREFERENCES.y,
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = (): void => { setReduced(query.matches) }
    sync()
    query.addEventListener('change', sync)
    return () => { query.removeEventListener('change', sync) }
  }, [])
  return reduced
}

function itemKind(
  summary: SessionSummary,
  errors: Readonly<Record<string, string>>,
): StatusKind {
  if (summary.pendingInteraction !== undefined) return 'needs-input'
  if (errors[summary.id] !== undefined) return 'blocked'
  if (summary.completed === true) return 'ready'
  if (summary.running) return 'running'
  return 'idle'
}

function deriveItems(
  sessions: SessionListState,
  errors: Readonly<Record<string, string>>,
): ActivityItem[] {
  return sessions.ids
    .map(id => sessions.byId[id])
    .filter((summary): summary is SessionSummary => summary !== undefined && !summary.blank)
    .map(summary => {
      const kind = itemKind(summary, errors)
      return {
        id: summary.id,
        title: summary.displayTitle,
        updatedAt: summary.updatedAt,
        kind,
        ...STATUS_COPY[kind],
      }
    })
    .sort((left, right) => right.updatedAt - left.updatedAt)
}

function deriveStatus(items: ActivityItem[]): PetStatus {
  for (const kind of ['needs-input', 'blocked', 'ready', 'running'] as const) {
    const item = items.find(candidate => candidate.kind === kind)
    if (item !== undefined) return { kind, label: item.label, color: item.color, target: item.id }
  }
  return { kind: 'idle', ...STATUS_COPY.idle }
}

function animationForStatus(kind: StatusKind): AnimationName {
  if (kind === 'needs-input') return 'waiting'
  if (kind === 'blocked') return 'blocked'
  if (kind === 'ready') return 'review'
  if (kind === 'running') return 'running'
  return 'idle'
}

function clampPosition(ratio: number, viewport: number, size: number): number {
  return Math.round(Math.min(Math.max(8, ratio * Math.max(1, viewport - size)), Math.max(8, viewport - size - 8)))
}

export function PetOverlay({ useSessions, useActivity, openSession }: PetOverlayProps) {
  const sessions = useSessions(state => state)
  const activity = useActivity(state => state)
  const reducedMotion = useReducedMotion()
  const [preferences, setPreferences] = useState(loadPreferences)
  const [panelOpen, setPanelOpen] = useState(false)
  const [viewport, setViewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }))
  const [dragging, setDragging] = useState(false)
  const [dragDirection, setDragDirection] = useState<'running-left' | 'running-right'>('running-right')
  const [lookDirection, setLookDirection] = useState<number | null>(null)
  const [emote, setEmote] = useState<'waving' | 'jumping' | null>(null)
  const [frame, setFrame] = useState(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; left: number; top: number; moved: boolean } | null>(null)
  const lookTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previousStatus = useRef<StatusKind>('idle')

  const items = useMemo(() => deriveItems(sessions, activity.errors), [sessions, activity.errors])
  const status = useMemo(() => deriveStatus(items), [items])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)) } catch { /* non-fatal */ }
  }, [preferences])

  useEffect(() => {
    const resize = (): void => { setViewport({ width: window.innerWidth, height: window.innerHeight }) }
    window.addEventListener('resize', resize)
    return () => { window.removeEventListener('resize', resize) }
  }, [])

  useEffect(() => {
    const pointer = (event: PointerEvent): void => {
      if (dragRef.current !== null || status.kind !== 'idle' || panelOpen) return
      const rect = stageRef.current?.getBoundingClientRect()
      if (rect === undefined) return
      setLookDirection(pointerDirectionIndex(event.clientX - (rect.left + rect.width / 2), event.clientY - (rect.top + rect.height / 2)))
      if (lookTimer.current !== null) clearTimeout(lookTimer.current)
      lookTimer.current = setTimeout(() => { setLookDirection(null) }, 700)
    }
    window.addEventListener('pointermove', pointer, { passive: true })
    return () => {
      window.removeEventListener('pointermove', pointer)
      if (lookTimer.current !== null) clearTimeout(lookTimer.current)
    }
  }, [panelOpen, status.kind])

  useEffect(() => {
    if (status.kind === 'ready' && previousStatus.current !== 'ready') {
      setEmote('jumping')
      const timer = setTimeout(() => { setEmote(null) }, 760)
      previousStatus.current = status.kind
      return () => { clearTimeout(timer) }
    }
    previousStatus.current = status.kind
    return undefined
  }, [status.kind])

  let animationName: AnimationName = animationForStatus(status.kind)
  if (dragging) animationName = dragDirection
  else if (emote !== null) animationName = emote
  const animation = ANIMATIONS[animationName]
  const look = lookDirection === null || dragging || emote !== null || status.kind !== 'idle'
    ? null
    : lookCell(lookDirection)
  const activeFrames = look === null ? animation.frames : 1

  useEffect(() => {
    setFrame(0)
    if (reducedMotion || activeFrames <= 1) return undefined
    const timer = setInterval(() => { setFrame(value => (value + 1) % activeFrames) }, animation.intervalMs)
    return () => { clearInterval(timer) }
  }, [activeFrames, animation.intervalMs, animationName, reducedMotion])

  const column = reducedMotion ? 0 : look?.column ?? frame
  const row = look?.row ?? animation.row
  const left = clampPosition(preferences.x, viewport.width, 166)
  const top = clampPosition(preferences.y, viewport.height, 184)

  const spriteStyle: CSSProperties = {
    backgroundImage: `url("${PET_ASSETS[preferences.petId]}")`,
    backgroundPosition: backgroundPosition(column, row),
  }
  const rootStyle = { left, top, '--pet-status': status.color } as CSSProperties

  const beginDrag = (event: ReactPointerEvent<HTMLButtonElement>): void => {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, left, top, moved: false }
    setDragging(true)
  }

  const moveDrag = (event: ReactPointerEvent<HTMLButtonElement>): void => {
    const drag = dragRef.current
    if (drag === null || drag.pointerId !== event.pointerId) return
    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true
    if (Math.abs(dx) > 1) setDragDirection(dx < 0 ? 'running-left' : 'running-right')
    const nextLeft = Math.min(Math.max(8, drag.left + dx), Math.max(8, viewport.width - 174))
    const nextTop = Math.min(Math.max(8, drag.top + dy), Math.max(8, viewport.height - 192))
    setPreferences(current => ({
      ...current,
      x: nextLeft / Math.max(1, viewport.width - 166),
      y: nextTop / Math.max(1, viewport.height - 184),
    }))
  }

  const endDrag = (event: ReactPointerEvent<HTMLButtonElement>): void => {
    const drag = dragRef.current
    if (drag === null || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    setDragging(false)
    if (!drag.moved) {
      setPanelOpen(open => !open)
      if (status.target !== undefined) openSession(status.target)
    }
  }

  const chooseCharacter = (petId: PetId): void => {
    setPreferences(current => ({ ...current, petId }))
    setEmote('waving')
    setTimeout(() => { setEmote(null) }, 760)
  }

  if (preferences.hidden) {
    return <>
      <style>{PET_STYLES}</style>
      <button
        className="dshNbaPetsWake"
        type="button"
        onClick={() => { setPreferences(current => ({ ...current, hidden: false })) }}
      >🏀 唤醒 NBA 宠物</button>
    </>
  }

  return <>
    <style>{PET_STYLES}</style>
    <div ref={stageRef} className="dshNbaPetsRoot" style={rootStyle}>
      <div className="dshNbaPetsStage">
        <button
          className="dshNbaPetsPetButton"
          type="button"
          aria-label={`${CHARACTERS.find(item => item.id === preferences.petId)?.name ?? 'NBA 宠物'}：${status.label}。点击查看任务，拖动可移动。`}
          onPointerDown={beginDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <span className="dshNbaPetsSprite" style={spriteStyle} aria-hidden="true" />
          <span className="dshNbaPetsBadge"><span className="dshNbaPetsBadgeDot" />{status.label}</span>
        </button>
        <span className="dshNbaPetsSrOnly" role="status" aria-live="polite">{status.label}</span>

        {panelOpen && <section className="dshNbaPetsPanel" aria-label="NBA 宠物与任务状态">
          <header className="dshNbaPetsPanelHeader">
            <div><h2 className="dshNbaPetsPanelTitle">NBA Pets</h2><p className="dshNbaPetsPanelSub">切换形象，并查看所有 DSH 任务状态</p></div>
            <button className="dshNbaPetsClose" type="button" aria-label="关闭" onClick={() => { setPanelOpen(false) }}>×</button>
          </header>

          <div className="dshNbaPetsCharacters">
            {CHARACTERS.map(character => <button
              key={character.id}
              className="dshNbaPetsCharacter"
              type="button"
              aria-pressed={preferences.petId === character.id}
              onClick={() => { chooseCharacter(character.id) }}
            >
              <span className="dshNbaPetsThumb" style={{ backgroundImage: `url("${PET_ASSETS[character.id]}")` }} aria-hidden="true" />
              <span><span className="dshNbaPetsCharacterName">{character.name}</span><span className="dshNbaPetsCharacterMeta">{character.meta}</span></span>
            </button>)}
          </div>

          <h3 className="dshNbaPetsSectionTitle">任务动态</h3>
          {items.length === 0
            ? <div className="dshNbaPetsEmpty">暂无任务，宠物正在练习投篮</div>
            : <ul className="dshNbaPetsSessions">{items.map(item => <li key={item.id}><button
              className="dshNbaPetsSession"
              type="button"
              style={{ '--row-status': item.color } as CSSProperties}
              onClick={() => { openSession(item.id); setPanelOpen(false) }}
            ><span className="dshNbaPetsSessionDot" /><span className="dshNbaPetsSessionName">{item.title}</span><span className="dshNbaPetsSessionState">{item.label}</span></button></li>)}</ul>}

          <footer className="dshNbaPetsFooter">
            <span>状态优先级：需输入 → 受阻 → 就绪 → 执行中</span>
            <button className="dshNbaPetsTuck" type="button" onClick={() => {
              setPanelOpen(false)
              setPreferences(current => ({ ...current, hidden: true }))
            }}>收起宠物</button>
          </footer>
        </section>}
      </div>
    </div>
  </>
}

export const PET_ATLAS_METADATA = {
  columns: ATLAS_COLUMNS,
  rows: ATLAS_ROWS,
  spriteVersionNumber: 2,
} as const
