const projectGrid = document.querySelector("#project-grid");
const projectCards = [...document.querySelectorAll(".project-card")];
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const projectCount = document.querySelector("#project-count");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#project-search");
const dialog = document.querySelector("#project-dialog");
const projectForm = document.querySelector("#project-form");
const projectName = document.querySelector("#project-name");
const toast = document.querySelector("#toast");
let activeFilter = "all";
let toastTimeout;

function updateProjects() {
  const query = searchInput.value.trim().toLowerCase();
  let visible = 0;
  for (const card of projectCards) {
    const matchesFilter = activeFilter === "all" || card.dataset.status === activeFilter;
    const matchesSearch = !query || card.dataset.search.includes(query) || card.querySelector("h3").textContent.toLowerCase().includes(query);
    const show = matchesFilter && matchesSearch;
    card.hidden = !show;
    if (show) visible += 1;
  }
  projectCount.textContent = activeFilter === "active"
    ? `${visible} active projects`
    : activeFilter === "complete"
      ? `${visible} completed projects`
      : `${visible} projects`;
  emptyState.hidden = visible !== 0;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach(item => {
      const selected = item === button;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    updateProjects();
  });
});

searchInput.addEventListener("input", updateProjects);
document.addEventListener("keydown", event => {
  if (event.key === "/" && document.activeElement !== searchInput && !dialog.open) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === "Escape" && dialog.open) dialog.close();
});

document.querySelectorAll("[data-view]").forEach(button => {
  button.addEventListener("click", () => {
    const view = button.dataset.view;
    document.querySelectorAll(".side-link").forEach(link => {
      const selected = link.dataset.view === view;
      link.classList.toggle("is-active", selected);
      if (selected) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    const heading = document.querySelector("#page-heading");
    heading.innerHTML = view === "Overview"
      ? "A little progress,<br><em>a lot of possibility.</em>"
      : `${view}<br><em>at your own pace.</em>`;
    document.querySelector("#projects-title").textContent = view === "Overview" ? "Your projects" : view;
    if (view === "Projects") {
      activeFilter = "all";
      filterButtons.forEach(item => {
        const selected = item.dataset.filter === "all";
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      updateProjects();
    }
  });
});

document.querySelector("#create-project").addEventListener("click", () => {
  dialog.showModal();
  projectName.focus();
});
document.querySelector("#close-dialog").addEventListener("click", () => dialog.close());
document.querySelector("#cancel-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});

projectForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!projectForm.reportValidity()) return;
  const name = projectName.value.trim();
  if (!name) {
    projectName.focus();
    return;
  }
  const card = document.createElement("article");
  card.className = "project-card";
  card.dataset.status = "active";
  card.dataset.search = name.toLowerCase();
  card.innerHTML = `<div class="project-art art-northstar"><span class="art-star" aria-hidden="true">✳</span><span class="art-caption">NEW / JUST NOW</span></div><div class="project-info"><div class="project-title-row"><h3></h3><span class="project-menu" aria-hidden="true">···</span></div><p></p><div class="project-meta"><span class="project-status"><i class="status-dot blue"></i> In progress</span><span>0%</span></div><div class="progress-track"><span style="width:0%"></span></div></div>`;
  card.querySelector("h3").textContent = name;
  card.querySelector(".project-info>p").textContent = document.querySelector("#project-type").value;
  projectGrid.prepend(card);
  projectCards.push(card);
  projectForm.reset();
  dialog.close();
  activeFilter = "all";
  filterButtons.forEach(item => {
    const selected = item.dataset.filter === "all";
    item.classList.toggle("is-selected", selected);
    item.setAttribute("aria-pressed", String(selected));
  });
  updateProjects();
  showToast("Your new project has a home.");
});

filterButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.filter === "all")));
