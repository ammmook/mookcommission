"use client";

import { useEffect, useState } from "react";
import { AdminActionError } from "./AdminStatus";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, FormGrid, Input } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { supabaseBrowser } from "@/lib/supabase/client";
import { reportError } from "@/lib/supabase/errors";
import { getSiteSettings, updateSiteSettings } from "@/lib/supabase/settings";

/**
 * The `site_settings` single row.
 *
 * The email field the mockup showed has no column in the schema, so it is gone
 * rather than being faked — `studio_name` and `contact_handle` are what the
 * table stores.
 */
export function SiteSettingsForm() {
  const [studioName, setStudioName] = useState("");
  const [contactHandle, setContactHandle] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const settings = await getSiteSettings(supabaseBrowser());
        if (cancelled) return;
        setStudioName(settings?.studioName ?? "");
        setContactHandle(settings?.contactHandle ?? "");
      } catch (loadError) {
        if (!cancelled) setError(reportError(loadError, "โหลดการตั้งค่าไม่สำเร็จ"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    if (!studioName.trim()) {
      setError("กรุณากรอกชื่อสตูดิโอ");
      return;
    }
    setPending(true);
    setError(null);
    const progress = toast.saving();
    try {
      await updateSiteSettings(supabaseBrowser(), { studioName, contactHandle });
      setSaved(true);
      progress.success();
      window.setTimeout(() => setSaved(false), 2200);
    } catch (saveError) {
      const message = reportError(saveError, "บันทึกการตั้งค่าไม่สำเร็จ");
      setError(message);
      progress.error(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <Card>
      <CardHeader title="ข้อมูลสตูดิโอ" />
      {loading ? (
        <div className="flex flex-col gap-3.5">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" still />
        </div>
      ) : (
        <>
          <FormGrid>
            <Field label="ชื่อสตูดิโอ" htmlFor="studio-name">
              <Input
                id="studio-name"
                value={studioName}
                onChange={(event) => setStudioName(event.target.value)}
              />
            </Field>
            <Field label="บัญชีติดต่อ" htmlFor="studio-contact">
              <Input
                id="studio-contact"
                mono
                value={contactHandle}
                onChange={(event) => setContactHandle(event.target.value)}
              />
            </Field>
          </FormGrid>

          <Button
            className="mt-4"
            variant="dark"
            onClick={save}
            disabled={pending}
          >
            {saved ? "บันทึกแล้ว ✓" : pending ? "กำลังบันทึก…" : "บันทึก"}
          </Button>
        </>
      )}
      <AdminActionError message={error} />
    </Card>
  );
}
