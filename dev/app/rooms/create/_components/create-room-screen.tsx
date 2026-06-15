"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Info } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AppBar, Button, Input } from "@/components/ui";
import { BackButton, Badge } from "../../../_components/buddy-patterns";
import { useCreateRoomMutation } from "@/lib/api";
import { cn } from "@/lib/utils";
import { TagSelectionSheet } from "../../_components/tag-selection-sheet";
import { roomSchema } from "../_lib/room-schema";

const CREATE_ROOM_MAX_TAGS = 4;

export function CreateRoomScreen() {
  const router = useRouter();
  const mutation = useCreateRoomMutation();
  const [selected, setSelected] = useState<string[]>([]);
  const [maxMembers, setMaxMembers] = useState(4);
  const [hasOvernight, setHasOvernight] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const meetTimeInputRef = useRef<HTMLInputElement | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<z.infer<typeof roomSchema>>({
    resolver: zodResolver(roomSchema),
    mode: "onChange",
    defaultValues: {
      title: "굿즈 줄 같이 서고 카페까지 같이 가요",
      intro: "조용히 줄서고, 카페 갔다가 같이 입장해요. 응원봉 챙겨와주세요.",
      meetPlace: "",
      meetTime: "2026-06-15T14:00",
      openChatUrl: "",
      openChatPassword: ""
    }
  });
  const meetTimeField = register("meetTime");
  const closeTagModal = useCallback(() => setShowTagModal(false), []);
  const openMeetTimePicker = useCallback(() => {
    const input = meetTimeInputRef.current;
    if (typeof input?.showPicker !== "function") return;

    try {
      input.showPicker();
    } catch {
      // Some browsers throw when native picker access is unavailable.
    }
  }, []);
  const handleMeetTimePointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      event.preventDefault();
      openMeetTimePicker();
    },
    [openMeetTimePicker]
  );
  const toggleRoomTag = useCallback((tag: string) => {
    setSelected((current) => {
      if (current.includes(tag)) return current.filter((item) => item !== tag);
      if (current.length >= CREATE_ROOM_MAX_TAGS) return current;
      return [...current, tag];
    });
  }, []);

  return (
    <>
      <AppBar title="방 만들기" left={<BackButton href="/rooms" icon="close" />} right={<span className="w-[38px]" />} />
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={handleSubmit((values) => {
          mutation.mutate({ title: values.title, tags: selected });
          router.push("/rooms/host");
        })}
      >
        <div className="mx-4 mt-3 flex shrink-0 items-start gap-2.5 rounded-[var(--r-md)] border border-[var(--cb-yellow-line)] bg-[var(--cb-yellow-dim)] px-3.5 py-3 text-[12px] leading-[1.5] text-[var(--cb-yellow-2)]">
          <Info className="mt-px shrink-0 text-[var(--cb-yellow)]" size={17} />
          <div>
            이 방은 <b className="font-bold text-[var(--cb-yellow)]">방장 승인</b>으로 입장이 결정돼요. 선착순이 아니에요.
          </div>
        </div>
        <div className="body-scroll flex flex-col gap-4 !pb-28 !pt-[6px]">
          <CreateRoomField label="공연">
            <DisabledFormInput label="공연" value="Stadium Tour — Night 1" right="2026.06.15" />
          </CreateRoomField>
          <Input label="방 제목" error={errors.title?.message} {...register("title")} />
          <Input label="한 줄 소개" multiline error={errors.intro?.message} {...register("intro")} />
          <CreateRoomField label="방 태그" optional="(최대 4개)">
            <div className="flex flex-wrap gap-1.5">
              {selected.map((tag) => (
                <Badge key={tag} tone="yellow">
                  {tag}
                </Badge>
              ))}
              <button
                aria-label="태그 추가"
                className="inline-flex items-center gap-1 rounded-[var(--r-pill)] border border-dashed border-[var(--cb-line-2)] bg-transparent px-2.5 py-1 text-[11px] font-semibold text-[var(--cb-text-2)] transition duration-150 hover:border-[var(--cb-yellow-line)] hover:bg-[var(--cb-yellow-dim)] hover:text-[var(--cb-yellow-2)] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)]"
                onClick={() => setShowTagModal(true)}
                type="button"
              >
                + 추가
              </button>
            </div>
          </CreateRoomField>
          <div className="grid grid-cols-2 gap-3">
            <CreateRoomField label="최대 인원">
              <div className="relative">
                <select
                  aria-label="최대 인원"
                  className="min-h-[48px] w-full appearance-none rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[var(--cb-surface-2)] px-3.5 pr-9 text-sm text-[var(--cb-text)] outline-none transition duration-150 hover:border-[var(--cb-line-2)] focus:border-[var(--cb-yellow-line)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)]"
                  onChange={(event) => setMaxMembers(Number(event.target.value))}
                  value={maxMembers}
                >
                  {[2, 3, 4, 5, 6, 7, 8].map((count) => (
                    <option key={count} value={count}>
                      {count}명
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--cb-text-3)]" size={15} />
              </div>
            </CreateRoomField>
            <CreateRoomField label="1박 일정">
              <button
                aria-pressed={hasOvernight}
                className="flex min-h-[48px] w-full items-center justify-between rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[var(--cb-surface-2)] px-3.5 text-left text-sm text-[var(--cb-text)] transition duration-150 hover:border-[var(--cb-line-2)] hover:bg-[var(--cb-surface-3)] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)]"
                onClick={() => setHasOvernight((value) => !value)}
                type="button"
              >
                <span>1박 포함</span>
                <span
                  className={cn(
                    "relative h-7 w-[46px] rounded-[var(--r-pill)] border transition",
                    hasOvernight ? "border-[var(--cb-yellow)] bg-[var(--cb-yellow)]" : "border-[var(--cb-line-2)] bg-[var(--cb-surface-3)]"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-[22px] w-[22px] rounded-full transition",
                      hasOvernight ? "right-0.5 bg-[var(--cb-on-yellow)]" : "left-0.5 bg-white"
                    )}
                  />
                </span>
              </button>
            </CreateRoomField>
          </div>
          <CreateRoomField label="행사 장소 (공연장)" hint="일정 역산과 도착 버퍼 30분의 기준점">
            <DisabledFormInput label="행사 장소 (공연장)" value="KSPO Dome" />
          </CreateRoomField>
          <Input label="집합 장소" placeholder="장소 검색 또는 주소로 등록" error={errors.meetPlace?.message} {...register("meetPlace")} />
          <Input
            label="집합 시간"
            type="datetime-local"
            className="cursor-pointer select-none caret-transparent focus:border-[var(--cb-line)]"
            error={errors.meetTime?.message}
            {...meetTimeField}
            onPointerDown={handleMeetTimePointerDown}
            ref={(element) => {
              meetTimeField.ref(element);
              meetTimeInputRef.current = element as HTMLInputElement | null;
            }}
          />
          <Input label="오픈채팅 URL (승인 후 공개)" placeholder="https://open.kakao.com/..." {...register("openChatUrl")} />
          <Input label="오픈채팅 비밀번호 (선택)" placeholder="4 ~ 8자리 숫자/문자" {...register("openChatPassword")} />
        </div>
        <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t border-[var(--cb-line)] bg-[rgba(14,14,16,.94)] p-4 pb-[calc(16px+env(safe-area-inset-bottom))] backdrop-blur">
          <Button disabled={mutation.isPending || selected.length === 0}>{mutation.isPending ? "저장 중" : "방 만들기"}</Button>
        </div>
        {showTagModal ? (
          <TagSelectionSheet
            title="방 태그 선택"
            description={`최대 ${CREATE_ROOM_MAX_TAGS}개까지 선택 · 사전 정의된 태그에서 골라요`}
            selectedTags={selected}
            maxTags={CREATE_ROOM_MAX_TAGS}
            onToggle={toggleRoomTag}
            onDismiss={closeTagModal}
            actions={
              <>
                <button
                  className="inline-flex h-[50px] items-center justify-center rounded-[var(--r-md)] border border-[var(--cb-line-2)] bg-[var(--cb-surface-2)] text-[14px] font-bold text-[var(--cb-text)] transition duration-150 hover:bg-[var(--cb-surface-3)] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)]"
                  onClick={closeTagModal}
                  type="button"
                >
                  취소
                </button>
                <button
                  className="inline-flex h-[50px] items-center justify-center rounded-[var(--r-md)] border border-[var(--cb-yellow)] bg-[var(--cb-yellow)] text-[14px] font-bold text-[var(--cb-on-yellow)] shadow-[var(--sh-glow)] transition duration-150 hover:bg-[var(--cb-yellow-2)] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)]"
                  onClick={closeTagModal}
                  type="button"
                >
                  저장 ({selected.length}/{CREATE_ROOM_MAX_TAGS})
                </button>
              </>
            }
          />
        ) : null}
      </form>
    </>
  );
}

function CreateRoomField({
  label,
  optional,
  hint,
  children
}: {
  label: string;
  optional?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[12.5px] font-semibold text-[var(--cb-text-2)]">
        {label} {optional ? <span className="font-normal text-[var(--cb-text-3)]">{optional}</span> : null}
      </div>
      {children}
      {hint ? <div className="text-[11.5px] leading-[1.55] text-[var(--cb-text-3)]">{hint}</div> : null}
    </div>
  );
}

function DisabledFormInput({
  label,
  value,
  right
}: {
  label: string;
  value: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <input
        aria-label={label}
        className={cn(
          "min-h-[48px] w-full rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[var(--cb-surface-2)] px-3.5 py-3 text-sm text-[var(--cb-text-2)] outline-none disabled:cursor-not-allowed disabled:opacity-100",
          right && "pr-28"
        )}
        disabled
        readOnly
        value={value}
      />
      {right ? (
        <span className="pointer-events-none absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center text-sm text-[var(--cb-text-3)]">
          {right}
        </span>
      ) : null}
    </div>
  );
}
