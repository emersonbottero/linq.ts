import { assert, expect, test } from 'vitest'

import Enumerable from '../src/enumerable'

test('Range', () => {
  expect(
    Enumerable.Range(1, 10)
      .Select(x => x * x)
      .ToArray()
  ).toStrictEqual([1, 4, 9, 16, 25, 36, 49, 64, 81, 100])
})

test('Repeat', t => {
  const str = 'I like programming'
  const test = Enumerable.Repeat(str, 3)
  expect(test.ElementAt(0)).toBeTypeOf('string')
  expect(test.ElementAt(1)).toBeTypeOf('string')
  expect(test.ElementAt(2)).toBeTypeOf('string')
})
