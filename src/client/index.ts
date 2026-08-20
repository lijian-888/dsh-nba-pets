import type { ClientContext, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import { createPetActivitySource } from './activity.js'
import { PetOverlay, type PetOverlayInjected } from './PetOverlay.js'

/** Required client services and the layout owner that declares shell.overlay. */
export const inject = ['slots', 'sessions']

/** Register the persistent, draggable pet as an additive root overlay. */
export function apply(ctx: ClientContext): void {
  const activity = createPetActivitySource(ctx.sessions)
  ctx.effect(() => activity.start(), 'dsh-nba-pets: activity observer')
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'dsh-nba-pets',
    order: 90,
    inject: (): PetOverlayInjected => ({
      hooks: { activity },
      openSession: (sessionId: SessionId) => { ctx.sessions.open(sessionId) },
    }),
  }, PetOverlay))
}

export { PetOverlay, PET_ATLAS_METADATA } from './PetOverlay.js'
