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

function badge(status) {
  const key = status.toLowerCase().replace(/\s/g, "-");
  const cls =
    key === "running"
      ? "running"
      : key === "done"
        ? "done"
        : key === "warn"
          ? "warn"
          : key === "blocked"
            ? "blocked"
            : key === "needs-review"
              ? "review"
              : "info";
  return `<span class="badge ${cls}">[${status}]</span>`;
}

function icon(name) {
  const icons = {
    Dashboard: "▦",
    Activity: "◌",
    Workstreams: "▤",
    "Review Queue": "✓",
    Settings: "⚙",
  };
  return icons[name] || "•";
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
    selected.status = "DONE";
    state.modal = null;
    state.drawer = null;
    state.decisionSubmitting = false;
    showToast("Decision applied. The workstream has been updated.");
    render();
  }, 700);
}

function renderOnboarding() {
  const err = state.errors;
  const loading = state.planStatus === "loading";
  const ready = state.planStatus === "ready";

  app.innerHTML = `
    <main class="boot">
      <section class="onboarding" aria-label="Create company workspace">
        <div class="brand-block">
          <div class="eyebrow"><span class="pulse"></span> cofounder.new</div>
          <h1>Create your company workspace</h1>
          <p>Start with an idea. This prototype turns it into a visible AI cofounder workspace with local demo workstreams, review items, and artifacts.</p>
          <div class="setup-grid" aria-label="Onboarding path">
            ${["Idea input", "Initial plan", "Workstreams", "First artifact"]
              .map(
                (item, index) => `
                <div class="step-tile">
                  <span class="number">0${index + 1}</span>
                  <strong>${item}</strong>
                  <p class="helper">${index === 0 ? "Describe the company." : index === 1 ? "Review the generated plan." : index === 2 ? "See work domains form." : "Inspect outputs safely."}</p>
                </div>`
              )
              .join("")}
          </div>
        </div>

        <aside class="panel form-panel">
          <form id="onboardingForm" novalidate>
            <div class="field ${err.idea ? "invalid" : ""}">
              <label for="idea">Company idea</label>
              <textarea id="idea" placeholder="An AI cofounder for solo founders..." ${loading ? "disabled" : ""}>${escapeHtml(state.form.idea)}</textarea>
              <span class="helper">Describe the company in plain language. You can refine it later.</span>
              <span class="error-text">${err.idea || ""}</span>
            </div>
            <div class="field ${err.audience ? "invalid" : ""}">
              <label for="audience">Target audience</label>
              <input id="audience" value="${escapeHtml(state.form.audience)}" placeholder="Solo founders, makers, early-stage teams" ${loading ? "disabled" : ""} />
              <span class="error-text">${err.audience || ""}</span>
            </div>
            <div class="field ${err.goal ? "invalid" : ""}">
              <label for="goal">Launch goal</label>
              <input id="goal" value="${escapeHtml(state.form.goal)}" placeholder="Create the first launch plan" ${loading ? "disabled" : ""} />
              <span class="error-text">${err.goal || ""}</span>
            </div>
            <div class="field">
              <label for="notes">Constraints / notes</label>
              <textarea id="notes" placeholder="Keep claims safe. No external publishing." ${loading ? "disabled" : ""}>${escapeHtml(state.form.notes)}</textarea>
            </div>
            <div class="actions">
              <button class="btn primary" id="generatePlan" type="button" ${loading ? "disabled" : ""}>${loading ? "Structuring..." : "Generate plan"}</button>
              <button class="btn" id="createWorkspace" type="button" ${ready ? "" : "disabled"}>Create workspace</button>
            </div>
          </form>

          <div class="plan-preview" ${ready || loading ? "" : "hidden"}>
            ${
              loading
                ? `<div class="skeleton"></div><div class="mini-list"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>`
                : `<strong>Initial plan preview</strong>
                   <p class="helper">Local prototype plan. No backend or external execution is connected.</p>
                   <div class="mini-list">
                    ${workstreams.map((w) => `<div class="mini-item"><span>${w.name}</span>${badge(w.status)}</div>`).join("")}
                   </div>`
            }
          </div>
        </aside>
      </section>
      ${toastMarkup()}
    </main>
  `;

  document.querySelector("#idea").addEventListener("input", (event) => updateField("idea", event.target.value));
  document.querySelector("#audience").addEventListener("input", (event) => updateField("audience", event.target.value));
  document.querySelector("#goal").addEventListener("input", (event) => updateField("goal", event.target.value));
  document.querySelector("#notes").addEventListener("input", (event) => updateField("notes", event.target.value));
  document.querySelector("#generatePlan").addEventListener("click", generatePlan);
  document.querySelector("#createWorkspace").addEventListener("click", createWorkspace);
}

function renderShell() {
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div>
          <div class="logo">cofounder.new</div>
          <div class="demo-pill">${state.demoLabel}</div>
        </div>
        <nav class="nav" aria-label="Primary navigation">
          ${["Dashboard", "Activity", "Workstreams", "Review Queue", "Settings"].map((label) => {
            const view = label.toLowerCase().replace(/\s/g, "-");
            const count = label === "Review Queue" ? `<span class="badge review">${pendingReviewCount()} pending</span>` : "";
            return `<button class="btn ghost ${state.view === view ? "active" : ""}" data-view="${view}"><span>${icon(label)}</span>${label}${count}</button>`;
          }).join("")}
        </nav>
        <div class="sidebar-footer">Prototype only. No real AI orchestration, integrations, billing, outreach, deployment, or backend execution is connected.</div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div class="workspace-title">
            <strong>${escapeHtml(state.form.idea || "Company workspace")}</strong>
            <span class="meta">Current objective: ${escapeHtml(state.form.goal || "Create the first launch plan")}</span>
          </div>
          <div class="actions">
            ${badge("RUNNING")}
            <button class="btn warning" data-view="review-queue">${pendingReviewCount()} decisions</button>
          </div>
        </header>
        <section class="content">${renderView()}</section>
      </main>
      ${renderDrawer()}
      ${renderModal()}
      ${toastMarkup()}
    </div>
  `;

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      render();
    });
  });
  bindCurrentView();
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
    <div class="screen-head">
      <div>
        <h2>Operating Dashboard</h2>
        <p>See what is running, what shipped, and what needs founder input. Counts below are local prototype state, not business outcomes.</p>
      </div>
      <button class="btn primary" data-view="review-queue">Review item</button>
    </div>

    <div class="grid dashboard-grid">
      <div class="grid">
        <section class="card">
          <div class="card-head">
            <h3>Active workstreams</h3>
            <span class="muted mono">${workstreams.length} domains</span>
          </div>
          <div class="metric-row">
            <div class="metric"><span class="muted">Running</span><strong>${countStatus("RUNNING")}</strong></div>
            <div class="metric"><span class="muted">Needs review</span><strong>${pendingReviewCount()}</strong></div>
            <div class="metric"><span class="muted">Artifacts</span><strong>${artifacts.length}</strong></div>
          </div>
        </section>
        <section class="grid workstream-grid">
          ${workstreams.map(renderWorkstreamCard).join("")}
        </section>
      </div>
      <aside class="grid">
        <section class="card">
          <div class="card-head">
            <h3>Review Queue</h3>
            <button class="btn ghost" data-view="review-queue">Open</button>
          </div>
          <div class="queue">${reviewItems.filter((item) => item.status !== "DONE").slice(0, 2).map(renderQueueItem).join("") || emptyState("No decisions needed right now.", "View live activity or workstreams.")}</div>
        </section>
        <section class="card">
          <div class="card-head">
            <h3>Live activity</h3>
            <button class="btn ghost" data-view="activity">View activity</button>
          </div>
          <div class="feed">${activities.slice(0, 4).map(renderFeedRow).join("")}</div>
        </section>
        <section class="card">
          <div class="card-head">
            <h3>Recent outputs</h3>
            <span class="muted">Prototype artifacts</span>
          </div>
          <div class="mini-list">${artifacts.map((a) => `<div class="artifact-row"><div><strong>${a.title}</strong><div class="helper">${a.type}</div></div><button class="btn ghost" data-artifact="${a.id}">Open</button></div>`).join("")}</div>
        </section>
      </aside>
    </div>
  `;
}

function renderActivity() {
  const filtered =
    state.activeFilter === "All"
      ? activities
      : activities.filter((item) => item.status === state.activeFilter || item.stream === state.activeFilter);
  return `
    <div class="screen-head">
      <div>
        <h2>Live Activity</h2>
        <p>Timestamped local prototype events. This feed does not represent real backend execution.</p>
      </div>
      <button class="btn ${state.feedError ? "" : "danger"}" id="toggleFeedError">${state.feedError ? "Retry feed" : "Simulate feed error"}</button>
    </div>
    <div class="filters">
      ${["All", "RUNNING", "DONE", "WARN", "BLOCKED", "NEEDS REVIEW", ...workstreams.map((w) => w.name)]
        .map((filter) => `<button class="chip ${state.activeFilter === filter ? "active" : ""}" data-filter="${filter}">${filter}</button>`)
        .join("")}
    </div>
    ${
      state.feedError
        ? `<div class="alert error"><strong>Live feed unavailable.</strong><br />Prototype state is preserved. Retry to restore the local feed.</div>`
        : `<div class="feed">${filtered.length ? filtered.map(renderFeedRow).join("") : emptyState("No activity matches this filter.", "Choose another status or workstream.")}</div>`
    }
  `;
}

function renderWorkstreams() {
  const active = workstreams.find((item) => item.name === state.activeWorkstream) || workstreams[0];
  const tasks = activities.filter((item) => item.stream === active.name);
  return `
    <div class="screen-head">
      <div>
        <h2>Workstreams</h2>
        <p>Organize AI cofounder work into understandable domains without turning the app into a chaotic feed.</p>
      </div>
    </div>
    <div class="tabs">
      ${workstreams.map((item) => `<button class="chip ${state.activeWorkstream === item.name ? "active" : ""}" data-tab="${item.name}">${item.name}</button>`).join("")}
    </div>
    <section class="card">
      <div class="card-head">
        <div>
          <h3>${active.name}</h3>
          <p class="helper">${active.task}</p>
        </div>
        ${badge(active.status)}
      </div>
      <div class="progress-line" aria-label="Workstream progress"><span style="--w:${active.progress}%"></span></div>
      <h3 style="margin-top: 18px;">Current tasks</h3>
      <div class="tasks">
        ${tasks.length ? tasks.map((task, index) => `<div class="task-row"><div><strong>${task.title}</strong><div class="helper">${task.stage}</div></div><div class="actions">${badge(task.status)}<button class="btn ghost" data-explain="${index}">Explain</button></div></div>`).join("") : emptyState("No tasks yet.", "Return to dashboard or start from onboarding.")}
      </div>
    </section>
  `;
}

function renderReviewQueue() {
  const selected = reviewItems.find((item) => item.id === state.selectedReviewId) || reviewItems[0];
  const artifact = selected ? artifacts.find((item) => item.id === selected.artifact) : null;
  return `
    <div class="screen-head">
      <div>
        <h2>Review Queue</h2>
        <p>Approve, edit, reject, or redirect local prototype outputs. No external action is taken.</p>
      </div>
    </div>
    <div class="queue-layout">
      <section class="card">
        <div class="card-head">
          <h3>Pending decisions</h3>
          ${badge(pendingReviewCount() ? "NEEDS REVIEW" : "DONE")}
        </div>
        <div class="queue">${reviewItems.map(renderQueueItem).join("")}</div>
      </section>
      <section class="card">
        ${
          selected && artifact
            ? `<div class="card-head"><h3>${selected.title}</h3>${badge(selected.status)}</div>
               <p>${selected.impact}</p>
               <div class="artifact-body">${artifact.body}</div>
               <div class="actions" style="margin-top: 16px;">
                <button class="btn primary" data-decision="approve">Approve</button>
                <button class="btn" data-decision="edit">Edit</button>
                <button class="btn warning" data-decision="redirect">Redirect</button>
                <button class="btn danger" data-decision="reject">Reject</button>
                <button class="btn ghost" data-artifact="${artifact.id}">Open drawer</button>
               </div>`
            : emptyState("No decisions needed right now.", "View live activity or workstreams.")
        }
      </section>
    </div>
  `;
}

function renderSettings() {
  return `
    <div class="screen-head">
      <div>
        <h2>Settings / Not Configured</h2>
        <p>Future settings are shown as unavailable because auth, billing, integrations, and autonomy rules are missing requirements.</p>
      </div>
    </div>
    <div class="grid">
      ${["Autonomy settings", "Account / Auth / Billing", "Integrations"].map((item) => `
        <section class="card">
          <div class="card-head">
            <h3>${item}</h3>
            ${badge("BLOCKED")}
          </div>
          <p class="muted">This setting is not configured yet.</p>
          <button class="btn" disabled>Unavailable</button>
        </section>
      `).join("")}
    </div>
  `;
}

function renderWorkstreamCard(item) {
  return `
    <article class="card workstream-card">
      <div class="card-head">
        <h3>${item.name}</h3>
        ${badge(item.status)}
      </div>
      <p>${item.task}</p>
      <div class="progress-line"><span style="--w:${item.progress}%"></span></div>
      <div class="card-head">
        <span class="helper">${item.stage}</span>
        <button class="btn ghost" data-view="workstreams" data-workstream="${item.name}">${item.outputs} outputs</button>
      </div>
    </article>
  `;
}

function renderFeedRow(item, index) {
  return `
    <div class="feed-row">
      <span class="timestamp">${item.time}</span>
      ${badge(item.status)}
      <div>
        <strong>${item.title}</strong>
        <div class="helper">${item.stream} / ${item.stage}</div>
      </div>
      <div class="actions">
        ${item.artifact ? `<button class="btn ghost" data-artifact="${item.artifact}">Open</button>` : ""}
        <button class="btn ghost" data-explain="${index}">Explain</button>
      </div>
    </div>
  `;
}

function renderQueueItem(item) {
  const artifact = artifacts.find((a) => a.id === item.artifact);
  return `
    <button class="queue-item ${state.selectedReviewId === item.id ? "selected" : ""}" data-review="${item.id}">
      <div class="row-head">
        <strong>${item.title}</strong>
        ${badge(item.status)}
      </div>
      <span class="helper">${item.impact}</span>
      <span class="helper">Artifact: ${artifact?.title || "Unavailable"}</span>
    </button>
  `;
}

function renderDrawer() {
  if (!state.drawer) return `<div class="drawer-shell" aria-hidden="true"></div>`;
  if (state.drawer.type === "artifact") {
    const artifact = artifacts.find((item) => item.id === state.drawer.id);
    return `
      <div class="drawer-shell open" role="dialog" aria-modal="true" aria-label="Artifact Preview">
        <div class="scrim" data-close></div>
        <aside class="drawer">
          <div class="drawer-content">
            <div class="card-head">
              <div><h2>Artifact Preview</h2><p class="helper">${artifact.type} / ${artifact.stream}</p></div>
              <button class="btn ghost" data-close>Close</button>
            </div>
            ${badge(artifact.status)}
            <h3>${artifact.title}</h3>
            <div class="artifact-body">${artifact.body}</div>
            <div class="alert warning">No external publishing, outreach, deployment, or integrations are connected in this prototype.</div>
            <div class="actions">
              <button class="btn primary" data-decision="approve">Approve</button>
              <button class="btn" data-decision="edit">Edit</button>
              <button class="btn warning" data-decision="redirect">Redirect</button>
            </div>
          </div>
        </aside>
      </div>
    `;
  }

  const activity = activities[state.drawer.id] || activities[0];
  return `
    <div class="drawer-shell open" role="dialog" aria-modal="true" aria-label="Log explanation">
      <div class="scrim" data-close></div>
      <aside class="drawer">
        <div class="drawer-content">
          <div class="card-head">
            <h2>Log Explanation</h2>
            <button class="btn ghost" data-close>Close</button>
          </div>
          <div class="artifact-body"><span class="timestamp">${activity.time}</span> ${activity.title}</div>
          <p>This row shows a local prototype activity event. It is designed to explain what is running, blocked, complete, or waiting for founder review without implying real backend execution.</p>
          <div>${badge(activity.status)}</div>
        </div>
      </aside>
    </div>
  `;
}

function renderModal() {
  if (!state.modal) return `<div class="modal-shell" aria-hidden="true"></div>`;
  const item = reviewItems.find((review) => review.id === state.modal.itemId) || reviewItems[0];
  return `
    <div class="modal-shell open" role="dialog" aria-modal="true" aria-label="Approval Redirect Modal">
      <div class="scrim" data-close></div>
      <div class="modal-wrap">
        <section class="modal">
          <div class="card-head">
            <h2>${decisionTitle(state.modal.kind)}</h2>
            <button class="btn ghost" data-close>Close</button>
          </div>
          <p>${item.title}</p>
          <div class="alert warning">This only updates local prototype state. No external action will be taken.</div>
          <div class="field">
            <label for="decisionNote">Optional instruction</label>
            <textarea id="decisionNote" placeholder="Add guidance for the next iteration.">${escapeHtml(state.decisionNote)}</textarea>
          </div>
          <div class="actions">
            <button class="btn primary" id="submitDecision" ${state.decisionSubmitting ? "disabled" : ""}>${state.decisionSubmitting ? "Applying..." : "Confirm"}</button>
            <button class="btn ghost" data-close>Cancel</button>
          </div>
        </section>
      </div>
    </div>
  `;
}

function decisionTitle(kind) {
  if (kind === "edit") return "Edit before continuing";
  if (kind === "reject") return "Reject this output";
  if (kind === "redirect") return "Redirect the workstream";
  return "Approve output";
}

function pendingReviewCount() {
  return reviewItems.filter((item) => item.status !== "DONE").length;
}

function countStatus(status) {
  return workstreams.filter((item) => item.status === status).length;
}

function emptyState(title, text) {
  return `<div class="empty-state"><strong>${title}</strong><p class="helper">${text}</p></div>`;
}

function toastMarkup() {
  return `<div class="toast ${state.toast ? "show" : ""}" role="status">${state.toast}</div>`;
}

function bindCurrentView() {
  document.querySelectorAll("[data-filter]").forEach((button) =>
    button.addEventListener("click", () => {
      state.activeFilter = button.dataset.filter;
      render();
    })
  );
  document.querySelectorAll("[data-tab]").forEach((button) =>
    button.addEventListener("click", () => {
      state.activeWorkstream = button.dataset.tab;
      render();
    })
  );
  document.querySelectorAll("[data-workstream]").forEach((button) =>
    button.addEventListener("click", () => {
      state.activeWorkstream = button.dataset.workstream;
    })
  );
  document.querySelectorAll("[data-review]").forEach((button) =>
    button.addEventListener("click", () => {
      state.selectedReviewId = button.dataset.review;
      render();
    })
  );
  document.querySelectorAll("[data-artifact]").forEach((button) =>
    button.addEventListener("click", () => openArtifact(button.dataset.artifact))
  );
  document.querySelectorAll("[data-explain]").forEach((button) =>
    button.addEventListener("click", () => openExplanation(Number(button.dataset.explain)))
  );
  document.querySelectorAll("[data-decision]").forEach((button) =>
    button.addEventListener("click", () => openDecision(button.dataset.decision))
  );
  document.querySelectorAll("[data-close]").forEach((button) =>
    button.addEventListener("click", () => {
      state.drawer = null;
      state.modal = null;
      render();
    })
  );
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
