(() => {
  "use strict";

  const ACCESS_HASH = "d14f1d5dcb93fb9e77553e12cea9ffebd2039b7b2c4aa6f22b8d8dc2f0ffe7b9";
  const SESSION_KEY = "tiles-space-preview-access";
  const root = document.documentElement;
  const gate = document.querySelector("#access-gate");
  const form = gate?.querySelector(".access-form");
  const passwordInput = form?.elements.password;
  const error = gate?.querySelector(".access-error");
  const siteContent = Array.from(document.body.children).filter((element) => element !== gate);

  const setSiteInert = (locked) => {
    siteContent.forEach((element) => {
      if (locked) {
        element.setAttribute("inert", "");
        element.setAttribute("aria-hidden", "true");
      } else {
        element.removeAttribute("inert");
        element.removeAttribute("aria-hidden");
      }
    });
  };

  const unlock = ({ animate = true } = {}) => {
    setSiteInert(false);
    root.classList.remove("is-locked");

    if (!gate) return;
    gate.classList.add("is-unlocking");

    const removeGate = () => gate.remove();
    if (animate) {
      gate.addEventListener("transitionend", removeGate, { once: true });
      window.setTimeout(removeGate, 800);
    } else {
      removeGate();
    }
  };

  const digest = async (value) => {
    const bytes = new TextEncoder().encode(value);
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
  };

  if (sessionStorage.getItem(SESSION_KEY) === ACCESS_HASH) {
    unlock({ animate: false });
    return;
  }

  setSiteInert(true);
  window.requestAnimationFrame(() => passwordInput?.focus());

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = passwordInput.value;

    if (!password) {
      error.textContent = "パスワードを入力してください。";
      passwordInput.focus();
      return;
    }

    const submittedHash = await digest(password);
    if (submittedHash !== ACCESS_HASH) {
      error.textContent = "パスワードが正しくありません。";
      passwordInput.select();
      return;
    }

    sessionStorage.setItem(SESSION_KEY, ACCESS_HASH);
    error.textContent = "";
    unlock();
  });
})();
