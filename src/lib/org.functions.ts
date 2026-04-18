import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ============= Bootstrap admin org (called after signup) =============
export const bootstrapAdminOrg = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ org_name: z.string().min(1).max(120), full_name: z.string().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: orgId, error } = await supabase.rpc("bootstrap_admin_org", {
      _org_name: data.org_name,
      _full_name: data.full_name,
    });
    if (error) throw new Error(error.message);
    return { org_id: orgId as unknown as string };
  });

// ============= Redeem invite code =============
export const redeemInviteCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ code: z.string().min(4).max(20) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: orgId, error } = await supabase.rpc("redeem_invite_code", {
      _code: data.code,
    });
    if (error) throw new Error(error.message);
    return { org_id: orgId as unknown as string };
  });

// ============= Create invite code (admin) =============
export const createInviteCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      expires_in_hours: z.number().int().min(1).max(720).default(168),
      max_uses: z.number().int().min(1).max(100).default(1),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: code, error } = await supabase.rpc("create_invite_code", {
      _expires_in_hours: data.expires_in_hours,
      _max_uses: data.max_uses,
    });
    if (error) throw new Error(error.message);
    return { code: code as unknown as string };
  });

// ============= List org employees (admin) =============
export const listOrgEmployees = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: prof } = await supabase.from("profiles").select("org_id").eq("id", userId).maybeSingle();
    const orgId = prof?.org_id as string | undefined;
    if (!orgId) return { employees: [], orgId: null };

    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role, created_at")
      .eq("org_id", orgId);

    const userIds = (roles ?? []).map((r) => r.user_id as string);
    const { data: profiles } = userIds.length
      ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
      : { data: [] as Array<{ id: string; full_name: string | null }> };
    const { data: access } = await supabase
      .from("employee_agent_access")
      .select("employee_id, can_use_builder")
      .eq("org_id", orgId);

    const profMap = new Map((profiles ?? []).map((p) => [p.id as string, p.full_name as string | null]));
    const accessMap = new Map(
      (access ?? []).map((a) => [a.employee_id as string, a.can_use_builder as boolean]),
    );

    const employees = (roles ?? []).map((r) => ({
      user_id: r.user_id as string,
      role: r.role as "admin" | "employee",
      full_name: profMap.get(r.user_id as string) ?? "Unnamed",
      can_use_builder: accessMap.get(r.user_id as string) ?? false,
      joined_at: r.created_at as string,
    }));

    return { employees, orgId };
  });

// ============= List invite codes (admin) =============
export const listInviteCodes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("invite_codes")
      .select("code, expires_at, max_uses, used_count, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return { codes: data ?? [] };
  });

// ============= Set employee builder access =============
export const setEmployeeBuilderAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ employee_id: z.string().uuid(), can_use_builder: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: prof } = await supabase.from("profiles").select("org_id").eq("id", userId).maybeSingle();
    const orgId = prof?.org_id as string | undefined;
    if (!orgId) throw new Error("No organization");

    const { error } = await supabase
      .from("employee_agent_access")
      .upsert(
        {
          org_id: orgId,
          employee_id: data.employee_id,
          can_use_builder: data.can_use_builder,
          updated_by: userId,
        },
        { onConflict: "org_id,employee_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============= List agent governance =============
export const listAgentGovernance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("agent_governance")
      .select("skill_id, min_confidence, is_paused, updated_at");
    if (error) throw new Error(error.message);
    return { governance: data ?? [] };
  });

// ============= Set agent governance =============
export const setAgentGovernance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      skill_id: z.string().min(1).max(80),
      min_confidence: z.number().int().min(0).max(100),
      is_paused: z.boolean(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: prof } = await supabase.from("profiles").select("org_id").eq("id", userId).maybeSingle();
    const orgId = prof?.org_id as string | undefined;
    if (!orgId) throw new Error("No organization");

    const { error } = await supabase
      .from("agent_governance")
      .upsert(
        {
          org_id: orgId,
          skill_id: data.skill_id,
          min_confidence: data.min_confidence,
          is_paused: data.is_paused,
          updated_by: userId,
        },
        { onConflict: "org_id,skill_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============= Get my employee access (employee viewing self) =============
export const getMyEmployeeAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: prof } = await supabase.from("profiles").select("org_id").eq("id", userId).maybeSingle();
    const orgId = prof?.org_id as string | undefined;
    if (!orgId) return { can_use_builder: false };

    const { data } = await supabase
      .from("employee_agent_access")
      .select("can_use_builder")
      .eq("org_id", orgId)
      .eq("employee_id", userId)
      .maybeSingle();
    return { can_use_builder: (data?.can_use_builder as boolean | undefined) ?? false };
  });

// ============= Activity log =============
export const logActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      action: z.string().min(1).max(80),
      meta: z.record(z.string(), z.unknown()).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: prof } = await supabase.from("profiles").select("org_id").eq("id", userId).maybeSingle();
    const orgId = prof?.org_id as string | undefined;
    if (!orgId) throw new Error("No organization");
    const { error } = await supabase
      .from("activity_log")
      .insert({ org_id: orgId, actor_id: userId, action: data.action, meta: data.meta ?? null });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listOrgActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ limit: z.number().int().min(1).max(200).default(50) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("activity_log")
      .select("id, actor_id, action, meta, created_at")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);

    const actorIds = Array.from(new Set((rows ?? []).map((r) => r.actor_id as string)));
    const { data: profiles } = actorIds.length
      ? await supabase.from("profiles").select("id, full_name").in("id", actorIds)
      : { data: [] as Array<{ id: string; full_name: string | null }> };
    const nameMap = new Map((profiles ?? []).map((p) => [p.id as string, p.full_name as string | null]));

    return {
      activity: (rows ?? []).map((r) => ({
        id: r.id as string,
        actor_id: r.actor_id as string,
        actor_name: nameMap.get(r.actor_id as string) ?? "Unknown",
        action: r.action as string,
        meta: r.meta,
        created_at: r.created_at as string,
      })),
    };
  });
