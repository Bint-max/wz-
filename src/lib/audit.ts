/**
 * 审计日志基础能力
 * 非阻塞写入，失败仅打印日志，不中断主流程。
 */
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type AuditInput = {
  actorId?: string | null;
  actorName?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  result?: string | null;
  ip?: string | null;
  requestId?: string | null;
  meta?: Prisma.InputJsonValue | null;
};

export async function writeAudit(input: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        actorName: input.actorName ?? null,
        action: input.action,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        result: input.result ?? "SUCCESS",
        ip: input.ip ?? null,
        requestId: input.requestId ?? null,
        meta: input.meta ?? undefined,
      },
    });
  } catch (e) {
    console.error("[audit] 写入审计日志失败", e);
  }
}
