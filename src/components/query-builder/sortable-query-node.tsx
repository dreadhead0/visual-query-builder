"use client";

import { GripVertical } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

import { Button } from "@/components/ui/button";

type SortableQueryNodeProps = {
    id: string;
    parentGroupId: string;
    children: React.ReactNode;
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
                    ? "opacity-60 transition-opacity duration-150"
                    : "transition-opacity duration-150"
            }
        >
            <div className="grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)]">
                <Button
                    ref={setActivatorNodeRef}
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Drag to reorder"
                    className="h-9 w-9 cursor-grab active:cursor-grabbing transition-colors"
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