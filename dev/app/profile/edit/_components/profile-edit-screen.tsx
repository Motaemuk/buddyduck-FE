"use client";

import Link from "next/link";
import { Camera } from "lucide-react";
import { useState } from "react";
import { AppBar, Chip } from "@/components/ui";
import { BackButton } from "../../../_components/buddy-patterns";
import { myProfile } from "@/lib/data";

const profileAgeOptions = ["10대", "20대", "30대", "40대+", "비공개"];
const profileGenderOptions = ["여성", "남성"];

export function ProfileEditScreen() {
  const [nickname, setNickname] = useState(myProfile.nickname);
  const [selectedAge, setSelectedAge] = useState(myProfile.ageGroup);
  const [selectedGender, setSelectedGender] = useState(myProfile.gender);
  const nicknameLength = Array.from(nickname).length;
  const canSave = nicknameLength >= 2 && nicknameLength <= 12;
  const onNicknameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = Array.from(event.target.value).slice(0, 12).join("");
    setNickname(nextValue);
  };

  return (
    <>
      <AppBar title="프로필 수정" left={<BackButton href="/profile" />} right={<span className="w-[38px]" />} />
      <h1 className="sr-only">프로필 수정</h1>
      <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => event.preventDefault()}>
        <div className="flex min-h-0 flex-1 flex-col overflow-auto px-4 pb-[18px] pt-2">
          <button className="relative mx-auto my-1 h-[104px] w-[104px]" type="button" aria-label="사진 변경">
            <span className="flex h-[104px] w-[104px] items-center justify-center rounded-full border border-[var(--cb-line-2)] bg-[var(--cb-surface-3)] text-[34px] font-extrabold text-[var(--cb-text-2)]">
              {myProfile.avatar}
            </span>
            <span className="absolute bottom-0 right-0 flex h-[34px] w-[34px] items-center justify-center rounded-full border-[3px] border-[var(--cb-bg)] bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)]">
              <Camera size={16} />
            </span>
          </button>
          <button className="mx-auto mb-[18px] mt-1 text-[12px] font-semibold text-[var(--cb-yellow)]" type="button">
            사진 변경
          </button>

          <label className="flex flex-col gap-2">
            <span className="text-[12.5px] font-semibold text-[var(--cb-text-2)]">닉네임</span>
            <input
              aria-describedby="profile-nickname-count"
              className="min-h-[48px] rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[var(--cb-surface-2)] px-3.5 py-3 text-[14px] text-[var(--cb-text)] outline-none placeholder:text-[var(--cb-text-3)] focus:border-[var(--cb-yellow-line)]"
              maxLength={12}
              onChange={onNicknameChange}
              value={nickname}
            />
          </label>
          <div id="profile-nickname-count" className="mt-1 text-right text-[11px] text-[var(--cb-text-3)]">
            {nicknameLength} / 12
          </div>

          <ProfileChoiceGroup
            label="연령대"
            options={profileAgeOptions}
            selected={selectedAge}
            onSelect={setSelectedAge}
            className="mt-4"
          />
          <ProfileChoiceGroup
            label="성별"
            options={profileGenderOptions}
            selected={selectedGender}
            onSelect={setSelectedGender}
            className="mt-[18px]"
          />

          <p className="mt-4 text-[11.5px] leading-[1.55] text-[var(--cb-text-3)]">
            연령대·성별은 방장이 승인 여부를 판단할 때 도움이 돼요. 언제든 다시 수정/숨김 가능합니다.
          </p>
        </div>
        <div className="shrink-0 border-t border-[var(--cb-line)] bg-[linear-gradient(transparent,var(--cb-bg)_22%)] px-4 py-3">
          {canSave ? (
            <Link
              href="/profile"
              className="flex h-[54px] w-full items-center justify-center rounded-[var(--r-md)] border border-[var(--cb-yellow)] bg-[var(--cb-yellow)] text-[15px] font-bold text-[var(--cb-on-yellow)] shadow-[var(--sh-glow)]"
            >
              저장
            </Link>
          ) : (
            <button
              className="flex h-[54px] w-full cursor-not-allowed items-center justify-center rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[var(--cb-surface-2)] text-[15px] font-bold text-[var(--cb-text-3)]"
              disabled
              type="button"
            >
              저장
            </button>
          )}
        </div>
      </form>
    </>
  );
}

function ProfileChoiceGroup({
  label,
  options,
  selected,
  onSelect,
  className
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mb-[9px] text-[12.5px] font-semibold text-[var(--cb-text-2)]">
        {label} <span className="font-normal text-[var(--cb-text-3)]">(선택)</span>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={`${label} 선택`}>
        {options.map((option) => (
          <Chip
            key={option}
            active={selected === option}
            aria-pressed={selected === option}
            onClick={() => onSelect(option)}
            type="button"
          >
            {option}
          </Chip>
        ))}
      </div>
    </section>
  );
}
