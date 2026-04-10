import { useEffect, useMemo, useRef, useState } from "react";
import {
  createManualMember,
  formatMember,
  mockMembers,
  roleConfigs,
  type Member,
  type RoleKey,
} from "./inviteMemberShared";

type ProjectMemberImportProps = {
  open: boolean;
  onClose: () => void;
};

type MemberConfig = {
  enabled: boolean;
  member: Member;
  roles: Record<RoleKey, boolean>;
  prices: Record<RoleKey, string>;
};

type HistoryProject = {
  id: string;
  title: string;
  period: string;
  members: Array<{
    uid: string;
    nickname: string;
    roles: Partial<Record<RoleKey, string>>;
  }>;
};

const emptyRoles: Record<RoleKey, boolean> = {
  editor: false,
  reviewer: false,
  narrator: false,
  dialogue: false,
};

const emptyPrices: Record<RoleKey, string> = {
  editor: "",
  reviewer: "",
  narrator: "",
  dialogue: "",
};

const historyProjects: HistoryProject[] = [
  {
    id: "abyss-echo",
    title: "《深渊回响》第一季",
    period: "2025-01",
    members: [
      { uid: "12345", nickname: "刘生浦", roles: { narrator: "80", dialogue: "120" } },
      { uid: "22346", nickname: "周舟", roles: { editor: "45", reviewer: "60" } },
      { uid: "32347", nickname: "阿木", roles: { narrator: "95" } },
    ],
  },
  {
    id: "practice-audio",
    title: "《有声小说练习》季",
    period: "2024-12",
    members: [
      { uid: "42811", nickname: "言末", roles: { editor: "35" } },
      { uid: "52812", nickname: "长栖", roles: { reviewer: "55", dialogue: "90" } },
    ],
  },
];

function buildConfigMember(
  member: Member,
  presetRoles?: Partial<Record<RoleKey, string>>,
): MemberConfig {
  const roles = { ...emptyRoles };
  const prices = { ...emptyPrices };

  if (presetRoles) {
    roleConfigs.forEach((role) => {
      const presetPrice = presetRoles[role.key];
      if (presetPrice) {
        roles[role.key] = true;
        prices[role.key] = presetPrice;
      }
    });
  }

  return {
    enabled: true,
    member,
    roles,
    prices,
  };
}

export function ProjectMemberImport({
  open,
  onClose,
}: ProjectMemberImportProps) {
  const [keyword, setKeyword] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<HistoryProject | null>(null);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [memberConfigs, setMemberConfigs] = useState<MemberConfig[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const projectMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const invitedCount = memberConfigs.filter((item) => item.enabled).length;

  const matchedPersonalMember = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) {
      return null;
    }

    return (
      mockMembers.find(
        (member) =>
          member.uid === query ||
          member.nickname.toLowerCase().includes(query) ||
          formatMember(member).toLowerCase().includes(query),
      ) ?? null
    );
  }, [keyword]);

  const filteredPersonalMembers = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) {
      return mockMembers;
    }

    return mockMembers.filter(
      (member) =>
        member.uid.includes(query) ||
        member.nickname.toLowerCase().includes(query) ||
        formatMember(member).toLowerCase().includes(query),
    );
  }, [keyword]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!projectMenuRef.current?.contains(event.target as Node)) {
        setProjectMenuOpen(false);
      }
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!toastVisible) {
      return;
    }

    const timer = window.setTimeout(() => setToastVisible(false), 2200);
    return () => window.clearTimeout(timer);
  }, [toastVisible]);

  if (!open) {
    return null;
  }

  function resetState() {
    setKeyword("");
    setUserMenuOpen(false);
    setSelectedProject(null);
    setProjectMenuOpen(false);
    setMemberConfigs([]);
  }

  function handleImportProject(project: HistoryProject) {
    setSelectedProject(project);
    setProjectMenuOpen(false);
    setUserMenuOpen(false);
    setKeyword("");
    setMemberConfigs(
      project.members.map((item) =>
        buildConfigMember(
          { uid: item.uid, nickname: item.nickname },
          item.roles,
        ),
      ),
    );
  }

  function handleSearchPersonalMember() {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) {
      return;
    }

    const member = matchedPersonalMember ?? createManualMember(trimmedKeyword);
    setSelectedProject(null);
    setMemberConfigs([buildConfigMember(member)]);
    setUserMenuOpen(false);
  }

  function handleSelectPersonalMember(member: Member) {
    setKeyword(formatMember(member));
    setSelectedProject(null);
    setMemberConfigs([buildConfigMember(member)]);
    setUserMenuOpen(false);
  }

  function updateMemberConfig(
    uid: string,
    updater: (current: MemberConfig) => MemberConfig,
  ) {
    setMemberConfigs((current) =>
      current.map((item) => (item.member.uid === uid ? updater(item) : item)),
    );
  }

  function handleToggleMember(uid: string) {
    updateMemberConfig(uid, (current) => ({
      ...current,
      enabled: !current.enabled,
    }));
  }

  function handleToggleRole(uid: string, roleKey: RoleKey) {
    updateMemberConfig(uid, (current) => {
      const nextChecked = !current.roles[roleKey];
      return {
        ...current,
        roles: {
          ...current.roles,
          [roleKey]: nextChecked,
        },
        prices: nextChecked
          ? current.prices
          : {
              ...current.prices,
              [roleKey]: "",
            },
      };
    });
  }

  function handlePriceChange(uid: string, roleKey: RoleKey, value: string) {
    updateMemberConfig(uid, (current) => ({
      ...current,
      prices: {
        ...current.prices,
        [roleKey]: value.replace(/[^0-9.]/g, ""),
      },
    }));
  }

  function handleConfirm() {
    if (invitedCount === 0) {
      return;
    }

    resetState();
    setToastVisible(true);
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[2px]" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="relative flex h-[min(84vh,860px)] w-full max-w-[980px] flex-col overflow-hidden rounded-[24px] bg-white px-8 py-7 shadow-[0_18px_80px_rgba(15,23,42,0.16)]">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-7 top-7 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="关闭弹窗"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M6 6L18 18" />
              <path d="M18 6L6 18" />
            </svg>
          </button>

          <div className="mb-6">
            <div className="mb-2 text-[13px] font-medium uppercase tracking-[0.22em] text-[#5B5BFF]">
              方案三
            </div>
            <h2 className="text-[30px] font-semibold tracking-[-0.02em] text-slate-900">
              邀请项目成员
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_280px]">
            <div ref={userMenuRef} className="relative">
              <input
                value={keyword}
                onFocus={() => setUserMenuOpen(true)}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setUserMenuOpen(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearchPersonalMember();
                  }
                }}
                placeholder="喜马UID (个人用户)"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[16px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5B5BFF] focus:ring-4 focus:ring-[#5B5BFF]/10"
              />

              {userMenuOpen && (
                <div className="absolute left-0 top-full z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-[13px] text-slate-400">
                    <span className="font-medium text-slate-500">常用用户</span>
                    <span>
                      {filteredPersonalMembers.length > 0 ? "滚动查看更多" : "未搜索到匹配成员"}
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {filteredPersonalMembers.length > 0 ? (
                      filteredPersonalMembers.map((member) => (
                        <button
                          key={member.uid}
                          type="button"
                          onClick={() => handleSelectPersonalMember(member)}
                          className="block w-full px-4 py-3 text-left text-[15px] text-slate-700 transition hover:bg-[#5B5BFF]/6 hover:text-slate-900"
                        >
                          {formatMember(member)}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-[14px] text-slate-400">
                        没有匹配到常用用户，可直接输入 UID 后按回车继续。
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div ref={projectMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setProjectMenuOpen((current) => !current)}
                className="flex h-14 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-[15px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <span>从已有作品导入班底</span>
                <span className="text-slate-400">
                  {projectMenuOpen ? "▲" : "▼"}
                </span>
              </button>

              {projectMenuOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
                  <ul className="py-2">
                    {historyProjects.map((project) => (
                      <li key={project.id}>
                        <button
                          type="button"
                          onClick={() => handleImportProject(project)}
                          className="w-full px-4 py-3 text-left text-[15px] text-slate-700 transition hover:bg-[#5B5BFF]/6 hover:text-slate-900"
                        >
                          {project.title} ({project.period})
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
            {selectedProject ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-[15px] leading-7 text-slate-600">
                  已为您读取
                  <span className="mx-1 font-semibold text-slate-900">
                    {selectedProject.title}
                  </span>
                  的
                  <span className="mx-1 font-semibold text-slate-900">
                    {memberConfigs.length}
                  </span>
                  名历史成员，请确认本次邀请权限与单价：
                </p>
              </div>
            ) : memberConfigs.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-[15px] text-slate-600">
                已为您加入 1 名个人用户，请确认本次邀请权限与单价。
              </div>
            ) : (
              <div className="flex h-full min-h-[260px] items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 text-[15px] text-slate-400">
                请搜索用户或导入历史班底
              </div>
            )}

            {memberConfigs.length > 0 && (
              <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white">
                {memberConfigs.map((item, index) => (
                  <div
                    key={item.member.uid}
                    className={`px-5 py-5 transition ${
                      item.enabled ? "opacity-100" : "opacity-45"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={() => handleToggleMember(item.member.uid)}
                        className="mt-1 h-[18px] w-[18px] rounded border-slate-300 accent-[#5B5BFF]"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="text-[17px] font-semibold text-slate-900">
                          {formatMember(item.member)}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                          {roleConfigs.map((role) => {
                            const active = item.roles[role.key];

                            return (
                              <div
                                key={role.key}
                                className="flex flex-wrap items-center gap-2"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleRole(item.member.uid, role.key)
                                  }
                                  className={`inline-flex h-9 items-center rounded-full border px-3 text-[14px] font-medium transition ${
                                    active
                                      ? "border-[#5B5BFF] bg-[#5B5BFF]/8 text-[#5B5BFF]"
                                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                  }`}
                                >
                                  {active ? "✓ " : ""}
                                  {role.label}
                                </button>

                                {active && (
                                  <>
                                    <input
                                      inputMode="decimal"
                                      value={item.prices[role.key]}
                                      onChange={(event) =>
                                        handlePriceChange(
                                          item.member.uid,
                                          role.key,
                                          event.target.value,
                                        )
                                      }
                                      placeholder="80"
                                      className="h-9 w-20 rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5B5BFF] focus:ring-4 focus:ring-[#5B5BFF]/10"
                                    />
                                    <span className="text-[13px] text-slate-500">
                                      {role.unit}
                                    </span>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {index < memberConfigs.length - 1 && (
                      <div className="mt-5 border-b border-slate-100" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 flex shrink-0 flex-col gap-4 border-t border-slate-100 bg-white pt-5 md:flex-row md:items-center md:justify-between">
            <div className="text-[15px] text-slate-700">
              <span className="font-medium text-slate-800">结算方式：</span>
              <span className="ml-2">自动月结</span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-[15px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={invitedCount === 0}
                className="h-11 rounded-xl px-5 text-[15px] font-medium text-white transition disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                style={{
                  backgroundColor: invitedCount === 0 ? undefined : "#5B5BFF",
                  boxShadow:
                    invitedCount === 0
                      ? undefined
                      : "0 12px 30px rgba(91, 91, 255, 0.28)",
                }}
              >
                一键批量邀请（{invitedCount}人）
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 top-6 z-[60] flex justify-center px-6">
        <div
          className={`rounded-xl bg-slate-900 px-4 py-2 text-[14px] text-white shadow-lg transition-all duration-200 ${
            toastVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-2 opacity-0"
          }`}
        >
          批量导入成功
        </div>
      </div>
    </>
  );
}
