import { useEffect, useState } from "react";
import { createTrainer, listTrainers } from "../api/trainers.js";
import type { TrainerSummaryDto } from "../api/types.js";

interface Props {
  onOpen: (trainerId: string) => void;
}

export function ProjectListPage({ onOpen }: Props) {
  const [trainers, setTrainers] = useState<TrainerSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");

  async function refresh() {
    setLoading(true);
    setTrainers(await listTrainers());
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleCreate() {
    if (!newTitle.trim()) return;
    const trainer = await createTrainer({ title: newTitle.trim() });
    setNewTitle("");
    onOpen(trainer.id);
  }

  return (
    <div className="project-list-page">
      <h1>Тренажёры</h1>

      <div className="project-list-page__create">
        <input
          type="text"
          placeholder="Название нового тренажёра"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void handleCreate()}
        />
        <button type="button" onClick={() => void handleCreate()}>
          Создать
        </button>
      </div>

      {loading ? (
        <p className="page-status">Загрузка...</p>
      ) : trainers.length === 0 ? (
        <p className="page-status">Пока нет ни одного тренажёра.</p>
      ) : (
        <ul className="project-list">
          {trainers.map((trainer) => (
            <li key={trainer.id}>
              <button type="button" className="project-list__item" onClick={() => onOpen(trainer.id)}>
                <span>{trainer.title}</span>
                <span className="project-list__status">{trainer.status === "draft" ? "черновик" : "опубликован"}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
