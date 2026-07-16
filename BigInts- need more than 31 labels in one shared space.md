# Plan: migrate label masks from 32‑bit int to BigInt (option #8)

**Status:** proposal — not yet decided. This document is the design/plan for *if* we choose to lift
the 31‑label ceiling by representing label values as `BigInt` instead of 32‑bit `Number`.

---

## 1. Motivation

Every remaining sharp edge in the label system — the 31‑label ceiling, bit‑position "shifting", the
overflow wraparound at bit 31/32 — exists only because a label value is packed into one **32‑bit
signed** JS `Number` (`1 << 31` goes negative, `1 << 32` wraps to `1`). The matching state is
**already** a `BigInt` (`_Bint_toggled`), so the design is *half* BigInt and internally
inconsistent: unbounded toggled mask, but labels capped at 31 usable bits.

Making label values `BigInt` end‑to‑end:

- removes the 31‑label ceiling entirely (a shared space can hold as many labels as you like);
- deletes the overflow/wraparound edge cases (`l_array` no longer silently corrupts past bit 30);
- makes merge/union trivially "just names → contiguous bits" with no ceiling guard;
- makes the two ends consistent (labels and toggled are both BigInt).

## 2. The decision gate (read this before implementing)

**This change is worth doing only if you need more than 31 labels in one shared space.** If 31 is
enough, the current `Number`‑based `wire`/`l_union` is simpler, needs no migration, and is marginally
the fastest option (see §3). So the gate is a single question:

> Do we ever expect a single wired label space to exceed **31** labels?

- **No** → do not do this. Keep the current implementation.
- **Yes** → this plan is the clean way to get there; the performance cost is ~1 ns per check that
  you will never notice (§3).

## 3. Performance is *not* the deciding factor (measured)

> Real numbers (and they corrected my over‑confident "wash or win" — I was wrong; let me own that).
> Note: my script's ns/op label is off by 1000× — the real figures are ~1–2 ns/op:
>
> | strategy | best-of-3 | per op |
> |---|---|---|
> | `int & int` (c) — capped at 31 | 218 ms | 1.09 ns |
> | TODAY: `BigInt(n) & big` (a) | 220 ms | 1.10 ns |
> | native BigInt (b / #8) | 365 ms | 1.82 ns |
>
> ### What this actually says
>
> Two things I got wrong and one that matters:
>
> 1. Today's `BigInt(n)` conversion is essentially free — 1.10 ns vs pure int's 1.09 ns. V8 has a
>    fast path for `BigInt(smallInt)`, so the conversion I thought you were "paying for" costs ~0. So
>    my "you're already paying the BigInt tax" was overstated.
> 2. Native BigInt came out slowest here (~1.82 ns), not faster — the opposite of my "slight win"
>    claim. So #8 would be a small regression on this check, not a win. Caveat: part of that is
>    harness artifact — I sourced the BigInt operand from a boxed‑BigInt array, whereas the real
>    proxy returns a cached BigInt via a property read, which would narrow the gap. But it's clearly
>    not faster.
> 3. All three are 1–2 ns/op. That's the real headline. The spread between fastest and slowest is
>    ~0.7 ns per check. A single log call that does fire spends orders of magnitude more in
>    `argsFn()` + the handler; even one that doesn't fire is dominated by the surrounding JS, not the
>    `&`.
>
> ### So, honestly
>
> Performance is not the axis to decide #8 on. Your original instinct (int&int is fastest) is
> technically true — it won by ~0.7 ns — but the current code already isn't using it, and the
> absolute cost is noise. Going BigInt‑native would cost you sub‑nanosecond per check in dev and
> nothing in prod.
>
> The real decision for #8 is the surface change, not speed:
> - `l_.X` becomes a BigInt publicly (`4n` in logs, `|` still works).
> - The `l_*` helpers need BigInt arithmetic to actually lift the 31‑label ceiling.
>
> So the question to ask isn't "can I afford the cycles" (you can, trivially) — it's "do I ever need
> more than 31 labels in one shared space?" If no, stay as‑is; the 31‑cap `wire`/`l_union` you have
> is the fastest option anyway. If yes, #8 is the clean way, and the perf cost is ~1 ns you'll never
> notice.

## 4. Representation decision

- **Internal + output: `BigInt`.** Label tables store BigInt values; the `l` proxy returns BigInt;
  `_Bint_toggled` stays BigInt.
- **Input: lenient — accept `number | bigint`, coerce to BigInt at the boundary.** This keeps
  existing call sites that write `{ CXNS: 0b1 << 2 }` and `l_assert(tbl, { A: 0b1 << 0 })` working
  without a mass edit of every consumer. A single helper normalizes:

  ```js
  const isLabelValue_ = (v) =>
      typeof v === 'bigint' ||
      (typeof v === 'number' && Number.isInteger(v) && Number.isFinite(v));
  const toBig_ = (v) => (typeof v === 'bigint' ? v : BigInt(v));
  ```

- **Bit‑length replaces `Math.log2`** (which is Number‑only). For a positive BigInt `v`, the highest
  set bit index is `v.toString(2).length - 1`, and the next power of two is
  `1n << BigInt(v.toString(2).length)`.

## 5. Detailed change list (`src/logr.ts`)

All arithmetic on label values moves to BigInt; all validation switches from
`typeof v === 'number' && Number.isFinite(v)` to `isLabelValue_(v)` (then coerce with `toBig_`).

- **`l_length_`** — coerce values; `max <= 0n → 1n`; else `return 1n << BigInt(max.toString(2).length)`.
- **`l_array_`** — `start = toBig_(start ?? 1n)`; `acc[key] = start << BigInt(index)`. **Remove the
  implicit 31/32‑bit overflow behavior** — there is no ceiling now.
- **`l_concat_`** — `next_pos`/`min_arg` become BigInt; the shift becomes a bit‑length difference
  (`bitlen(next_pos) - bitlen(min_arg)`) instead of `Math.log2(next_pos / min_arg)`;
  `value << BigInt(shift)`.
- **`l_merge_`** — `value_highest` via BigInt max; `next_shift` seeded from `bitlen(value_highest)`;
  collision bump `value_new = 1n << BigInt(next_shift++)`; the `Set` holds BigInt.
- **`l_union_`** — delegates to `l_array_`, so values become BigInt automatically. **Delete the
  `> 31` throw** — the ceiling is gone. (Keep the `__proto__`/`constructor` guard and the
  first‑appearance dedupe.)
- **`l_LL_` / `l_RR_`** — `toBig_(v) << BigInt(x)` / `>> BigInt(x)`; `x` stays a Number shift count
  (still validated as a non‑negative safe integer).
- **`l_assert_`** — coerce both `actual` and `required` values via `toBig_`; the `Set<number>`
  becomes `Set<bigint>`; equality is BigInt `===`. (Because inputs are coerced, a Number pin like
  `{ A: 0b1 << 0 }` still validates a BigInt table.)
- **`l_toBigInt_`** — `bigint_l |= toBig_(obj_labels[k])` (drop the `BigInt(...)` re‑wrap; it already
  is / will be BigInt).
- **`create_Referenced_l_` (the `l` proxy)** — return the BigInt value; **unknown key returns `0n`**
  (was `0`). This is the visible public change: `l_.X` is now a BigInt.
- **`_log_fxn`** — drop the per‑call conversion: `if ((toBig_(nr_logged) & _Bint_toggled) === 0n)
  return;` (accept `number | bigint` for `nr_logged` so a stray Number still works, but in normal use
  `l_.A | l_.B` is already BigInt).
- **`create` / `toggle` / `wire`** — no structural change; they inherit BigInt through the helpers.
  `wire`'s `_arr_members` composition is unaffected.

## 6. Backward compatibility

- **Inputs stay lenient** (§4), so existing consumer code that writes `0b1 << n` in `create`,
  `toggle`, and `wire` pins continues to work unchanged.
- **Outputs change type**: anything that *reads* `l_.X` (or `logr_.lref.get()` values) now gets a
  BigInt. Consumers that printed `l_.CXNS` will see `4n`; consumers doing Number math on a label
  value (rare) must switch to BigInt. `l_.A | l_.B` in `log()` calls is unaffected (`|` works on
  BigInt).
- This is a **breaking change to the public value type** → **major version bump (`4.0.0`)**.

## 7. Test migration (the bulk of the work)

The existing suite (`spec/logr.spec.mjs`, 93 specs) asserts Number values throughout
(`expect(l_.DEL).toBe(1)`, `toEqual({ DEL: 0b1 << 0 })`). Once outputs are BigInt these fail
(`1n !== 1`). Plan:

- Mechanical pass converting expected label values to BigInt literals: `toBe(1n)`,
  `toEqual({ DEL: 1n, ... })`, etc. Keep *input* literals as `0b1 << n` where they're inputs (they
  coerce), convert them only where they're *expected outputs*.
- **Repurpose the "bit Label Limits" block** (currently asserts 31‑bit overflow/wraparound): those
  tests encode the *old* ceiling behavior and must be rewritten to assert the **new** behavior —
  e.g. 32, 40, 100 labels all get distinct, monotonically increasing BigInt bits with **no**
  wraparound, and `l_union` of >31 names **no longer throws**.
- Add specs: labels past bit 30 (`1n << 31n`, `1n << 40n`) are positive and distinct; `toggle`/log
  fire correctly on a label above bit 31 (the thing that was impossible before).
- The `performance;` NOP spec is unaffected (it runs disabled).

## 8. Docs

- `README.md`: note label values are `BigInt` (`l_.X → 4n`), update the "Limitations" section
  (remove "32‑Bit Limit: up to 31 labels"), and adjust any example output showing numeric bits.
- `dist/logr.d.ts` regenerates from the typed source; ensure the label record type is
  `Record<string, bigint>` on output while inputs accept `Record<string, number | bigint>`.

## 9. Versioning

`3.x → 4.0.0` (breaking: public value type changes to BigInt).

## 10. Risks & open questions

- **Type ergonomics.** Do we want inputs lenient (`number | bigint`, §4) or force `bigint`
  everywhere for purity? Lenient minimizes consumer churn; strict is cleaner but breaks every
  `0b1 << n` literal. Recommendation: **lenient inputs, BigInt outputs.**
- **`l_assert` mixed types.** Coercion makes `l_assert(bigintTable, numberPin)` work; confirm no path
  compares a BigInt to a Number with `===` (always coerce first).
- **Serialization.** `JSON.stringify` cannot serialize BigInt (throws). Any code that does
  `JSON.stringify(logr_.lref.get())` (e.g. the `wire` pin‑mismatch error message, and possibly
  consumer debug logs) must convert BigInt → string first. **This is a real gotcha** — audit every
  `JSON.stringify` touching a label table (there is one in `wire`'s throw path).
- **`.d.ts` inference.** The `l` proxy's mapped type currently yields `number`; update to `bigint`.
- **Third‑party leaf packages.** A package that still emits Number label tables is fine — inputs are
  coerced. A package that reads `l_.X` as a Number would break, same as any consumer (§6).

## 11. Verification

- `npm run build` (rollup + tsc) clean; `dist/logr.d.ts` shows BigInt outputs.
- `npx jasmine` — full suite green after the test migration (§7).
- New coverage: a label above bit 31 toggles and logs correctly; `l_union` of 40+ names produces 40+
  distinct positive BigInt bits with no throw and no wraparound.
- Sanity: `JSON.stringify` audit passes (no unguarded BigInt serialization).
- Micro‑benchmark re‑run (optional) to confirm the ~1 ns/op delta from §3 in‑situ.

## 12. Scope estimate

- Core (`src/logr.ts`): moderate — every `l_*` helper touched, but the changes are mechanical
  (Number→BigInt arithmetic + `toBig_`/`isLabelValue_`), no new control flow. `wire`/`create`/
  `toggle` essentially unchanged.
- Tests: the largest chunk — a mechanical BigInt pass plus rewriting the "bit Label Limits" block
  and adding above‑31 coverage.
- Docs + version + `.d.ts`: small.
- The one non‑mechanical risk is the **`JSON.stringify`/BigInt** audit (§10).
