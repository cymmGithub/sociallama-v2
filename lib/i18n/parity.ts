/**
 * Translation-parity helper (design D2).
 *
 * A Polish content module typed with `as const` locks every string to its
 * literal value, so `enModule satisfies typeof plModule` would reject any real
 * translation. `Localized<typeof plExport>` widens each string/number/boolean
 * literal back to its base type — translations compile — while keeping every
 * key required, so a missing or mis-shaped field still fails the build. Readonly
 * array shapes are preserved so `as const` Polish modules assign cleanly.
 */
export type Localized<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? readonly Localized<U>[]
        : T extends object
          ? { [K in keyof T]: Localized<T[K]> }
          : T
