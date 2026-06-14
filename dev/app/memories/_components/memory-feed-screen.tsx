"use client";

import { Camera, MoreHorizontal, Plus } from "lucide-react";
import { AppBar, Button, Card } from "@/components/ui";
import { BackButton, Badge } from "../../_components/buddy-patterns";
import { memories } from "@/lib/data";

export function MemoryFeedScreen() {
  return (
    <>
      <AppBar
        title="우리 방 추억"
        left={<BackButton href="/timeline" />}
        right={
          <Button size="icon" variant="outline" aria-label="더보기">
            <MoreHorizontal size={18} />
          </Button>
        }
      />
      <div className="flex items-center justify-between border-y border-[var(--cb-line)] px-4 py-3">
        <Badge tone="yellow">그룹</Badge>
        <span className="text-[11px] text-[var(--cb-text-3)]">사진 12 · 영상 3</span>
      </div>
      <div className="body-scroll">
        <div className="grid grid-cols-2 gap-3">
          {memories.map((memory, index) => (
            <Card key={memory.id} className="overflow-hidden p-0">
              <div className="ph grid aspect-square place-items-center text-[12px] font-black text-white/60">MEM {index + 1}</div>
              <div className="p-3">
                <div className="truncate text-[12.5px] font-bold">{memory.concertTitle}</div>
                <div className="mt-1 text-[11px] text-[var(--cb-text-3)]">{memory.date}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <div className="shrink-0 border-t border-[var(--cb-line)] p-3">
        <div className="mb-2 flex gap-2 text-[11px] text-[var(--cb-text-2)]">
          <Badge><Camera size={13} /> 사진</Badge>
          <Badge>VIDEO ≤60s</Badge>
        </div>
        <Button>
          <Plus size={18} /> 업로드
        </Button>
      </div>
    </>
  );
}
