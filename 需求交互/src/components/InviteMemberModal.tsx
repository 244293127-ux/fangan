import { useEffect, useRef, useState } from "react";
import {
  createManualMember,
  formatMember,
  mockMembers,
  roleConfigs,
  type Member,
  type RoleKey,
} from "./inviteMemberShared";

type InviteMemberModalProps = {
  open: boolean;
  onClose: () => void;
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

export function InviteMemberModal({
  open,
  onClose,
}: InviteMemberModalProps) {
  const [keyword, setKeyword] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [roles, setRoles] = useState<Record<RoleKey, boolean>>(emptyRoles);
  const [prices, setPrices] = useState<Record<RoleKey, string>>(emptyPrices);
  const [toastVisible, setToastVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const query = keyword.trim().toLowerCase();
  const filteredMembers = !query
    ? mockMembers
    : mockMembers.filter((member) => {
        const display = formatMember(member).toLowerCase();
        return (
          display.includes(query) ||
          member.uid.includes(query) ||
          member.nickname.toLowerCase().includes(query)
        );
      });

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

  const selectedRoleList = roleConfigs.filter((role) => roles[role.key]);
  const hasMissingPrice = selectedRoleList.some(
    (role) => prices[role.key].trim() === "",
  );
  const confirmDisabled =
    !selectedMember || selectedRoleList.length === 0 || hasMissingPrice;

  function resetForm() {
    setKeyword("");
    setSelectedMember(null);
    setIsDropdownOpen(false);
    setRoles(emptyRoles);
    setPrices(emptyPrices);
  }

  function handleSelectMember(member: Member) {
    setSelectedMember(member);
    setKeyword(formatMember(member));
    setIsDropdownOpen(false);
    setRoles(emptyRoles);
    setPrices(emptyPrices);
  }

  function handleKeywordChange(value: string) {
    setKeyword(value);
    setIsDropdownOpen(true);

    if (
      selectedMember &&
      value !== formatMember(selectedMember) &&
      value !== selectedMember.uid
    ) {
      setSelectedMember(null);
      setRoles(emptyRoles);
      setPrices(emptyPrices);
    }
  }

  function handleManualSearch() {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      return;
    }

    const matchedMember = mockMembers.find(
      (member) =>
        member.uid === trimmedKeyword ||
        formatMember(member).toLowerCase() === trimmedKeyword.toLowerCase(),
    );

    setSelectedMember(matchedMember ?? createManualMember(trimmedKeyword));
    setKeyword(matchedMember ? formatMember(matchedMember) : trimmedKeyword);
    setIsDropdownOpen(false);
    setRoles(emptyRoles);
    setPrices(emptyPrices);
  }

  function handleToggleRole(roleKey: RoleKey) {
    setRoles((current) => {
      const nextChecked = !current[roleKey];

      if (!nextChecked) {
        setPrices((currentPrices) => ({
          ...currentPrices,
          [roleKey]: "",
        }));
      }

      return {
        ...current,
        [roleKey]: nextChecked,
      };
    });
  }

  function handleConfirm() {
    if (confirmDisabled) {
      return;
    }

    resetForm();
    setToastVisible(true);
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[2px]" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="relative flex h-[min(82vh,760px)] w-full max-w-[760px] flex-col overflow-hidden rounded-[24px] bg-white px-9 py-8 shadow-[0_18px_80px_rgba(15,23,42,0.16)]">
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

          <div className="mb-7">
            <h2 className="text-[34px] font-semibold tracking-[-0.02em] text-slate-900">
              邀请成员
            </h2>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1 pb-3">
            <div ref={dropdownRef} className="relative">
            <label className="mb-3 block text-[15px] font-medium text-slate-800">
              搜索成员
            </label>
            <p className="mb-3 text-[13px] text-slate-400">
              可直接输入 UID 搜索，或从下方常用用户中快速选择
            </p>
            <div className="relative">
              <input
                value={keyword}
                onChange={(event) => handleKeywordChange(event.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleManualSearch();
                  }
                }}
                placeholder="输入喜马UID或昵称搜索..."
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-4 pr-14 text-[16px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5B5BFF] focus:ring-4 focus:ring-[#5B5BFF]/10"
              />
              <button
                type="button"
                onClick={handleManualSearch}
                className="absolute inset-y-0 right-0 flex w-14 items-center justify-center text-slate-400 transition hover:text-[#5B5BFF]"
                aria-label="搜索 UID"
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
                        滚动查看更多
                      </span>
                    </div>
                    <ul className="max-h-72 overflow-y-auto py-2">
                      {filteredMembers.map((member) => {
                        const displayName = formatMember(member);

                        return (
                          <li key={member.uid}>
                            <button
                              type="button"
                              onClick={() => handleSelectMember(member)}
                              className="flex w-full items-center px-4 py-3 text-left text-[15px] text-slate-700 transition hover:bg-[#5B5BFF]/6 hover:text-slate-900"
                            >
                              {displayName}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                ) : (
                  <div className="px-4 py-5 text-[14px] text-slate-400">
                    未搜索到匹配成员
                  </div>
                )}
              </div>
            )}
            </div>

            <div className="mt-6">
            <label className="mb-3 block text-[15px] font-medium text-slate-800">
              喜马昵称
            </label>
            <input
              value={selectedMember?.nickname ?? ""}
              readOnly
              placeholder="搜索UID之后自动显示喜马昵称"
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[16px] text-slate-900 outline-none placeholder:text-slate-400"
            />
            </div>

            {selectedMember ? (
            <div className="mt-9 border-t border-slate-100 pt-7">
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-[92px_1fr] md:items-start">
                  <div className="pt-1 text-[15px] font-medium text-slate-800">
                    身份
                  </div>
                  <div className="flex flex-wrap gap-x-8 gap-y-3">
                    {roleConfigs.map((role) => (
                      <label
                        key={role.key}
                        className="flex cursor-pointer items-center gap-2 text-[16px] text-slate-800"
                      >
                        <input
                          type="checkbox"
                          checked={roles[role.key]}
                          onChange={() => handleToggleRole(role.key)}
                          className="h-[18px] w-[18px] rounded border-slate-300 accent-[#5B5BFF]"
                        />
                        <span>{role.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedRoleList.map((role) => (
                  <div
                    key={role.key}
                    className="grid gap-4 md:grid-cols-[92px_1fr] md:items-center"
                  >
                    <label
                      htmlFor={`price-${role.key}`}
                      className="text-[15px] font-medium text-slate-800"
                    >
                      <span className="mr-1 text-rose-500">*</span>
                      {role.label}单价
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        id={`price-${role.key}`}
                        inputMode="decimal"
                        value={prices[role.key]}
                        onChange={(event) =>
                          setPrices((current) => ({
                            ...current,
                            [role.key]: event.target.value.replace(
                              /[^0-9.]/g,
                              "",
                            ),
                          }))
                        }
                        placeholder="请输入"
                        className="h-12 w-full max-w-[290px] rounded-2xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5B5BFF] focus:ring-4 focus:ring-[#5B5BFF]/10"
                      />
                      <span className="text-[15px] text-slate-600">
                        {role.unit}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="mt-1 flex items-center gap-2 text-[15px] text-slate-700">
                  <span className="font-medium text-slate-800">结算方式：</span>
                  <span>自动月结</span>
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-[12px] text-slate-500"
                    title="系统将按月自动结算"
                  >
                    ?
                  </span>
                </div>
              </div>
            </div>
            ) : (
              <div className="mt-9 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-[14px] text-slate-400">
                选择成员后，将展示身份与单价配置区。
              </div>
            )}
          </div>

          <div className="mt-4 flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-white pt-5">
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
              确定
            </button>
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
          邀请成功
        </div>
      </div>
    </>
  );
}
