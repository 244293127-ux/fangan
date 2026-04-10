export type Member = {
  uid: string;
  nickname: string;
};

export type RoleKey = "editor" | "reviewer" | "narrator" | "dialogue";

export type RoleConfig = {
  key: RoleKey;
  label: string;
  unit: string;
};

export const mockMembers: Member[] = [
  { uid: "123456", nickname: "蛇恋就是最好嗑的" },
  { uid: "128447390", nickname: "青木原声" },
  { uid: "682140975", nickname: "言外之音" },
  { uid: "451902638", nickname: "深夜校音室" },
  { uid: "905773214", nickname: "云边对白组" },
  { uid: "556184203", nickname: "北辰后期" },
  { uid: "710245688", nickname: "落纸成声" },
  { uid: "834196275", nickname: "雾屿旁白" },
  { uid: "249317560", nickname: "木川审听间" },
  { uid: "618420937", nickname: "对白练习生" },
  { uid: "972341508", nickname: "风起录音棚" },
  { uid: "305784126", nickname: "晚舟有声" },
];

export const roleConfigs: RoleConfig[] = [
  { key: "editor", label: "编辑", unit: "元/万字" },
  { key: "reviewer", label: "审听", unit: "元/小时" },
  { key: "narrator", label: "旁白", unit: "元/小时" },
  { key: "dialogue", label: "对白", unit: "元/小时" },
];

export function formatMember(member: Member) {
  return `[${member.uid}] ${member.nickname}`;
}

export function createManualMember(uid: string): Member {
  return {
    uid,
    nickname: "",
  };
}
