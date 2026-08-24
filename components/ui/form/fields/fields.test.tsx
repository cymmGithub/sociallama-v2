/**
 * Tests for the two fields added with the careers form (design D8).
 *
 * The behaviour worth pinning is not the markup — it is that `FileField`
 * REMOVES a file the browser check rejects. An oversized multipart body is
 * killed by the Next.js runtime before the server action is entered, with no
 * field to attribute the failure to (design D5), so "rejected" has to mean
 * "never sent", not "sent with a warning".
 *
 * Run with: bun test components/ui/form/fields/fields.test.tsx
 */

import { afterEach, describe, expect, test } from 'bun:test'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Form, SubmitButton } from '..'
import type { FormState } from '../types'
import { FileField, SelectField } from '.'

afterEach(cleanup)

const action = async (): Promise<FormState> => ({ status: 200, message: 'ok' })

const ACCEPT =
  '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const MAX_BYTES = 5 * 1024 * 1024

const ROLES = [
  { label: 'Social Media Specialist', value: 'social-media-specialist' },
  { label: 'Zgłoszenie spontaniczne', value: 'spontaniczna' },
] as const

function file(name: string, type: string, size: number): File {
  const blob = new File(['x'], name, { type })
  // Writing a 5 MB buffer per case is pointless — only `size` is read.
  Object.defineProperty(blob, 'size', { value: size })
  return blob
}

function renderFileField(required = false) {
  render(
    <Form action={action}>
      <FileField
        id="cv"
        label="Dodaj CV"
        attachedLabel="CV dodane"
        hint="PDF lub DOCX, do 5 MB"
        dropHint="Upuść plik tutaj"
        changeText="Zmień"
        removeText="Usuń"
        accept={ACCEPT}
        maxBytes={MAX_BYTES}
        sizeError="Plik jest za duży"
        typeError="CV musi być plikiem PDF lub DOCX"
        required={required}
      />
      <SubmitButton>Wyślij</SubmitButton>
    </Form>
  )
  return document.querySelector<HTMLInputElement>('input[type="file"]')
}

/** The drop target is the card — the label — not the clipped input. */
function dropZone(): HTMLLabelElement {
  const label = document.querySelector<HTMLLabelElement>('label[for="cv"]')
  if (!label) throw new Error('file label not rendered')
  return label
}

/**
 * Selecting a file, plus a spy on the one thing that proves the rejection took
 * effect. `fireEvent` installs `files` as an own property on the element, so
 * the real clear — `input.value = ''`, which in a browser empties `files` —
 * cannot be observed through `input.files` here. Watching the assignment
 * itself asserts the contract without depending on happy-dom emulating it.
 */
function pick(input: HTMLInputElement, picked: File) {
  const cleared: string[] = []
  Object.defineProperty(input, 'value', {
    configurable: true,
    get: () => '',
    set: (next: string) => cleared.push(next),
  })
  fireEvent.change(input, { target: { files: [picked] } })
  return { cleared }
}

describe('SelectField', () => {
  test('renders every option and submits under the field name', () => {
    render(
      <Form action={action}>
        <SelectField
          id="role"
          label="Stanowisko"
          options={ROLES}
          defaultValue={ROLES[0].value}
        />
      </Form>
    )

    const select = document.querySelector<HTMLSelectElement>('select')
    expect(select).not.toBeNull()
    expect(select?.name).toBe('role')
    expect(select?.value).toBe('social-media-specialist')
    expect(
      Array.from(select?.options ?? []).map((option) => option.value)
    ).toEqual(['social-media-specialist', 'spontaniczna'])
  })

  test('is labelled by its label element', () => {
    render(
      <Form action={action}>
        <SelectField id="role" label="Stanowisko" options={ROLES} />
      </Form>
    )

    expect(screen.getByLabelText('Stanowisko')).toBeTruthy()
  })
})

describe('FileField', () => {
  test('keeps an accepted file and shows its name', () => {
    const input = renderFileField()
    if (!input) throw new Error('file input not rendered')

    const { cleared } = pick(
      input,
      file('cv.pdf', 'application/pdf', 2 * 1024 * 1024)
    )

    expect(cleared).toEqual([])
    expect(screen.getByText('cv.pdf')).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  test('clears an oversized file and reports the size limit', () => {
    const input = renderFileField()
    if (!input) throw new Error('file input not rendered')

    const { cleared } = pick(
      input,
      file('cv.pdf', 'application/pdf', MAX_BYTES + 1)
    )

    expect(cleared).toEqual([''])
    expect(screen.getByRole('alert').textContent).toBe('Plik jest za duży')
    expect(screen.queryByText('cv.pdf')).toBeNull()
  })

  test('clears a disallowed type and reports it', () => {
    const input = renderFileField()
    if (!input) throw new Error('file input not rendered')

    const { cleared } = pick(
      input,
      file('cv.exe', 'application/x-msdownload', 1024)
    )

    expect(cleared).toEqual([''])
    expect(screen.getByRole('alert').textContent).toBe(
      'CV musi być plikiem PDF lub DOCX'
    )
  })

  test('accepts a DOCX by extension even when the browser sends no MIME type', () => {
    const input = renderFileField()
    if (!input) throw new Error('file input not rendered')

    const { cleared } = pick(input, file('cv.docx', '', 1024))

    expect(cleared).toEqual([])
    expect(screen.getByText('cv.docx')).toBeTruthy()
  })

  test('a required field blocks submit until a valid file is attached', () => {
    // The gate this asserts cannot come from the kit's registered-value path:
    // a file input's `value` is a fake path that survives clearing `files`, so
    // a rejected file would still read as "filled in". FileField drives
    // setFieldValidity instead.
    const input = renderFileField(true)
    if (!input) throw new Error('file input not rendered')
    const submit = screen.getByRole('button')

    fireEvent.click(submit)
    expect(screen.getByRole('alert').textContent).toBe('Invalid cv')

    // An oversized pick leaves the field empty, so the gate must stay shut.
    pick(input, file('cv.pdf', 'application/pdf', MAX_BYTES + 1))
    fireEvent.click(submit)
    expect(screen.getByRole('alert').textContent).toBe('Plik jest za duży')

    // A good file opens it.
    pick(input, file('cv.pdf', 'application/pdf', 1024))
    expect(screen.queryByRole('alert')).toBeNull()
  })

  test('an accepted file switches the card to its attached state', () => {
    const input = renderFileField()
    if (!input) throw new Error('file input not rendered')

    pick(input, file('cv.pdf', 'application/pdf', 188_416))

    expect(screen.getByText('CV dodane')).toBeTruthy()
    expect(screen.queryByText('Dodaj CV')).toBeNull()
    expect(screen.getByText('PDF · 184 KB')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Zmień' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Usuń' })).toBeTruthy()
  })

  test('remove clears the input and shuts the required gate again', () => {
    const input = renderFileField(true)
    if (!input) throw new Error('file input not rendered')
    const submit = screen.getByRole('button', { name: 'Wyślij' })

    const { cleared } = pick(input, file('cv.pdf', 'application/pdf', 1024))
    expect(screen.queryByRole('alert')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Usuń' }))

    expect(cleared).toEqual([''])
    expect(screen.getByText('Dodaj CV')).toBeTruthy()
    expect(screen.queryByText('cv.pdf')).toBeNull()
    fireEvent.click(submit)
    expect(screen.getByRole('alert').textContent).toBe('Invalid cv')
  })

  test('a dropped file goes through the same check as a picked one', () => {
    const input = renderFileField(true)
    if (!input) throw new Error('file input not rendered')
    const zone = dropZone()

    fireEvent.dragOver(zone)
    expect(screen.getByText('Upuść plik tutaj')).toBeTruthy()

    fireEvent.drop(zone, {
      dataTransfer: {
        files: [file('cv.pdf', 'application/pdf', MAX_BYTES + 1)],
      },
    })
    expect(screen.getByRole('alert').textContent).toBe('Plik jest za duży')
    expect(screen.queryByText('Upuść plik tutaj')).toBeNull()

    fireEvent.drop(zone, {
      dataTransfer: { files: [file('cv.docx', '', 2048)] },
    })
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByText('cv.docx')).toBeTruthy()
    expect(screen.getByText('DOCX · 2 KB')).toBeTruthy()
  })

  test('stays focusable — the control is clipped, not display:none', () => {
    const input = renderFileField()
    if (!input) throw new Error('file input not rendered')

    // Base UI's Field.Root tracks focus in state, so this is a React update.
    act(() => input.focus())
    expect(document.activeElement).toBe(input)
  })
})
