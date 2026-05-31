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
            <div className="grid min-w-0 gap-2 sm:grid-cols-[auto_minmax(0,1fr)]">
                <Button
                    ref={setActivatorNodeRef}
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Drag to reorder"
                    className="h-9 w-9 cursor-grab active:cursor-grabbing"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-4 w-4" />
                </Button>

                <div className="min-w-0">{children}</div>
            </div>
        </div>
    );
}