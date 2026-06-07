import { describe, it, expect } from 'vitest'
import {
  DEFAULT_FSRS_PARAMS,
  calculateFSRS,
  getNextIntervalString,
  toFSRSParams,
  type FSRSParams,
} from './fsrs'
import type { CardReview } from '@/domain/models/card-review'

const NEW_CARD_PARAMS: FSRSParams = {
  stability: 0,
  difficulty: 0.3,
  interval: 0,
  reps: 0,
  lapses: 0,
  state: 'new',
  due: new Date('2025-01-01').toISOString(),
}

function makeParams(overrides: Partial<FSRSParams> = {}): FSRSParams {
  return { ...NEW_CARD_PARAMS, ...overrides }
}

describe('DEFAULT_FSRS_PARAMS', () => {
  it('has default values for a new card', () => {
    expect(DEFAULT_FSRS_PARAMS.stability).toBe(0)
    expect(DEFAULT_FSRS_PARAMS.difficulty).toBe(0.3)
    expect(DEFAULT_FSRS_PARAMS.interval).toBe(0)
    expect(DEFAULT_FSRS_PARAMS.reps).toBe(0)
    expect(DEFAULT_FSRS_PARAMS.lapses).toBe(0)
    expect(DEFAULT_FSRS_PARAMS.state).toBe('new')
  })
})

describe('calculateFSRS', () => {
  const now = new Date('2025-01-15T12:00:00Z')

  describe('new card', () => {
    it('moves to review on "good"', () => {
      const result = calculateFSRS(NEW_CARD_PARAMS, 'good', now)
      expect(result.state).toBe('review')
      expect(result.reps).toBe(1)
      expect(result.stability).toBeGreaterThan(0)
    })

    it('moves to "graduated" on "easy"', () => {
      const result = calculateFSRS(NEW_CARD_PARAMS, 'easy', now)
      expect(result.state).toBe('graduated')
      expect(result.stability).toBeGreaterThan(0)
    })

    it('moves to "relearning" on "again"', () => {
      const result = calculateFSRS(NEW_CARD_PARAMS, 'again', now)
      expect(result.state).toBe('relearning')
      expect(result.lapses).toBe(1)
    })

    it('moves to learning on "hard"', () => {
      const result = calculateFSRS(NEW_CARD_PARAMS, 'hard', now)
      expect(result.state).toBe('learning')
    })
  })

  describe('difficulty updates', () => {
    it('increases difficulty on "again"', () => {
      const result = calculateFSRS(NEW_CARD_PARAMS, 'again', now)
      expect(result.difficulty).toBe(0.5)
    })

    it('increases difficulty on "hard"', () => {
      const result = calculateFSRS(NEW_CARD_PARAMS, 'hard', now)
      expect(result.difficulty).toBe(0.4)
    })

    it('decreases difficulty on "good"', () => {
      const result = calculateFSRS(NEW_CARD_PARAMS, 'good', now)
      expect(result.difficulty).toBe(0.2)
    })

    it('decreases difficulty more on "easy"', () => {
      const result = calculateFSRS(NEW_CARD_PARAMS, 'easy', now)
      expect(result.difficulty).toBe(0.1)
    })

    it('clamps difficulty at 1.0', () => {
      const highDiff = makeParams({ difficulty: 0.9 })
      const result = calculateFSRS(highDiff, 'again', now)
      expect(result.difficulty).toBe(1.0)
    })

    it('clamps difficulty at 0', () => {
      const lowDiff = makeParams({ difficulty: 0.05 })
      const result = calculateFSRS(lowDiff, 'easy', now)
      expect(result.difficulty).toBe(0)
    })
  })

  describe('stability updates', () => {
    it('drops stability on "again" with minimum 0.1', () => {
      const card = makeParams({ stability: 1 })
      const result = calculateFSRS(card, 'again', now)
      expect(result.stability).toBe(0.3)
    })

    it('increases stability on "good"', () => {
      const card = makeParams({ stability: 1 })
      const result = calculateFSRS(card, 'good', now)
      expect(result.stability).toBeGreaterThan(1)
    })

    it('increases stability on "easy" with higher factor', () => {
      const card = makeParams({ stability: 1 })
      const goodResult = calculateFSRS(card, 'good', now)
      const easyResult = calculateFSRS(card, 'easy', now)
      expect(easyResult.stability).toBeGreaterThan(goodResult.stability)
    })
  })

  describe('interval calculation', () => {
    it('returns short interval (~10 min) on "again"', () => {
      const card = makeParams({ stability: 1 })
      const result = calculateFSRS(card, 'again', now)
      const diffMs = new Date(result.due).getTime() - now.getTime()
      expect(diffMs).toBe(10 * 60 * 1000)
    })

    it('returns at least 1 day on "good"', () => {
      const card = makeParams({ stability: 1 })
      const result = calculateFSRS(card, 'good', now)
      expect(result.interval).toBeGreaterThanOrEqual(1)
    })

    it('returns longer interval on "easy" vs "good"', () => {
      const card = makeParams({ stability: 2 })
      const good = calculateFSRS(card, 'good', now)
      const easy = calculateFSRS(card, 'easy', now)
      expect(easy.interval).toBeGreaterThan(good.interval)
    })
  })

  describe('lapses and reps', () => {
    it('increments reps on every review', () => {
      const result = calculateFSRS(NEW_CARD_PARAMS, 'good', now)
      expect(result.reps).toBe(1)
    })

    it('increments lapses only on "again"', () => {
      const good = calculateFSRS(NEW_CARD_PARAMS, 'good', now)
      expect(good.lapses).toBe(0)

      const again = calculateFSRS(NEW_CARD_PARAMS, 'again', now)
      expect(again.lapses).toBe(1)
    })
  })

  describe('retrievability effect', () => {
    it('gives higher stability increase when retrievability is lower', () => {
      const recentReview = makeParams({
        stability: 10,
        lastReview: new Date('2025-01-14T12:00:00Z').toISOString(),
      })
      const lateReview = makeParams({
        stability: 10,
        lastReview: new Date('2025-01-01T12:00:00Z').toISOString(),
      })
      const now = new Date('2025-01-15T12:00:00Z')

      const recent = calculateFSRS(recentReview, 'good', now)
      const late = calculateFSRS(lateReview, 'good', now)
      expect(late.stability).toBeGreaterThan(recent.stability)
    })
  })

  it('sets lastReview to now', () => {
    const result = calculateFSRS(NEW_CARD_PARAMS, 'good', now)
    expect(result.lastReview).toBe(now.toISOString())
  })
})

describe('getNextIntervalString', () => {
  const now = new Date('2025-01-15T12:00:00Z')

  it('returns minutes for "again"', () => {
    const str = getNextIntervalString(NEW_CARD_PARAMS, 'again', now)
    expect(str).toMatch(/^\d+ min$/)
  })

  it('returns days for "good" on a reviewed card', () => {
    const card = makeParams({ stability: 5, reps: 3, state: 'review' })
    const str = getNextIntervalString(card, 'good', now)
    expect(str).toMatch(/^\d+ day(s)?$/)
  })
})

describe('toFSRSParams', () => {
  it('converts a CardReview to FSRSParams', () => {
    const review: CardReview = {
      id: 'r1',
      cardId: 'c1',
      userId: 'u1',
      stability: 3.5,
      difficulty: 0.4,
      due: '2025-01-20T12:00:00Z',
      lastReview: '2025-01-15T12:00:00Z',
      interval: 5,
      reps: 3,
      lapses: 1,
      state: 'review',
      createdAt: '2025-01-10T12:00:00Z',
      updatedAt: '2025-01-15T12:00:00Z',
    }

    const params = toFSRSParams(review)

    expect(params).toEqual({
      stability: 3.5,
      difficulty: 0.4,
      interval: 5,
      reps: 3,
      lapses: 1,
      state: 'review',
      due: '2025-01-20T12:00:00Z',
      lastReview: '2025-01-15T12:00:00Z',
    })
  })
})
