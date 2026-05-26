const app = document.querySelector("#app");

const state = {
  onboarded: false,
  view: "dashboard",
  form: {
    idea: "",
    audience: "",
    goal: "",
    notes: "",
  },
  errors: {},
  planStatus: "idle",
  toast: "",
  activeFilter: "All",
  activeWorkstream: "Product / Tech",
  selectedReviewId: "review-1",
  drawer: null,
  modal: null,
  decisionNote: "",
  decisionSubmitting: false,
  feedError: false,
  compactMode: false,
  demoLabel: "Local prototype data",
};

const workstreams = [
  {
    name: "Product / Tech",
    status: "RUNNING",
    task: "Structuring the first product surface",
    stage: "Drafting",
    outputs: 2,
    progress: 68,
  },
  {
    name: "Marketing / Growth",
    status: "NEEDS REVIEW",
    task: "Preparing launch positioning options",
    stage: "Review",
    outputs: 3,
    progress: 82,
  },
  {
    name: "Finance / Operations",
    status: "WARN",
    task: "Listing operating assumptions to validate",
    stage: "Checking",
    outputs: 1,
    progress: 44,
  },
  {
    name: "Customer / Inbox",
    status: "DONE",
    task: "Drafted first interview questions",
    stage: "Shipped",
    outputs: 1,
    progress: 100,
  },
];

const activities = [
  {
    time: "10:42",
    status: "RUNNING",
    stream: "Product / Tech",
    title: "Mapping first workspace screens",
    stage: "Drafting",
  },
  {
    time: "10:39",
    status: "NEEDS REVIEW",
    stream: "Marketing / Growth",
    title: "Launch positioning draft is ready",
    stage: "Awaiting founder",
    artifact: "artifact-1",
  },
  {
    time: "10:31",
    status: "WARN",
    stream: "Finance / Operations",
    title: "Cost assumption needs validation",
    stage: "Needs context",
  },
  {
    time: "10:22",
    status: "DONE",
    stream: "Customer / Inbox",
    title: "Interview question set prepared",
    stage: "Shipped",
    artifact: "artifact-2",
  },
  {
    time: "10:15",
    status: "BLOCKED",
    stream: "Marketing / Growth",
    title: "Publishing is unavailable without integrations",
    stage: "Blocked safely",
  },
];

const artifacts = [
  {
    id: "artifact-1",
    title: "Launch positioning draft",
    type: "Marketing copy",
    stream: "Marketing / Growth",
    status: "NEEDS REVIEW",
    body:
      "A concise positioning draft for the initial launch. This prototype shows the artifact format only; it does not publish, contact customers, or run campaigns.",
  },
  {
    id: "artifact-2",
    title: "Founder interview questions",
    type: "Customer research",
    stream: "Customer / Inbox",
    status: "DONE",
    body:
      "A starter set of questions for early customer discovery. This is local prototype content and does not represent real outreach.",
  },
  {
    id: "artifact-3",
    title: "Operating assumption note",
    type: "Finance / Operations",
    stream: "Finance / Operations",
    status: "WARN",
    body:
      "A note listing assumptions that need founder validation before any financial claim is shown in the product.",
  },
];

const reviewItems = [
  {
    id: "review-1",
    title: "Approve launch positioning draft",
    priority: "High",
    status: "NEEDS REVIEW",
    impact: "Affects how the first public message is framed.",
    artifact: "artifact-1",
  },
  {
    id: "review-2",
    title: "Validate operating assumptions",
    priority: "Medium",
    status: "WARN",
    impact: "Keeps the workspace from showing unsupported business claims.",
    artifact: "artifact-3",
  },
];

const navItems = [
  { label: "Dashboard", view: "dashboard", icon: "▦" },
  { label: "Activity", view: "activity", icon: "◌" },
  { label: "Workstreams", view: "workstreams", icon: "▤" },
  { label: "Review Queue", view: "review-queue", icon: "✓" },
  { label: "Settings", view: "settings", icon: "⚙" },
];

const UI = {
  badge(status) {
    const className = statusClass(status);
    return `<span class="badge ${className}">[${escapeHtml(status)}]</span>`;
  },

  button({ label, variant = "secondary", id = "", data = {}, disabled = false, type = "button", extraClass = "" }) {
    const attrs = dataAttributes(data);
    return `<button class="btn ${variant} ${extraClass}" ${id ? `id="${id}"` : ""} type="${type}" ${attrs} ${disabled ? "disabled" : ""}>${label}</button>`;
  },

  card({ title, subtitle = "", actions = "", body = "", className = "" }) {
    return `
      <section class="card ${className}">
        ${title || actions ? UI.sectionHeader({ title, subtitle, actions }) : ""}
        ${body}
      </section>
    `;
  },

  sectionHeader({ title, subtitle = "", actions = "" }) {
    return `
      <div class="card-head">
        <div>
          ${title ? `<h3>${title}</h3>` : ""}
          ${subtitle ? `<p class="helper">${subtitle}</p>` : ""}
        </div>
        ${actions}
      </div>
    `;
  },

  screenHeader({ title, description, actions = "" }) {
    return `
      <div class="screen-head">
        <div>
          <h2>${title}</h2>
          <p>${description}</p>
        </div>
        ${actions}
      </div>
    `;
  },

  field({ id, label, value = "", placeholder = "", type = "input", helper = "", error = "", disabled = false }) {
    const control =
      type === "textarea"
        ? `<textarea id="${id}" placeholder="${placeholder}" ${disabled ? "disabled" : ""}>${escapeHtml(value)}</textarea>`
        : `<input id="${id}" value="${escapeHtml(value)}" placeholder="${placeholder}" ${disabled ? "disabled" : ""} />`;
    return `
      <div class="field ${error ? "invalid" : ""}">
        <label for="${id}">${label}</label>
        ${control}
        ${helper ? `<span class="helper">${helper}</span>` : ""}
        <span class="error-text">${error || ""}</span>
      </div>
    `;
  },

  select({ id, label, value, options, helper = "" }) {
    return `
      <div class="field">
        <label for="${id}">${label}</label>
        <select id="${id}">
          ${options.map((option) => `<option value="${option}" ${value === option ? "selected" : ""}>${option}</option>`).join("")}
        </select>
        ${helper ? `<span class="helper">${helper}</span>` : ""}
      </div>
    `;
  },

  toggle({ id, label, checked, helper = "", disabled = false }) {
    return `
      <label class="toggle-row" for="${id}">
        <span>
          <strong>${label}</strong>
          ${helper ? `<small>${helper}</small>` : ""}
        </span>
        <input id="${id}" type="checkbox" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""} />
      </label>
    `;
  },

  emptyState(title, text) {
    return `<div class="empty-state"><strong>${title}</strong><p class="helper">${text}</p></div>`;
  },

  alert(kind, title, text = "") {
    return `<div class="alert ${kind}"><strong>${title}</strong>${text ? `<br />${text}` : ""}</div>`;
  },

  skeletonList(count = 3) {
    return `<div class="mini-list">${Array.from({ length: count }, () => `<div class="skeleton"></div>`).join("")}</div>`;
  },

  progress(value, label = "Progress") {
    return `<div class="progress-line" aria-label="${label}"><span style="--w:${value}%"></span></div>`;
  },

  toast(message) {
    return `<div class="toast ${message ? "show" : ""}" role="status">${message}</div>`;
  },

  drawer({ open, label, body }) {
    if (!open) return `<div class="drawer-shell" aria-hidden="true"></div>`;
    return `
      <div class="drawer-shell open" role="dialog" aria-modal="true" aria-label="${label}">
        <div class="scrim" data-close></div>
        <aside class="drawer">${body}</aside>
      </div>
    `;
  },

  modal({ open, label, body }) {
    if (!open) return `<div class="modal-shell" aria-hidden="true"></div>`;
    return `
      <div class="modal-shell open" role="dialog" aria-modal="true" aria-label="${label}">
        <div class="scrim" data-close></div>
        <div class="modal-wrap">
          <section class="modal">${body}</section>
        </div>
      </div>
    `;
  },
};

function validateForm() {
  const errors = {};
  if (!state.form.idea.trim()) errors.idea = "Company idea is required.";
  if (!state.form.audience.trim()) errors.audience = "Target audience is required.";
  if (!state.form.goal.trim()) errors.goal = "Launch goal is required.";
  state.errors = errors;
  return Object.keys(errors).length === 0;
}

function updateField(name, value) {
  state.form[name] = value;
  if (state.errors[name]) delete state.errors[name];
  render();
}

function generatePlan() {
  if (!validateForm()) {
    showToast("This did not complete. Your inputs are saved.");
    render();
    return;
  }

  state.planStatus = "loading";
  render();
  window.setTimeout(() => {
    state.planStatus = "ready";
    showToast("Plan ready. Review the first workstreams.");
    render();
  }, 900);
}

function createWorkspace() {
  if (state.planStatus !== "ready") return;
  state.onboarded = true;
  state.view = "dashboard";
  showToast("Workspace created. First workstreams are ready.");
  render();
}

function showToast(message) {
  state.toast = message;
  render();
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    state.toast = "";
    render();
  }, 2600);
}

function openArtifact(id) {
  state.drawer = { type: "artifact", id };
  render();
}

function openExplanation(activityIndex) {
  state.drawer = { type: "explain", id: activityIndex };
  render();
}

function openDecision(kind, itemId = state.selectedReviewId) {
  state.modal = { kind, itemId };
  state.decisionNote = "";
  state.decisionSubmitting = false;
  render();
}

function submitDecision() {
  state.decisionSubmitting = true;
  render();

  window.setTimeout(() => {
    const selected = reviewItems.find((item) => item.id === state.modal.itemId);
    if (selected) selected.status = "DONE";
    state.modal = null;
    state.drawer = null;
    state.decisionSubmitting = false;
    showToast("Decision applied. The workstream has been updated.");
    render();
  }, 700);
}

function renderOnboarding() {
  const loading = state.planStatus === "loading";
  const ready = state.planStatus === "ready";

  app.innerHTML = `
    <main class="boot">
      <section class="onboarding" aria-label="Create company workspace">
        <div class="brand-block">
          <div class="eyebrow"><span class="pulse"></span> cofounder.new</div>
          <h1>Create your company workspace</h1>
          <p>Start with an idea. This prototype turns it into a visible AI cofounder workspace with local demo workstreams, review items, and artifacts.</p>
          ${renderSetupPath()}
        </div>

        <aside class="panel form-panel">
          <form id="onboardingForm" novalidate>
            ${UI.field({
              id: "idea",
              label: "Company idea",
              type: "textarea",
              value: state.form.idea,
              placeholder: "An AI cofounder for solo founders...",
              helper: "Describe the company in plain language. You can refine it later.",
              error: state.errors.idea,
              disabled: loading,
            })}
            ${UI.field({
              id: "audience",
              label: "Target audience",
              value: state.form.audience,
              placeholder: "Solo founders, makers, early-stage teams",
              error: state.errors.audience,
              disabled: loading,
            })}
            ${UI.field({
              id: "goal",
              label: "Launch goal",
              value: state.form.goal,
              placeholder: "Create the first launch plan",
              error: state.errors.goal,
              disabled: loading,
            })}
            ${UI.field({
              id: "notes",
              label: "Constraints / notes",
              type: "textarea",
              value: state.form.notes,
              placeholder: "Keep claims safe. No external publishing.",
              disabled: loading,
            })}
            <div class="actions">
              ${UI.button({ id: "generatePlan", label: loading ? "Structuring..." : "Generate plan", variant: "primary", disabled: loading })}
              ${UI.button({ id: "createWorkspace", label: "Create workspace", disabled: !ready })}
            </div>
          </form>
          ${renderPlanPreview(loading, ready)}
        </aside>
      </section>
      ${UI.toast(state.toast)}
    </main>
  `;

  bindOnboarding();
}

function renderSetupPath() {
  const steps = [
    ["Idea input", "Describe the company."],
    ["Initial plan", "Review the generated plan."],
    ["Workstreams", "See work domains form."],
    ["First artifact", "Inspect outputs safely."],
  ];

  return `
    <div class="setup-grid" aria-label="Onboarding path">
      ${steps
        .map(
          ([title, text], index) => `
          <div class="step-tile">
            <span class="number">0${index + 1}</span>
            <strong>${title}</strong>
            <p class="helper">${text}</p>
          </div>
        `
        )
        .join("")}
    </div>
  `;
}

function renderPlanPreview(loading, ready) {
  if (!loading && !ready) return `<div class="plan-preview" hidden></div>`;

  const body = loading
    ? `<div class="skeleton"></div>${UI.skeletonList(3)}`
    : `<strong>Initial plan preview</strong>
       <p class="helper">Local prototype plan. No backend or external execution is connected.</p>
       <div class="mini-list">
        ${workstreams.map((workstream) => `<div class="mini-item"><span>${workstream.name}</span>${UI.badge(workstream.status)}</div>`).join("")}
       </div>`;

  return `<div class="plan-preview">${body}</div>`;
}

function renderShell() {
  app.innerHTML = `
    <div class="app-shell ${state.compactMode ? "is-compact" : ""}">
      ${renderSidebar()}
      <main class="main">
        ${renderTopbar()}
        <section class="content">${renderView()}</section>
      </main>
      ${renderDrawer()}
      ${renderModal()}
      ${UI.toast(state.toast)}
    </div>
  `;

  bindShell();
  bindCurrentView();
}

function renderSidebar() {
  return `
    <aside class="sidebar">
      <div>
        <div class="logo">cofounder.new</div>
        <div class="demo-pill">${state.demoLabel}</div>
      </div>
      <nav class="nav" aria-label="Primary navigation">
        ${navItems.map(renderNavItem).join("")}
      </nav>
      <div class="sidebar-footer">Prototype only. No real AI orchestration, integrations, billing, outreach, deployment, or backend execution is connected.</div>
    </aside>
  `;
}

function renderNavItem(item) {
  const active = state.view === item.view ? "active" : "";
  const count = item.view === "review-queue" ? UI.badge(`${pendingReviewCount()} pending`) : "";
  return UI.button({
    label: `<span>${item.icon}</span>${item.label}${count}`,
    variant: "ghost",
    data: { view: item.view },
    extraClass: active,
  });
}

function renderTopbar() {
  return `
    <header class="topbar">
      <div class="workspace-title">
        <strong>${escapeHtml(state.form.idea || "Company workspace")}</strong>
        <span class="meta">Current objective: ${escapeHtml(state.form.goal || "Create the first launch plan")}</span>
      </div>
      <div class="actions">
        ${UI.badge("RUNNING")}
        ${UI.button({ label: `${pendingReviewCount()} decisions`, variant: "warning", data: { view: "review-queue" } })}
      </div>
    </header>
  `;
}

function renderView() {
  if (state.view === "activity") return renderActivity();
  if (state.view === "workstreams") return renderWorkstreams();
  if (state.view === "review-queue") return renderReviewQueue();
  if (state.view === "settings") return renderSettings();
  return renderDashboard();
}

function renderDashboard() {
  return `
    ${UI.screenHeader({
      title: "Operating Dashboard",
      description: "See what is running, what shipped, and what needs founder input. Counts below are local prototype state, not business outcomes.",
      actions: UI.button({ label: "Review item", variant: "primary", data: { view: "review-queue" } }),
    })}
    <div class="grid dashboard-grid">
      <div class="grid">
        ${UI.card({
          title: "Active workstreams",
          actions: `<span class="muted mono">${workstreams.length} domains</span>`,
          body: renderMetrics(),
        })}
        <section class="grid workstream-grid">${workstreams.map(renderWorkstreamCard).join("")}</section>
      </div>
      <aside class="grid">
        ${UI.card({
          title: "Review Queue",
          actions: UI.button({ label: "Open", variant: "ghost", data: { view: "review-queue" } }),
          body: `<div class="queue">${renderReviewPreview()}</div>`,
        })}
        ${UI.card({
          title: "Live activity",
          actions: UI.button({ label: "View activity", variant: "ghost", data: { view: "activity" } }),
          body: `<div class="feed">${activities.slice(0, 4).map(renderFeedRow).join("")}</div>`,
        })}
        ${UI.card({
          title: "Recent outputs",
          actions: `<span class="muted">Prototype artifacts</span>`,
          body: `<div class="mini-list">${artifacts.map(renderArtifactRow).join("")}</div>`,
        })}
      </aside>
    </div>
  `;
}

function renderMetrics() {
  const metrics = [
    ["Running", countStatus("RUNNING")],
    ["Needs review", pendingReviewCount()],
    ["Artifacts", artifacts.length],
  ];

  return `
    <div class="metric-row">
      ${metrics.map(([label, value]) => `<div class="metric"><span class="muted">${label}</span><strong>${value}</strong></div>`).join("")}
    </div>
  `;
}

function renderReviewPreview() {
  const pending = reviewItems.filter((item) => item.status !== "DONE").slice(0, 2);
  if (!pending.length) return UI.emptyState("No decisions needed right now.", "View live activity or workstreams.");
  return pending.map(renderQueueItem).join("");
}

function renderActivity() {
  const filters = ["All", "RUNNING", "DONE", "WARN", "BLOCKED", "NEEDS REVIEW", ...workstreams.map((workstream) => workstream.name)];
  const filtered =
    state.activeFilter === "All"
      ? activities
      : activities.filter((item) => item.status === state.activeFilter || item.stream === state.activeFilter);

  return `
    ${UI.screenHeader({
      title: "Live Activity",
      description: "Timestamped local prototype events. This feed does not represent real backend execution.",
      actions: UI.button({
        id: "toggleFeedError",
        label: state.feedError ? "Retry feed" : "Simulate feed error",
        variant: state.feedError ? "secondary" : "danger",
      }),
    })}
    <div class="filter-bar">
      <div class="filters">${filters.map((filter) => renderChip(filter, state.activeFilter === filter, { filter })).join("")}</div>
      ${UI.select({
        id: "activityFilter",
        label: "Filter activity",
        value: state.activeFilter,
        options: filters,
        helper: "Dropdown mirrors the filter chips for compact workflows.",
      })}
    </div>
    ${
      state.feedError
        ? UI.alert("error", "Live feed unavailable.", "Prototype state is preserved. Retry to restore the local feed.")
        : `<div class="feed">${filtered.length ? filtered.map(renderFeedRow).join("") : UI.emptyState("No activity matches this filter.", "Choose another status or workstream.")}</div>`
    }
  `;
}

function renderWorkstreams() {
  const active = workstreams.find((item) => item.name === state.activeWorkstream) || workstreams[0];
  const tasks = activities.filter((item) => item.stream === active.name);

  return `
    ${UI.screenHeader({
      title: "Workstreams",
      description: "Organize AI cofounder work into understandable domains without turning the app into a chaotic feed.",
    })}
    <div class="tabs" role="tablist">
      ${workstreams.map((item) => renderChip(item.name, state.activeWorkstream === item.name, { tab: item.name })).join("")}
    </div>
    ${UI.card({
      title: active.name,
      subtitle: active.task,
      actions: UI.badge(active.status),
      body: `
        ${UI.progress(active.progress, `${active.name} progress`)}
        <h3 class="section-spacer">Current tasks</h3>
        <div class="tasks">
          ${tasks.length ? tasks.map(renderTaskRow).join("") : UI.emptyState("No tasks yet.", "Return to dashboard or start from onboarding.")}
        </div>
      `,
    })}
  `;
}

function renderReviewQueue() {
  const selected = reviewItems.find((item) => item.id === state.selectedReviewId) || reviewItems[0];
  const artifact = selected ? artifacts.find((item) => item.id === selected.artifact) : null;

  return `
    ${UI.screenHeader({
      title: "Review Queue",
      description: "Approve, edit, reject, or redirect local prototype outputs. No external action is taken.",
    })}
    <div class="queue-layout">
      ${UI.card({
        title: "Pending decisions",
        actions: UI.badge(pendingReviewCount() ? "NEEDS REVIEW" : "DONE"),
        body: `<div class="queue">${reviewItems.map(renderQueueItem).join("")}</div>`,
      })}
      ${UI.card({
        body:
          selected && artifact
            ? `
              ${UI.sectionHeader({ title: selected.title, actions: UI.badge(selected.status) })}
              <p>${selected.impact}</p>
              <div class="artifact-body">${artifact.body}</div>
              <div class="actions section-spacer">
                ${UI.button({ label: "Approve", variant: "primary", data: { decision: "approve" } })}
                ${UI.button({ label: "Edit", data: { decision: "edit" } })}
                ${UI.button({ label: "Redirect", variant: "warning", data: { decision: "redirect" } })}
                ${UI.button({ label: "Reject", variant: "danger", data: { decision: "reject" } })}
                ${UI.button({ label: "Open drawer", variant: "ghost", data: { artifact: artifact.id } })}
              </div>
            `
            : UI.emptyState("No decisions needed right now.", "View live activity or workstreams."),
      })}
    </div>
  `;
}

function renderSettings() {
  const settings = ["Autonomy settings", "Account / Auth / Billing", "Integrations"];

  return `
    ${UI.screenHeader({
      title: "Settings / Not Configured",
      description: "Future settings are shown as unavailable because auth, billing, integrations, and autonomy rules are missing requirements.",
    })}
    <div class="grid">
      ${UI.card({
        title: "Prototype preferences",
        subtitle: "Local UI-only controls. These do not create backend behavior.",
        body: UI.toggle({
          id: "compactMode",
          label: "Compact dashboard density",
          checked: state.compactMode,
          helper: "Adjusts spacing in the local prototype only.",
        }),
      })}
      ${settings
        .map(
          (item) =>
            UI.card({
              title: item,
              actions: UI.badge("BLOCKED"),
              body: `<p class="muted">This setting is not configured yet.</p>${UI.button({ label: "Unavailable", disabled: true })}`,
            })
        )
        .join("")}
    </div>
  `;
}

function renderWorkstreamCard(item) {
  return UI.card({
    title: item.name,
    actions: UI.badge(item.status),
    className: "workstream-card",
    body: `
      <p>${item.task}</p>
      ${UI.progress(item.progress, `${item.name} progress`)}
      <div class="card-head">
        <span class="helper">${item.stage}</span>
        ${UI.button({
          label: `${item.outputs} outputs`,
          variant: "ghost",
          data: { view: "workstreams", workstream: item.name },
        })}
      </div>
    `,
  });
}

function renderFeedRow(item, index) {
  return `
    <div class="feed-row">
      <span class="timestamp">${item.time}</span>
      ${UI.badge(item.status)}
      <div>
        <strong>${item.title}</strong>
        <div class="helper">${item.stream} / ${item.stage}</div>
      </div>
      <div class="actions">
        ${item.artifact ? UI.button({ label: "Open", variant: "ghost", data: { artifact: item.artifact } }) : ""}
        ${UI.button({ label: "Explain", variant: "ghost", data: { explain: index } })}
      </div>
    </div>
  `;
}

function renderQueueItem(item) {
  const artifact = artifacts.find((candidate) => candidate.id === item.artifact);
  return `
    <button class="queue-item ${state.selectedReviewId === item.id ? "selected" : ""}" data-review="${item.id}">
      <div class="row-head">
        <strong>${item.title}</strong>
        ${UI.badge(item.status)}
      </div>
      <span class="helper">${item.impact}</span>
      <span class="helper">Artifact: ${artifact ? artifact.title : "Unavailable"}</span>
    </button>
  `;
}

function renderTaskRow(task, index) {
  return `
    <div class="task-row">
      <div>
        <strong>${task.title}</strong>
        <div class="helper">${task.stage}</div>
      </div>
      <div class="actions">
        ${UI.badge(task.status)}
        ${UI.button({ label: "Explain", variant: "ghost", data: { explain: index } })}
      </div>
    </div>
  `;
}

function renderArtifactRow(artifact) {
  return `
    <div class="artifact-row">
      <div>
        <strong>${artifact.title}</strong>
        <div class="helper">${artifact.type}</div>
      </div>
      ${UI.button({ label: "Open", variant: "ghost", data: { artifact: artifact.id } })}
    </div>
  `;
}

function renderChip(label, active, data) {
  return `<button class="chip ${active ? "active" : ""}" ${dataAttributes(data)}>${label}</button>`;
}

function renderDrawer() {
  if (!state.drawer) return UI.drawer({ open: false });

  if (state.drawer.type === "artifact") {
    const artifact = artifacts.find((item) => item.id === state.drawer.id);
    if (!artifact) return UI.drawer({ open: false });

    return UI.drawer({
      open: true,
      label: "Artifact Preview",
      body: `
        <div class="drawer-content">
          <div class="card-head">
            <div>
              <h2>Artifact Preview</h2>
              <p class="helper">${artifact.type} / ${artifact.stream}</p>
            </div>
            ${UI.button({ label: "Close", variant: "ghost", data: { close: "" } })}
          </div>
          ${UI.badge(artifact.status)}
          <h3>${artifact.title}</h3>
          <div class="artifact-body">${artifact.body}</div>
          ${UI.alert("warning", "No external publishing, outreach, deployment, or integrations are connected in this prototype.")}
          <div class="actions">
            ${UI.button({ label: "Approve", variant: "primary", data: { decision: "approve" } })}
            ${UI.button({ label: "Edit", data: { decision: "edit" } })}
            ${UI.button({ label: "Redirect", variant: "warning", data: { decision: "redirect" } })}
          </div>
        </div>
      `,
    });
  }

  const activity = activities[state.drawer.id] || activities[0];
  return UI.drawer({
    open: true,
    label: "Log explanation",
    body: `
      <div class="drawer-content">
        <div class="card-head">
          <h2>Log Explanation</h2>
          ${UI.button({ label: "Close", variant: "ghost", data: { close: "" } })}
        </div>
        <div class="artifact-body"><span class="timestamp">${activity.time}</span> ${activity.title}</div>
        <p>This row shows a local prototype activity event. It is designed to explain what is running, blocked, complete, or waiting for founder review without implying real backend execution.</p>
        <div>${UI.badge(activity.status)}</div>
      </div>
    `,
  });
}

function renderModal() {
  if (!state.modal) return UI.modal({ open: false });
  const item = reviewItems.find((review) => review.id === state.modal.itemId) || reviewItems[0];

  return UI.modal({
    open: true,
    label: "Approval Redirect Modal",
    body: `
      <div class="card-head">
        <h2>${decisionTitle(state.modal.kind)}</h2>
        ${UI.button({ label: "Close", variant: "ghost", data: { close: "" } })}
      </div>
      <p>${item.title}</p>
      ${UI.alert("warning", "This only updates local prototype state. No external action will be taken.")}
      ${UI.field({
        id: "decisionNote",
        label: "Optional instruction",
        type: "textarea",
        value: state.decisionNote,
        placeholder: "Add guidance for the next iteration.",
      })}
      <div class="actions">
        ${UI.button({
          id: "submitDecision",
          label: state.decisionSubmitting ? "Applying..." : "Confirm",
          variant: "primary",
          disabled: state.decisionSubmitting,
        })}
        ${UI.button({ label: "Cancel", variant: "ghost", data: { close: "" } })}
      </div>
    `,
  });
}

function bindOnboarding() {
  const fields = ["idea", "audience", "goal", "notes"];
  fields.forEach((field) => {
    document.querySelector(`#${field}`).addEventListener("input", (event) => updateField(field, event.target.value));
  });
  document.querySelector("#generatePlan").addEventListener("click", generatePlan);
  document.querySelector("#createWorkspace").addEventListener("click", createWorkspace);
}

function bindShell() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      if (button.dataset.workstream) state.activeWorkstream = button.dataset.workstream;
      render();
    });
  });
}

function bindCurrentView() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeFilter = button.dataset.filter;
      render();
    });
  });

  const filterSelect = document.querySelector("#activityFilter");
  if (filterSelect) {
    filterSelect.addEventListener("change", (event) => {
      state.activeFilter = event.target.value;
      render();
    });
  }

  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeWorkstream = button.dataset.tab;
      render();
    });
  });

  document.querySelectorAll("[data-review]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedReviewId = button.dataset.review;
      render();
    });
  });

  document.querySelectorAll("[data-artifact]").forEach((button) => {
    button.addEventListener("click", () => openArtifact(button.dataset.artifact));
  });

  document.querySelectorAll("[data-explain]").forEach((button) => {
    button.addEventListener("click", () => openExplanation(Number(button.dataset.explain)));
  });

  document.querySelectorAll("[data-decision]").forEach((button) => {
    button.addEventListener("click", () => openDecision(button.dataset.decision));
  });

  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", closeOverlays);
  });

  const submit = document.querySelector("#submitDecision");
  if (submit) submit.addEventListener("click", submitDecision);

  const note = document.querySelector("#decisionNote");
  if (note) note.addEventListener("input", (event) => (state.decisionNote = event.target.value));

  const toggleFeedError = document.querySelector("#toggleFeedError");
  if (toggleFeedError) {
    toggleFeedError.addEventListener("click", () => {
      state.feedError = !state.feedError;
      showToast(state.feedError ? "Feed error shown. Prototype state is preserved." : "Feed restored.");
      render();
    });
  }

  const compactMode = document.querySelector("#compactMode");
  if (compactMode) {
    compactMode.addEventListener("change", (event) => {
      state.compactMode = event.target.checked;
      showToast(state.compactMode ? "Compact density enabled." : "Default density restored.");
      render();
    });
  }
}

function closeOverlays() {
  state.drawer = null;
  state.modal = null;
  render();
}

function pendingReviewCount() {
  return reviewItems.filter((item) => item.status !== "DONE").length;
}

function countStatus(status) {
  return workstreams.filter((item) => item.status === status).length;
}

function decisionTitle(kind) {
  if (kind === "edit") return "Edit before continuing";
  if (kind === "reject") return "Reject this output";
  if (kind === "redirect") return "Redirect the workstream";
  return "Approve output";
}

function statusClass(status) {
  const key = status.toLowerCase().replace(/\s/g, "-");
  if (key.includes("pending")) return "review";
  if (key === "running") return "running";
  if (key === "done") return "done";
  if (key === "warn") return "warn";
  if (key === "blocked") return "blocked";
  if (key === "needs-review") return "review";
  return "info";
}

function dataAttributes(data) {
  return Object.entries(data)
    .map(([key, value]) => `data-${toKebab(key)}="${escapeHtml(value)}"`)
    .join(" ");
}

function toKebab(value) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function render() {
  if (state.onboarded) renderShell();
  else renderOnboarding();
}

render();
