"use client";

import type { ReactNode } from "react";
import { GripVertical } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

import { Button } from "@/components/ui/button";

type SortableQueryNodeProps = {
    id: string;
    parentGroupId: string;
    children: ReactNode;
};

export function SortableQueryNode({
    id,
    parentGroupId,
    children,
}: SortableQueryNodeProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id,
        data: {
            parentGroupId,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={
                isDragging
                    ? "min-w-0 opacity-60 transition-opacity duration-150"
                    : "min-w-0 transition-opacity duration-150"
            }
        >
            <div className="grid min-w-0 grid-cols-[1.25rem_minmax(0,1fr)] items-stretch gap-1">
                <Button
                    ref={setActivatorNodeRef}
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Drag to reorder"
                    className="h-full min-h-7 w-5 cursor-grab rounded-none border-0 bg-transparent p-0 text-muted-foreground hover:bg-transparent hover:text-foreground active:cursor-grabbing"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-3.5 w-3.5" />
                </Button>

                <div className="min-w-0">{children}</div>
            </div>
        </div>
    );
}