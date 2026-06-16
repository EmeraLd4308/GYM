"use client";

import type { GlEquipment, GlSex } from "@prisma/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/shell/ToastProvider";
import { normalizeLogin } from "@/shared/lib/login-normalize";
import { normalizeAvatarId, type AvatarId } from "@/features/profile/lib/avatars";
import { ipfGlProfilePreview } from "@/features/profile/lib/ipf-gl";
import {
  parseOptFloat,
  profileNum,
  type ProfilePayload,
} from "@/features/profile/lib/profile-types";

export function useProfile() {
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarId, setAvatarId] = useState<AvatarId>(normalizeAvatarId(null));
  const [nickname, setNickname] = useState("");
  const [bw, setBw] = useState("");
  const [sq, setSq] = useState("");
  const [bp, setBp] = useState("");
  const [dl, setDl] = useState("");
  const [sex, setSex] = useState<GlSex>("MALE");
  const [equipment, setEquipment] = useState<GlEquipment>("CLASSIC");
  const [login, setLogin] = useState("");
  const [loginEdit, setLoginEdit] = useState("");

  const profileEditDetailsRef = useRef<HTMLDetailsElement>(null);

  const [profileLevel, setProfileLevel] = useState(1);
  const [glPointsState, setGlPointsState] = useState<number | null>(null);
  const [achCatalog, setAchCatalog] = useState<{ id: string; title: string; unlocked: boolean }[]>(
    [],
  );
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [pinSaving, setPinSaving] = useState(false);
  const [lbRefreshToken, setLbRefreshToken] = useState(0);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      const data = (await res.json()) as { error?: string; profile?: ProfilePayload };
      if (!res.ok) {
        toastError(data.error ?? "Не вдалося завантажити профіль.");
        return;
      }
      const p = data.profile!;
      setLogin(p.login);
      setLoginEdit(p.login);
      setAvatarId(normalizeAvatarId(p.avatarId));
      setNickname(p.nickname ?? "");
      setBw(profileNum(p.glBodyweightKg));
      setSq(profileNum(p.glMaxSquatKg));
      setBp(profileNum(p.glMaxBenchKg));
      setDl(profileNum(p.glMaxDeadliftKg));
      if (p.glSex) setSex(p.glSex);
      if (p.glEquipment) setEquipment(p.glEquipment);
      setProfileLevel(typeof p.profileLevel === "number" ? p.profileLevel : 1);
      setGlPointsState(typeof p.glPoints === "number" ? p.glPoints : null);
      setAchCatalog(Array.isArray(p.achievementsCatalog) ? p.achievementsCatalog : []);
      setPinnedIds(Array.isArray(p.pinnedAchievementIds) ? p.pinnedAchievementIds : []);
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const gl = useMemo(() => {
    return ipfGlProfilePreview({
      bodyweightKg: parseOptFloat(bw),
      squatKg: parseOptFloat(sq),
      benchKg: parseOptFloat(bp),
      deadliftKg: parseOptFloat(dl),
      sex,
      equipment,
    });
  }, [bw, sq, bp, dl, sex, equipment]);

  async function save() {
    setSaving(true);
    try {
      const nick = nickname.trim();
      const body: Record<string, unknown> = {
        avatarId,
        nickname: nick === "" ? null : nick,
        glBodyweightKg: parseOptFloat(bw),
        glMaxSquatKg: parseOptFloat(sq),
        glMaxBenchKg: parseOptFloat(bp),
        glMaxDeadliftKg: parseOptFloat(dl),
        glSex: sex,
        glEquipment: equipment,
      };
      if (normalizeLogin(loginEdit) !== normalizeLogin(login)) {
        body.login = loginEdit;
      }
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toastError((data as { error?: string }).error ?? "Не вдалося зберегти.");
        return;
      }
      const prof = (data as { profile?: ProfilePayload }).profile;
      if (prof?.login) {
        setLogin(prof.login);
        setLoginEdit(prof.login);
        router.refresh();
      }
      if (prof) {
        setProfileLevel(typeof prof.profileLevel === "number" ? prof.profileLevel : 1);
        setGlPointsState(typeof prof.glPoints === "number" ? prof.glPoints : null);
        setAchCatalog(Array.isArray(prof.achievementsCatalog) ? prof.achievementsCatalog : []);
        setPinnedIds(Array.isArray(prof.pinnedAchievementIds) ? prof.pinnedAchievementIds : []);
      }
      toastSuccess("Профіль збережено.");
      const det = profileEditDetailsRef.current;
      if (det) det.open = false;
      setLbRefreshToken((t) => t + 1);
    } finally {
      setSaving(false);
    }
  }

  async function togglePinAchievement(id: string) {
    const row = achCatalog.find((a) => a.id === id);
    if (!row?.unlocked) return;
    setPinSaving(true);
    try {
      let next = [...pinnedIds];
      if (next.includes(id)) next = next.filter((x) => x !== id);
      else {
        if (next.length >= 3) {
          toastError("Можна закріпити не більше трьох досягнень.");
          return;
        }
        next.push(id);
      }
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinnedAchievementIds: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toastError((data as { error?: string }).error ?? "Не вдалося зберегти закріплення.");
        return;
      }
      const prof = (data as { profile?: ProfilePayload }).profile;
      if (prof && Array.isArray(prof.pinnedAchievementIds)) setPinnedIds(prof.pinnedAchievementIds);
      toastSuccess("Закріплення оновлено.");
      setLbRefreshToken((t) => t + 1);
    } finally {
      setPinSaving(false);
    }
  }

  return {
    loading,
    saving,
    avatarId,
    setAvatarId,
    nickname,
    setNickname,
    bw,
    setBw,
    sq,
    setSq,
    bp,
    setBp,
    dl,
    setDl,
    sex,
    setSex,
    equipment,
    setEquipment,
    login,
    loginEdit,
    setLoginEdit,
    profileEditDetailsRef,
    profileLevel,
    glPointsState,
    achCatalog,
    pinnedIds,
    pinSaving,
    lbRefreshToken,
    gl,
    save,
    togglePinAchievement,
  };
}

export type ProfileController = ReturnType<typeof useProfile>;
