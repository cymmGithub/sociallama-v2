'use client'

import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { useState } from 'react'
import { Link } from '@/components/ui/link'
import { Switch } from '@/components/ui/switch'
import { useConsentStore } from '@/lib/consent/store'
import type { ConsentCategory, LocalizedConsent } from '@/lib/content/consent'
import s from './consent.module.css'

interface SettingsCopy {
  settings: LocalizedConsent['consentSettings']
  categories: LocalizedConsent['consentCategories']
}

/**
 * The settings panel — both the granular-choice surface and the withdrawal
 * mechanism the footer trigger opens.
 *
 * A `@base-ui/react` Dialog rather than a hand-rolled overlay: focus trapping,
 * escape handling and `aria-modal` come with it. Unlike the banner, this one IS
 * modal — it was opened deliberately, and there is a close control, because
 * closing a settings panel is not an ambiguous non-answer the way dismissing a
 * consent prompt would be.
 */
export function ConsentSettings({ copy }: { copy: SettingsCopy }) {
  const settingsOpen = useConsentStore((state) => state.settingsOpen)
  const closeSettings = useConsentStore((state) => state.closeSettings)

  return (
    <Dialog.Root
      open={settingsOpen}
      onOpenChange={(open) => {
        if (!open) closeSettings()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className={s.backdrop} />
        <Dialog.Popup className={s.popup}>
          {/* Keyed on open state so the draft toggles are re-seeded from the
              store every time the panel opens. A visitor who changes a switch,
              closes without saving, and reopens must see what is actually
              stored — not their abandoned edit. */}
          <SettingsBody key={String(settingsOpen)} copy={copy} />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function SettingsBody({ copy }: { copy: SettingsCopy }) {
  const storedAnalytics = useConsentStore((state) => state.analytics)
  const save = useConsentStore((state) => state.save)
  const closeSettings = useConsentStore((state) => state.closeSettings)

  // Draft state. Nothing is persisted until "save" — a switch that wrote
  // through on toggle would make the save button a lie.
  const [analytics, setAnalytics] = useState(storedAnalytics)

  return (
    <>
      <div className={s.panelHead}>
        <Dialog.Title className={s.title}>{copy.settings.title}</Dialog.Title>
        <button
          type="button"
          className={s.close}
          onClick={closeSettings}
          aria-label={copy.settings.close}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <Dialog.Description className={s.intro}>
        {copy.settings.intro}
      </Dialog.Description>

      <div className={s.categories}>
        {copy.categories.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            copy={copy.settings}
            checked={analytics}
            onCheckedChange={setAnalytics}
          />
        ))}
      </div>

      <div className={s.panelActions}>
        <button
          type="button"
          className={s.save}
          onClick={() => save({ analytics })}
        >
          {copy.settings.save}
        </button>
      </div>
    </>
  )
}

/**
 * One category.
 *
 * `required` decides the row's shape: a statement for necessary, a switch for
 * everything else. Analytics is the only optional category today, so the switch
 * binds to it directly rather than through an id lookup — adding a second one
 * is the moment to introduce id-keyed binding, and that change is already
 * gated behind a `CONSENT_VERSION` bump (see `lib/consent/cookie.ts`).
 */
function CategoryRow({
  category,
  copy,
  checked,
  onCheckedChange,
}: {
  category: ConsentCategory
  copy: LocalizedConsent['consentSettings']
  checked: boolean
  onCheckedChange: (value: boolean) => void
}) {
  return (
    <section className={s.category}>
      <div className={s.categoryHead}>
        <h3 className={s.categoryName}>{category.name}</h3>
        {category.required ? (
          <span className={s.alwaysOn}>{copy.alwaysOn}</span>
        ) : (
          <Switch
            checked={checked}
            onCheckedChange={onCheckedChange}
            aria-label={category.name}
          />
        )}
      </div>

      <p className={s.categoryPurpose}>{category.purpose}</p>

      <div className={s.vendors}>
        {category.vendors.map((vendor) => (
          <div key={vendor.name}>
            <p className={s.vendorName}>
              {vendor.name}{' '}
              <span className={s.vendorProvider}>({vendor.provider})</span>
            </p>
            <p className={s.vendorPurpose}>{vendor.purpose}</p>
            <div className={s.cookies}>
              {vendor.cookies.map((cookie) => (
                <p key={cookie.name} className={s.cookie}>
                  <span className={s.cookieName}>{cookie.name}</span> —{' '}
                  {cookie.purpose} ({cookie.retention})
                </p>
              ))}
            </div>
            <Link className={s.vendorPolicy} href={vendor.privacyHref}>
              {copy.vendorPolicy}
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
