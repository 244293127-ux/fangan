import { useState } from "react";
import { InviteMemberBatchModal } from "./components/InviteMemberBatchModal";
import { InviteMemberModal } from "./components/InviteMemberModal";
import { ProjectMemberImport } from "./components/ProjectMemberImport";

export default function App() {
  const [openSchemeOne, setOpenSchemeOne] = useState(false);
  const [openSchemeTwo, setOpenSchemeTwo] = useState(false);
  const [openSchemeThree, setOpenSchemeThree] = useState(false);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(91,91,255,0.12),_transparent_38%),linear-gradient(180deg,_#f8faff_0%,_#eef2ff_100%)] px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="rounded-[28px] border border-white/70 bg-white/78 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#5B5BFF]">
            Demo Preview
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            邀请成员弹窗
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-7 text-slate-600">
            方案一适合单人逐个邀请，方案二适合先批量选人，再统一逐卡配置。
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 text-[13px] font-medium uppercase tracking-[0.18em] text-slate-400">
                方案一
              </div>
              <h2 className="text-[22px] font-semibold text-slate-900">
                单人配置流
              </h2>
              <p className="mt-2 text-[14px] leading-7 text-slate-600">
                先选一个成员，再展开身份和单价配置，适合逐个精细邀请。
              </p>
              <button
                type="button"
                onClick={() => setOpenSchemeOne(true)}
                className="mt-6 h-11 rounded-xl px-5 text-[15px] font-medium text-white shadow-[0_12px_30px_rgba(91,91,255,0.24)] transition hover:translate-y-[-1px]"
                style={{ backgroundColor: "#5B5BFF" }}
              >
                打开方案一
              </button>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 text-[13px] font-medium uppercase tracking-[0.18em] text-slate-400">
                方案二
              </div>
              <h2 className="text-[22px] font-semibold text-slate-900">
                批量配置流
              </h2>
              <p className="mt-2 text-[14px] leading-7 text-slate-600">
                先批量选择成员，再在各自卡片里独立配置身份和价格，最后统一邀请。
              </p>
              <button
                type="button"
                onClick={() => setOpenSchemeTwo(true)}
                className="mt-6 h-11 rounded-xl px-5 text-[15px] font-medium text-white shadow-[0_12px_30px_rgba(91,91,255,0.24)] transition hover:translate-y-[-1px]"
                style={{ backgroundColor: "#5B5BFF" }}
              >
                打开方案二
              </button>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 text-[13px] font-medium uppercase tracking-[0.18em] text-slate-400">
                方案三
              </div>
              <h2 className="text-[22px] font-semibold text-slate-900">
                项目导入流
              </h2>
              <p className="mt-2 text-[14px] leading-7 text-slate-600">
                支持个人 UID 搜索，也支持从已有作品导入历史班底，并逐个确认本次邀请权限与单价。
              </p>
              <button
                type="button"
                onClick={() => setOpenSchemeThree(true)}
                className="mt-6 h-11 rounded-xl px-5 text-[15px] font-medium text-white shadow-[0_12px_30px_rgba(91,91,255,0.24)] transition hover:translate-y-[-1px]"
                style={{ backgroundColor: "#5B5BFF" }}
              >
                打开方案三
              </button>
            </div>
          </div>
        </div>
      </div>

      <InviteMemberModal
        open={openSchemeOne}
        onClose={() => setOpenSchemeOne(false)}
      />
      <InviteMemberBatchModal
        open={openSchemeTwo}
        onClose={() => setOpenSchemeTwo(false)}
      />
      <ProjectMemberImport
        open={openSchemeThree}
        onClose={() => setOpenSchemeThree(false)}
      />
    </main>
  );
}
