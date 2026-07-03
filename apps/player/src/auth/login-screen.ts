const VALID_USERNAME = "test";
const VALID_PASSWORD = "test";

export interface LoginScreenOptions {
  onSuccess: () => void;
}

export function renderLoginScreen(container: HTMLElement, options: LoginScreenOptions): void {
  container.innerHTML = "";
  container.className = "gv-login";

  const form = document.createElement("form");
  form.className = "gv-login__form";

  const heading = document.createElement("h2");
  heading.textContent = "Вход в тренажёр";

  const usernameLabel = document.createElement("label");
  usernameLabel.className = "field";
  const usernameSpan = document.createElement("span");
  usernameSpan.textContent = "Логин";
  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.autocomplete = "username";
  usernameLabel.append(usernameSpan, usernameInput);

  const passwordLabel = document.createElement("label");
  passwordLabel.className = "field";
  const passwordSpan = document.createElement("span");
  passwordSpan.textContent = "Пароль";
  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.autocomplete = "current-password";
  passwordLabel.append(passwordSpan, passwordInput);

  const errorEl = document.createElement("p");
  errorEl.className = "gv-login__error";
  errorEl.setAttribute("role", "alert");

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Войти";

  form.append(heading, usernameLabel, passwordLabel, errorEl, submitButton);
  container.appendChild(form);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (usernameInput.value === VALID_USERNAME && passwordInput.value === VALID_PASSWORD) {
      options.onSuccess();
    } else {
      errorEl.textContent = "Неверный логин или пароль";
      passwordInput.value = "";
      passwordInput.focus();
    }
  });

  usernameInput.focus();
}
