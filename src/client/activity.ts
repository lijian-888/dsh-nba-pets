import {
  createSnapshotStore,
  type ISessions,
  type ObservableSnapshot,
  type SessionId,
} from '@deepseek-ai/dsh-client-runtime/client'

export interface PetActivitySnapshot {
  /** Latest agent-level failures, keyed by session id. */
  errors: Readonly<Record<string, string>>
}

export interface PetActivitySource extends ObservableSnapshot<PetActivitySnapshot> {
  start(): () => void
}

/** Observe the error bit that is intentionally absent from the coarse session list. */
export function createPetActivitySource(sessions: ISessions): PetActivitySource {
  const store = createSnapshotStore<PetActivitySnapshot>({ errors: {} })
  const failures = new Map<string, string>()
  const sessionOff = new Map<string, () => void>()

  const publish = (): void => {
    store.set({ errors: Object.fromEntries(failures) })
  }

  const attach = (sessionId: SessionId): void => {
    if (sessionOff.has(sessionId)) return
    const face = sessions.binding(sessionId)?.session
    if (face === undefined) return
    const refresh = (): void => {
      const message = face.getSnapshot().lastAgentError
      if (message === null) failures.delete(sessionId)
      else failures.set(sessionId, message)
      publish()
    }
    sessionOff.set(sessionId, face.subscribe(refresh))
    refresh()
  }

  const sync = (): void => {
    const ids = sessions.list.getSnapshot().ids
    const alive = new Set<string>(ids)
    for (const id of ids) attach(id)
    for (const [id, off] of sessionOff) {
      if (alive.has(id)) continue
      off()
      sessionOff.delete(id)
      failures.delete(id)
    }
    publish()
  }

  return {
    getSnapshot: store.getSnapshot,
    subscribe: store.subscribe,
    start(): () => void {
      sync()
      const offList = sessions.list.subscribe(sync)
      return () => {
        offList()
        for (const off of sessionOff.values()) off()
        sessionOff.clear()
        failures.clear()
      }
    },
  }
}
