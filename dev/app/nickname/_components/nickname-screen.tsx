"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { AppBar, Button, Chip, Input } from "@/components/ui";
import { nicknameSchema } from "../_lib/nickname-schema";

export function NicknameScreen() {
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const {
    register,
    control,
    formState: { errors, isValid }
  } = useForm<z.infer<typeof nicknameSchema>>({
    resolver: zodResolver(nicknameSchema),
    mode: "onChange",
    defaultValues: { nickname: "" }
  });
  const nickname = useWatch({ control, name: "nickname" }) ?? "";
  const nicknameLength = nickname.length;
  const isAvailable = isValid && nickname !== "admin";
  const canComplete = isAvailable && selectedAge && selectedGender;
  const ageOptions = ["10대", "20대", "30대", "40대+"];
  const genderOptions = ["여성", "남성"];

  return (
    <>
      <AppBar title="닉네임 설정" />
      <div className="body-scroll flex flex-col">
        <div className="pt-8">
          <h1 className="text-[21px] font-bold leading-tight">
            사용할 닉네임을
            <br />
            정해주세요
          </h1>
          <p className="mt-2 text-[13px] leading-6 text-[var(--cb-text-2)]">방장이 보는 카드, 오픈채팅에서 사용돼요.</p>
        </div>
        <div className="mt-8">
          <Input
            label="닉네임"
            maxLength={12}
            placeholder="닉네임 입력"
            error={errors.nickname?.message}
            {...register("nickname")}
          />
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className={isAvailable ? "font-semibold text-[var(--cb-yellow)]" : "text-[var(--cb-text-3)]"}>
              {nicknameLength === 0 ? "한글·영문·숫자·_ 만 가능. 2 ~ 12자." : isAvailable ? "사용 가능한 닉네임 형식이에요." : "닉네임을 확인해 주세요."}
            </span>
            <span className="text-[var(--cb-text-3)]">{nicknameLength} / 12</span>
          </div>
        </div>
        <section className="mt-6">
          <div className="mb-2 flex items-center gap-2 text-[12.5px] font-semibold text-[var(--cb-text-2)]">
            연령대
            <span className="rounded-[var(--r-pill)] border border-[var(--cb-yellow-line)] bg-[var(--cb-yellow-dim)] px-2 py-0.5 text-[10px] font-bold text-[var(--cb-yellow)]">
              필수
            </span>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="연령대 선택">
            {ageOptions.map((age) => (
              <Chip
                key={age}
                active={selectedAge === age}
                aria-pressed={selectedAge === age}
                onClick={() => setSelectedAge(age)}
                type="button"
              >
                {age}
              </Chip>
            ))}
          </div>
        </section>
        <section className="mt-5">
          <div className="mb-2 flex items-center gap-2 text-[12.5px] font-semibold text-[var(--cb-text-2)]">
            성별
            <span className="rounded-[var(--r-pill)] border border-[var(--cb-yellow-line)] bg-[var(--cb-yellow-dim)] px-2 py-0.5 text-[10px] font-bold text-[var(--cb-yellow)]">
              필수
            </span>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="성별 선택">
            {genderOptions.map((gender) => (
              <Chip
                key={gender}
                active={selectedGender === gender}
                aria-pressed={selectedGender === gender}
                onClick={() => setSelectedGender(gender)}
                type="button"
              >
                {gender}
              </Chip>
            ))}
          </div>
        </section>
        <p className="mt-5 rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[var(--cb-surface-1)] p-3 text-[11.5px] leading-5 text-[var(--cb-text-3)]">
          연령대·성별은 방장이 승인 여부를 판단할 때 도움이 돼요. 선택한 정보는 나중에 프로필에서 수정할 수 있어요.
        </p>
        <div className="mt-auto pt-6">
          {canComplete ? (
            <Link href="/home">
              <Button>완료</Button>
            </Link>
          ) : (
            <Button disabled className="bg-[var(--cb-surface-2)] text-[var(--cb-text-3)] shadow-none">
              완료
            </Button>
          )}
          <p className="mt-2 text-center text-[11px] text-[var(--cb-text-3)]">
            {canComplete ? "입력한 정보로 BuddyDuck을 시작해요." : "닉네임, 연령대, 성별을 모두 입력해 주세요."}
          </p>
        </div>
      </div>
    </>
  );
}
