import { useEffect, useMemo, useState } from "react";

export type UserSettings = {
  displayName: string;
  age: number | null;
  timeFormat24: boolean;
  browserNotificationsEnabled: boolean;
  skalmanModeEnabled: boolean;
};

type SettingsPageProps = {
  settings: UserSettings;
  onSave: (next: UserSettings) => Promise<void> | void;
  busy?: boolean;
};

const surfaceClass =
  "rounded-[2rem] border border-slate-700 bg-slate-900 p-5 shadow-xl";

export default function SettingsPage({ settings, onSave, busy }: SettingsPageProps) {
  const [draft, setDraft] = useState<UserSettings>(settings);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);
  const [notifBusy, setNotifBusy] = useState(false);

  useEffect(() => {
    setDraft(settings);
    setSaveError(null);
    setSavedOk(false);
  }, [settings]);

  const canUseNotifications = useMemo(() => {
    return typeof window !== "undefined" && "Notification" in window;
  }, []);

  const permission: NotificationPermission | "unsupported" = canUseNotifications
    ? Notification.permission
    : "unsupported";

  const childFriendlyAuto = (draft.age != null && draft.age <= 8) || !draft.timeFormat24;
  const childFriendly = draft.skalmanModeEnabled || childFriendlyAuto;
  const pageToneClasses = childFriendly ? "border-[#14532d] bg-[#fff7d6]" : "";
  const saveButtonText = childFriendly ? "Spara och busa" : "Spara inställningar";
  const controlClass = childFriendly
    ? "w-full rounded-2xl border border-[#14532d] bg-[#ecfdf5] px-4 py-2 text-sm font-semibold text-[#14532d] outline-none transition focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/25"
    : "w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-white outline-none transition focus:border-fuchsia-300/40 focus:ring-2 focus:ring-fuchsia-300/25";
  const selectClass = controlClass;
  const notifCardClass = childFriendly
    ? "flex items-center justify-between gap-4 rounded-2xl border border-[#14532d] bg-[#ecfdf5] px-4 py-3"
    : "flex items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3";
  const primaryButtonClass = childFriendly
    ? "rounded-full border border-black bg-[#dc2626] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b91c1c] disabled:opacity-60 sm:w-fit"
    : "inline-flex w-full items-center justify-center rounded-full border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60 sm:w-fit";
  const secondaryButtonClass = childFriendly
    ? "rounded-full border border-black bg-[#b91c1c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#991b1b] disabled:opacity-60"
    : "rounded-full border border-slate-700 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60";

  const metaTextClass = childFriendly ? "text-[#14532d]/70" : "text-slate-400";
  const titleTextClass = childFriendly ? "text-[#14532d]" : "text-white";
  const helpTextClass = childFriendly ? "text-[#14532d]/80" : "text-slate-300";
  const labelTextClass = childFriendly ? "text-[#14532d]/80" : "text-slate-500";
  const notifTitleClass = childFriendly ? "text-[#14532d]" : "text-white";
  const notifHelpTextClass = childFriendly ? "text-[#14532d]/70" : "text-slate-300";
  const notifPermTextClass = childFriendly ? "text-[#14532d]/80" : "text-slate-400";
  const tipTextClass = childFriendly ? "text-[#14532d]/70" : "text-slate-500";

  async function handleToggleNotifications(nextEnabled: boolean) {
    setSaveError(null);
    if (!nextEnabled) {
      setDraft((curr) => ({ ...curr, browserNotificationsEnabled: false }));
      return;
    }

    if (!canUseNotifications) {
      setSaveError("Webbläsaren stödjer inte Notifikationer.");
      setDraft((curr) => ({ ...curr, browserNotificationsEnabled: false }));
      return;
    }

    setNotifBusy(true);
    try {
      if (Notification.permission !== "granted") {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          setDraft((curr) => ({ ...curr, browserNotificationsEnabled: false }));
          setSaveError("Tillstånd nekades. Slå på igen om du vill testa.");
          return;
        }
      }

      setDraft((curr) => ({ ...curr, browserNotificationsEnabled: true }));
      try {
        new Notification("MOSK", { body: "Push-notiser är på (test)." });
      } catch {
        // ignore
      }
    } finally {
      setNotifBusy(false);
    }
  }

  function handleTestNotification() {
    setSaveError(null);
    if (!canUseNotifications || Notification.permission !== "granted") {
      setSaveError("Kan inte testa just nu. Se till att tillstånd är `granted`.");
      return;
    }
    try {
      new Notification("MOSK", { body: "Testmeddelande från MOSK." });
    } catch {
      setSaveError("Testet misslyckades i den här webbläsaren.");
    }
  }

  async function handleSave() {
    setSaveError(null);
    setSavedOk(false);
    try {
      const next: UserSettings = {
        ...draft,
        displayName: draft.displayName.trim(),
        age:
          typeof draft.age === "number" && Number.isFinite(draft.age) ? draft.age : null,
        skalmanModeEnabled: draft.skalmanModeEnabled === true,
      };
      await onSave(next);
      setSavedOk(true);
      window.setTimeout(() => setSavedOk(false), 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Kunde inte spara inställningar";
      setSaveError(msg);
    }
  }

  return (
    <section className={`${surfaceClass} ${pageToneClasses}`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-xs uppercase tracking-[0.28em] ${metaTextClass}`}>Inställningar</p>
            <h2 className={`mt-2 text-2xl font-bold ${titleTextClass} sm:text-3xl`}>
              {childFriendly ? "Profil & lek" : "Profil & preferenser"}{" "}
              {childFriendly ? "🧒" : "✨"}
            </h2>
            <p
              className={`mt-2 max-w-2xl text-sm leading-relaxed ${helpTextClass} sm:text-base`}
            >
              Namn, ålder och klockformat sparas lokalt i webbläsaren (per användare).
              {childFriendly ? " Tips: AM/PM kan vara extra kul för små." : null}
            </p>
          </div>
          <div className={`text-right text-xs uppercase tracking-[0.22em] ${metaTextClass}`}>
            {childFriendly ? "Barnvänligt" : "Preferenser"}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <div className={`text-xs uppercase tracking-[0.2em] ${labelTextClass}`}>
              {childFriendly ? "Vad heter du?" : "Namn"}
            </div>
            <input
              className={controlClass}
              value={draft.displayName}
              placeholder="Ex: Alex"
              onChange={(ev) => setDraft((curr) => ({ ...curr, displayName: ev.target.value }))}
              disabled={busy}
            />
          </label>

          <label className="space-y-2">
            <div className={`text-xs uppercase tracking-[0.2em] ${labelTextClass}`}>
              {childFriendly ? "Hur gammal är du?" : "Ålder"}
            </div>
            <input
              className={controlClass}
              type="number"
              min={0}
              step={1}
              value={draft.age ?? ""}
              placeholder="Valfritt"
              onChange={(ev) => {
                const raw = ev.target.value;
                setDraft((curr) => ({
                  ...curr,
                  age: raw.trim() === "" ? null : Number.parseInt(raw, 10),
                }));
              }}
              disabled={busy}
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <div className={`text-xs uppercase tracking-[0.2em] ${labelTextClass}`}>Klockformat</div>
            <select
              className={selectClass}
              value={draft.timeFormat24 ? "24" : "12"}
              onChange={(ev) => {
                const next = ev.target.value === "24";
                setDraft((curr) => ({ ...curr, timeFormat24: next }));
              }}
              disabled={busy}
            >
              <option value="24">24 timmar</option>
              <option value="12">12 timmar (AM/PM)</option>
            </select>
          </label>

          <label className="space-y-2 md:col-span-2">
            <div className={`text-xs uppercase tracking-[0.2em] ${labelTextClass}`}>Skalman (barnläge)</div>
            <div className={controlClass}>
              <div className="flex items-center justify-between gap-4">
                <span>{draft.skalmanModeEnabled ? "På" : "Av"}</span>
                <input
                  type="checkbox"
                  checked={draft.skalmanModeEnabled}
                  onChange={(ev) =>
                    setDraft((curr) => ({ ...curr, skalmanModeEnabled: ev.target.checked }))
                  }
                  disabled={busy}
                  aria-label="Skalman barnläge"
                />
              </div>
            </div>
          </label>

          <div className="space-y-2 md:col-span-2">
            <div className={`text-xs uppercase tracking-[0.2em] ${labelTextClass}`}>
              {childFriendly ? "Notiser (pip!)" : "Browser-notiser"}
            </div>
            <label className={notifCardClass}>
              <div>
                <p className={`text-sm font-semibold ${notifTitleClass}`}>
                  Aktivera push-notiser
                </p>
                <p className={`text-xs leading-relaxed ${notifHelpTextClass}`}>
                  Kräver webbläsartillstånd. När det är på skickas en notis om ca 15 minuter innan
                  nästa hållpunkt (samma &quot;nästa&quot; som på klockan).
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`text-right text-xs ${notifPermTextClass}`}>
                  Tillstånd:{" "}
                  {permission === "unsupported"
                    ? "ej stöd"
                    : permission === "granted"
                      ? "granted"
                      : permission}
                </div>
                <input
                  type="checkbox"
                  checked={draft.browserNotificationsEnabled}
                  onChange={(ev) => void handleToggleNotifications(ev.target.checked)}
                  disabled={busy || notifBusy || permission === "unsupported"}
                  aria-label="Aktivera push-notiser"
                />
              </div>
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => handleTestNotification()}
                disabled={busy || notifBusy || permission !== "granted"}
              >
                Testa notis
              </button>
              <span className={`text-xs ${tipTextClass}`}>
                Tips: öppna sidan och tryck på test om du vill se att det funkar.
              </span>
            </div>
          </div>
        </div>

        {saveError ? (
          <div className="rounded-2xl border border-red-300/20 bg-red-500/10 p-3 text-sm text-red-100">
            {saveError}
          </div>
        ) : null}
        {savedOk ? (
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">
            Sparat.
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            className={primaryButtonClass}
            onClick={() => void handleSave()}
            disabled={busy}
          >
            {saveButtonText}
          </button>
        </div>
      </div>
    </section>
  );
}

