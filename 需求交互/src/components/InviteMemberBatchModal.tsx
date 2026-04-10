import { useEffect, useRef, useState } from "react";
import {
  createManualMember,
  formatMember,
  mockMembers,
  roleConfigs,
  type Member,
  type RoleKey,
} from "./inviteMemberShared";

type InviteMemberBatchModalProps = {
  open: boolean;
  onClose: () => void;
};

type BatchItem = {
  member: Member;
  roles: Record<RoleKey, boolean>;
  prices: Record<RoleKey, string>;
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

export function InviteMemberBatchModal({
  open,
  onClose,
}: InviteMemberBatchModalProps) {
  const [keyword, setKeyword] = useState("");
  const [items, setItems] = useState<BatchItem[]>([]);
  const [pendingUids, setPendingUids] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const query = keyword.trim().toLowerCase();
  const filteredMembers = (!query
    ? mockMembers
    : mockMembers.filter((member) => {
        const display = formatMember(member).toLowerCase();
        return (
          display.includes(query) ||
          member.uid.includes(query) ||
          member.nickname.toLowerCase().includes(query)
        );
      })
  ).filter(
    (member) => !items.some((item) => item.member.uid === member.uid),
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!toastVisible) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToastVisible(false);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [toastVisible]);

  if (!open) {
    return null;
  }

  const selectedCount = items.length;
  const confirmDisabled = selectedCount === 0;

  function resetBatch() {
    setKeyword("");
    setItems([]);
    setPendingUids([]);
    setIsDropdownOpen(false);
  }

  function addMember(member: Member) {
    setItems((current) => {
      if (current.some((item) => item.member.uid === member.uid)) {
        return current;
      }

      return [
        ...current,
        {
          member,
          roles: { ...emptyRoles },
          prices: { ...emptyPrices },
        },
      ];
    });
    setKeyword("");
    setPendingUids([]);
    setIsDropdownOpen(false);
  }

  function handleManualAdd() {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      return;
    }

    const matchedMember = mockMembers.find(
      (member) =>
        member.uid === trimmedKeyword ||
        formatMember(member).toLowerCase() === trimmedKeyword.toLowerCase(),
    );

    addMember(matchedMember ?? createManualMember(trimmedKeyword));
  }

  function togglePending(uid: string) {
    setPendingUids((current) =>
      current.includes(uid)
        ? current.filter((item) => item !== uid)
        : [...current, uid],
    );
  }

  function handleAddSelected() {
    if (pendingUids.length === 0) {
      return;
    }

    const selectedMembers = mockMembers.filter((member) =>
      pendingUids.includes(member.uid),
    );

    setItems((current) => {
      const existingUids = new Set(current.map((item) => item.member.uid));
      const nextItems = [...current];

      selectedMembers.forEach((member) => {
        if (!existingUids.has(member.uid)) {
          nextItems.push({
            member,
            roles: { ...emptyRoles },
            prices: { ...emptyPrices },
          });
        }
      });

      return nextItems;
    });

    setKeyword("");
    setPendingUids([]);
    setIsDropdownOpen(false);
  }

  function removeMember(uid: string) {
    setItems((current) => current.filter((item) => item.member.uid !== uid));
  }

  function toggleRole(uid: string, roleKey: RoleKey) {
    setItems((current) =>
      current.map((item) => {
        if (item.member.uid !== uid) {
          return item;
        }

        const nextChecked = !item.roles[roleKey];
        return {
          ...item,
          roles: {
            ...item.roles,
            [roleKey]: nextChecked,
          },
          prices: nextChecked
            ? item.prices
            : {
                ...item.prices,
                [roleKey]: "",
              },
        };
      }),
    );
  }

  function updatePrice(uid: string, roleKey: RoleKey, value: string) {
    setItems((current) =>
      current.map((item) =>
        item.member.uid === uid
          ? {
              ...item,
              prices: {
                ...item.prices,
                [roleKey]: value.replace(/[^0-9.]/g, ""),
              },
            }
          : item,
      ),
    );
  }

  function handleConfirm() {
    if (confirmDisabled) {
      return;
    }

    resetBatch();
    setToastVisible(true);
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[2px]" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="relative flex h-[min(84vh,860px)] w-full max-w-[920px] flex-col overflow-hidden rounded-[24px] bg-white px-8 py-7 shadow-[0_18px_80px_rgba(15,23,42,0.16)]">
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

          <div className="mb-5">
            <div className="mb-2 text-[13px] font-medium uppercase tracking-[0.22em] text-[#5B5BFF]">
              方案二
            </div>
            <h2 className="text-[30px] font-semibold tracking-[-0.02em] text-slate-900">
              邀请成员
            </h2>
          </div>

          <div ref={dropdownRef} className="relative">
            <label className="mb-3 block text-[15px] font-medium text-slate-800">
              搜索成员
            </label>
            <p className="mb-3 text-[13px] text-slate-400">
              勾选多个成员后，可一次加入下方待配置列表
            </p>
            <div className="relative">
              <input
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleManualAdd();
                  }
                }}
                placeholder="输入喜马UID或昵称搜索..."
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-4 pr-14 text-[16px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5B5BFF] focus:ring-4 focus:ring-[#5B5BFF]/10"
              />
              <button
                type="button"
                onClick={handleManualAdd}
                className="absolute inset-y-0 right-0 flex w-14 items-center justify-center text-slate-400 transition hover:text-[#5B5BFF]"
                aria-label="添加成员"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
            </div>

            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
                {filteredMembers.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                      <span className="text-[13px] font-medium text-slate-500">
                        常用用户
                      </span>
                      <span className="text-[12px] text-slate-400">
                        可多选后批量加入
                      </span>
                    </div>
                    <ul className="max-h-60 overflow-y-auto py-2">
                      {filteredMembers.map((member) => (
                        <li key={member.uid}>
                          <label className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3 text-[15px] text-slate-700 transition hover:bg-[#5B5BFF]/6 hover:text-slate-900">
                            <span>{formatMember(member)}</span>
                            <input
                              type="checkbox"
                              checked={pendingUids.includes(member.uid)}
                              onChange={() => togglePending(member.uid)}
                              className="h-[18px] w-[18px] rounded border-slate-300 accent-[#5B5BFF]"
                            />
                          </label>
                        </li>
                      ))}
                    </ul>
                    <div className="sticky bottom-0 flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3">
                      <span className="text-[13px] text-slate-400">
                        已勾选 {pendingUids.length} 人
                      </span>
                      <button
                        type="button"
                        onClick={handleAddSelected}
                        disabled={pendingUids.length === 0}
                        className="h-9 rounded-lg px-4 text-[14px] font-medium text-white transition disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                        style={{
                          backgroundColor:
                            pendingUids.length === 0 ? undefined : "#5B5BFF",
                        }}
                      >
                        加入列表（{pendingUids.length}人）
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="px-4 py-5 text-[14px] text-slate-400">
                    未搜索到可添加成员
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex min-h-0 flex-1 flex-col">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-slate-900">
                待配置列表
              </h3>
              <span className="text-[13px] text-slate-400">
                已选择 {selectedCount} 人
              </span>
            </div>

            <div className="min-h-[220px] flex-1 overflow-y-auto rounded-[22px] border border-slate-200 bg-slate-50/70 p-3 pt-4">
              {items.length > 0 ? (
                <div className="space-y-4">
                  {items.map((item) => {
                    const selectedRoles = roleConfigs.filter(
                      (role) => item.roles[role.key],
                    );

                    return (
                      <div
                        key={item.member.uid}
                        className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                      >
                        <div className="mb-4 flex items-start justify-between gap-4">
                          <div>
                            <div className="text-[17px] font-semibold text-slate-900">
                              {formatMember(item.member)}
                            </div>
                            <div className="mt-1 text-[13px] text-slate-400">
                              单张卡片独立配置身份与价格
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMember(item.member.uid)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            aria-label="移除成员"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            >
                              <path d="M6 6L18 18" />
                              <path d="M18 6L6 18" />
                            </svg>
                          </button>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-x-6 gap-y-3">
                          {roleConfigs.map((role) => (
                            <label
                              key={role.key}
                              className="flex cursor-pointer items-center gap-2 text-[15px] text-slate-800"
                            >
                              <input
                                type="checkbox"
                                checked={item.roles[role.key]}
                                onChange={() =>
                                  toggleRole(item.member.uid, role.key)
                                }
                                className="h-[18px] w-[18px] rounded border-slate-300 accent-[#5B5BFF]"
                              />
                              <span>{role.label}</span>
                            </label>
                          ))}
                        </div>

                        {selectedRoles.length > 0 && (
                          <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                            {selectedRoles.map((role) => (
                              <div
                                key={role.key}
                                className="grid gap-3 md:grid-cols-[96px_1fr]"
                              >
                                <label
                                  htmlFor={`${item.member.uid}-${role.key}`}
                                  className="pt-2 text-[14px] font-medium text-slate-700"
                                >
                                  {role.label}单价
                                </label>
                                <div className="flex items-center gap-3">
                                  <input
                                    id={`${item.member.uid}-${role.key}`}
                                    inputMode="decimal"
                                    value={item.prices[role.key]}
                                    onChange={(event) =>
                                      updatePrice(
                                        item.member.uid,
                                        role.key,
                                        event.target.value,
                                      )
                                    }
                                    placeholder="请输入"
                                    className="h-10 w-full max-w-[220px] rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5B5BFF] focus:ring-4 focus:ring-[#5B5BFF]/10"
                                  />
                                  <span className="text-[14px] text-slate-600">
                                    {role.unit}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-full min-h-[228px] items-center justify-center rounded-[18px] border border-dashed border-slate-200 bg-white text-[14px] text-slate-400">
                  先从上方搜索并添加成员，再在这里逐个配置身份和价格
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex shrink-0 flex-col gap-4 border-t border-slate-100 bg-white pt-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-[15px] text-slate-700">
              <span className="font-medium text-slate-800">结算方式：</span>
              <span>自动月结</span>
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
                disabled={confirmDisabled}
                className="h-11 rounded-xl px-5 text-[15px] font-medium text-white transition disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                style={{
                  backgroundColor: confirmDisabled ? undefined : "#5B5BFF",
                  boxShadow: confirmDisabled
                    ? undefined
                    : "0 12px 30px rgba(91, 91, 255, 0.28)",
                }}
              >
                确认邀请（{selectedCount}人）
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
          批量邀请成功
        </div>
      </div>
    </>
  );
}
