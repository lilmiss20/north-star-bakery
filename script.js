(function () {
"use strict";
/* North Star Bakery: Touchstone 4. The website remains a demonstration; no orders are transmitted. */
const FAVORITES_KEY = "nsb:favorites:v1";
const REQUEST_TYPE_KEY = "nsb:requestType:v1";
const productCatalog = [
  { id: "sourdough", name: "Country sourdough", detail: "Tangy, slow-risen loaf" },
  { id: "wholegrain", name: "Whole-grain sandwich bread", detail: "Hearty and sliceable" },
  { id: "croissant", name: "Butter croissant", detail: "Flaky morning favorite" },
  { id: "cinnamon", name: "Cinnamon roll", detail: "A cozy sweet treat" },
  { id: "cake", name: "Celebration cake", detail: "A special-occasion favorite" }
];
const validationRules = {
  "customer-name": { required: true, minLength: 2, label: "Name" },
  "customer-email": { required: true, email: true, label: "Email" },
  "request-type": { required: true, label: "Request type" },
  "item-details": { required: true, minLength: 10, label: "Item details or question" }
};
let favoriteIds = [];

function readStoredValue(key, fallback) {
  try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); }
  catch (error) { return fallback; } // Browsing modes that disable storage still allow page interaction.
}
function saveStoredValue(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (error) { /* Interactions still work in this tab if browser storage is unavailable. */ }
}
function loadFavorites() {
  const saved = readStoredValue(FAVORITES_KEY, []);
  return Array.isArray(saved) ? [...new Set(saved.filter(id => productCatalog.some(item => item.id === id)))] : [];
}
function favoriteProducts() {
  return productCatalog.filter(product => favoriteIds.includes(product.id));
}
function toggleFavorite(id) {
  favoriteIds = favoriteIds.includes(id) ? favoriteIds.filter(savedId => savedId !== id) : [...favoriteIds, id];
  saveStoredValue(FAVORITES_KEY, favoriteIds);
  renderFavorites();
}
function renderFavorites() {
  const options = document.getElementById("favorite-options");
  if (!options) return;
  options.replaceChildren();
  for (const product of productCatalog) {
    const choice = document.createElement("div"); choice.className = "favorite-choice";
    const info = document.createElement("div");
    const title = document.createElement("h3"); title.textContent = product.name;
    const detail = document.createElement("p"); detail.textContent = product.detail;
    info.append(title, detail);
    const selected = favoriteIds.includes(product.id);
    const button = document.createElement("button"); button.type = "button";
    button.textContent = selected ? "Saved ✓" : "Save favorite";
    button.setAttribute("aria-pressed", String(selected));
    button.setAttribute("aria-label", (selected ? "Remove " : "Save ") + product.name + (selected ? " from favorites" : " to favorites"));
    button.addEventListener("click", () => toggleFavorite(product.id));
    choice.append(info, button); options.append(choice);
  }
  const favorites = favoriteProducts();
  document.getElementById("favorite-count").textContent =
    `${favorites.length} favorite${favorites.length === 1 ? "" : "s"} saved`;
  const list = document.getElementById("favorites-list"); list.replaceChildren();
  favorites.forEach(product => { const item = document.createElement("li"); item.textContent = product.name; list.append(item); });
  document.getElementById("favorite-feedback").textContent = favorites.length
    ? "Saved in this browser. Visit Contact and Preorder to use your list."
    : "Pick a treat to start your list.";
}
function showFieldError(field, message) {
  const error = document.getElementById(field.id + "-error");
  if (error) error.textContent = message;
  if (message) field.setAttribute("aria-invalid", "true");
  else field.removeAttribute("aria-invalid");
}
function validateField(field) {
  const rule = validationRules[field.id];
  if (!rule) return true;
  const value = field.value.trim();
  let message = "";
  if (rule.required && !value) message = `Please enter ${rule.label.toLowerCase() === "request type" ? "a request type" : "your " + rule.label.toLowerCase()}.`;
  else if (rule.minLength && value.length < rule.minLength)
    message = `${rule.label} must be at least ${rule.minLength} characters.`;
  else if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    message = "Please enter a valid email address, such as name@example.com.";
  showFieldError(field, message);
  return !message;
}
function fillFavoriteDetails() {
  const details = document.getElementById("item-details");
  const productNames = favoriteProducts().map(product => product.name).join(", ");
  if (!details || !productNames) return;
  const starter = `My saved bakery favorites: ${productNames}.`;
  if (!details.value.includes(starter)) details.value = details.value.trim() ? details.value.trim() + "\n" + starter : starter;
  validateField(details);
  details.focus();
}
function setUpContactForm() {
  const form = document.getElementById("bakery-request-form");
  if (!form) return;
  const remembered = readStoredValue(REQUEST_TYPE_KEY, "");
  const requestType = document.getElementById("request-type");
  if (typeof remembered === "string" && [...requestType.options].some(option => option.value === remembered))
    requestType.value = remembered;
  requestType.addEventListener("change", () => saveStoredValue(REQUEST_TYPE_KEY, requestType.value));
  const favorites = favoriteProducts();
  document.getElementById("saved-request-items").textContent = favorites.length
    ? `Your saved favorites: ${favorites.map(product => product.name).join(", ")}.`
    : "No saved favorites yet. Choose some on the Products page, then return here.";
  const apply = document.getElementById("use-favorites");
  apply.disabled = !favorites.length;
  apply.addEventListener("click", fillFavoriteDetails);
  Object.keys(validationRules).forEach(id => {
    const field = document.getElementById(id);
    field.addEventListener("input", () => { if (field.hasAttribute("aria-invalid")) validateField(field); });
    field.addEventListener("change", () => { if (field.hasAttribute("aria-invalid")) validateField(field); });
  });
  form.addEventListener("submit", event => {
    event.preventDefault(); // The school demonstration does not send contact details to a server.
    const summary = document.getElementById("form-summary"); summary.hidden = true;
    const invalid = Object.keys(validationRules).map(id => document.getElementById(id)).filter(field => !validateField(field));
    if (invalid.length) { invalid[0].focus(); return; }
    summary.textContent = "Demo request reviewed successfully. Your information is not sent to a bakery. For a real preorder, contact the bakery directly.";
    summary.hidden = false;
    summary.scrollIntoView({block: "nearest", behavior: "auto"});
  });
}
document.addEventListener("DOMContentLoaded", () => {
  favoriteIds = loadFavorites();
  renderFavorites();
  setUpContactForm();
});

})();
