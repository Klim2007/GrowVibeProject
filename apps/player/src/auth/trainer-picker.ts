interface TrainerSummary {
  id: string;
  title: string;
  status: "draft" | "published";
  updatedAt: string;
}

export interface TrainerPickerOptions {
  apiBase: string;
  onSelect: (trainerId: string) => void;
}

export async function renderTrainerPicker(container: HTMLElement, options: TrainerPickerOptions): Promise<void> {
  container.innerHTML = "";
  container.className = "gv-trainer-picker";

  const heading = document.createElement("h2");
  heading.textContent = "Выберите тренажёр";
  container.appendChild(heading);

  try {
    const res = await fetch(`${options.apiBase}/api/trainers`);
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const trainers = (await res.json()) as TrainerSummary[];

    if (trainers.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "Нет доступных тренажёров.";
      container.appendChild(empty);
      return;
    }

    const list = document.createElement("ul");
    list.className = "gv-trainer-picker__list";
    for (const trainer of trainers) {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gv-trainer-picker__item";
      button.textContent = trainer.title;
      button.addEventListener("click", () => options.onSelect(trainer.id));
      item.appendChild(button);
      list.appendChild(item);
    }
    container.appendChild(list);
  } catch (err) {
    const errorEl = document.createElement("p");
    errorEl.className = "gv-login__error";
    errorEl.textContent = `Не удалось загрузить список тренажёров: ${err instanceof Error ? err.message : String(err)}`;
    container.appendChild(errorEl);
  }
}
