import { useEffect, useState, useCallback } from "react";
import type { DepartmentKey } from "./job-categories";

const KEY = "upskill.onboarding.profile.v1";

export interface OnboardingProfile {
  selected_department: DepartmentKey | "";
  selected_tasks: string[];
  custom_tasks: string[];
}

const EMPTY: OnboardingProfile = {
  selected_department: "",
  selected_tasks: [],
  custom_tasks: [],
};

function read(): OnboardingProfile {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return EMPTY;
  }
}

function write(p: OnboardingProfile) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
    window.dispatchEvent(new CustomEvent("onboarding:update"));
  } catch {
    /* ignore */
  }
}

export function useOnboardingProfile() {
  const [profile, setProfile] = useState<OnboardingProfile>(EMPTY);

  useEffect(() => {
    setProfile(read());
    const handler = () => setProfile(read());
    window.addEventListener("onboarding:update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("onboarding:update", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const update = useCallback((patch: Partial<OnboardingProfile>) => {
    const next = { ...read(), ...patch };
    write(next);
    setProfile(next);
  }, []);

  const reset = useCallback(() => {
    write(EMPTY);
    setProfile(EMPTY);
  }, []);

  return { profile, update, reset };
}

export function getOnboardingProfile(): OnboardingProfile {
  return read();
}
