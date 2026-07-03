import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { assetUrl } from "../../api/client.js";
import type { ScreenDto, TrainerDto } from "../../api/types.js";
import { useTrainerStore } from "../../store/trainer-store.js";
import { ScreenUploadDropzone } from "./ScreenUploadDropzone.js";

interface ItemProps {
  screen: ScreenDto;
  index: number;
  selected: boolean;
  onSelect: () => void;
}

function ScreenListItem({ screen, index, selected, onSelect }: ItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: screen.id });
  const deleteScreen = useTrainerStore((s) => s.deleteScreen);

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={selected ? "screen-list__item screen-list__item--selected" : "screen-list__item"}
      {...attributes}
      {...listeners}
    >
      <button type="button" className="screen-list__thumb" onClick={onSelect}>
        <img src={assetUrl(screen.imageUrl)} alt={`Экран ${index + 1}`} />
        <span>{index + 1}</span>
      </button>
      <button
        type="button"
        className="screen-list__delete"
        onClick={(e) => {
          e.stopPropagation();
          void deleteScreen(screen.id);
        }}
        aria-label="Удалить экран"
      >
        ×
      </button>
    </li>
  );
}

interface Props {
  trainer: TrainerDto;
  selectedScreenId: string | null;
  onSelect: (screenId: string) => void;
}

export function ScreenList({ trainer, selectedScreenId, onSelect }: Props) {
  const reorderScreens = useTrainerStore((s) => s.reorderScreens);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = trainer.screens.map((s) => s.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    const reordered = [...ids];
    reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, String(active.id));
    void reorderScreens(reordered);
  }

  return (
    <div className="screen-list">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={trainer.screens.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <ul>
            {trainer.screens.map((screen, index) => (
              <ScreenListItem
                key={screen.id}
                screen={screen}
                index={index}
                selected={screen.id === selectedScreenId}
                onSelect={() => onSelect(screen.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <ScreenUploadDropzone />
    </div>
  );
}
