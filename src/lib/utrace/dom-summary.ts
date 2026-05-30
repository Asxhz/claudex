const MAX_NODES = 200;

export function collectDomSummary(): Record<string, unknown> {
  if (typeof document === "undefined") return {};

  const headings: string[] = [];
  document.querySelectorAll("h1, h2, h3").forEach((el, i) => {
    if (i < 20) headings.push(el.textContent?.trim().slice(0, 100) ?? "");
  });

  const utraceTargets: string[] = [];
  document.querySelectorAll("[data-utrace-target]").forEach((el, i) => {
    if (i < 50) {
      const id = el.getAttribute("data-utrace-target") ?? "";
      utraceTargets.push(id);
    }
  });

  const forms = document.querySelectorAll("form").length;
  const buttons = document.querySelectorAll("button").length;
  const links = document.querySelectorAll("a").length;
  const images = document.querySelectorAll("img").length;
  const totalNodes = Math.min(document.querySelectorAll("*").length, MAX_NODES);

  return {
    title: document.title,
    url: window.location.pathname,
    headings,
    utrace_targets: utraceTargets,
    counts: { forms, buttons, links, images, total_nodes: totalNodes },
  };
}

export function collectAccessibilitySummary(): Record<string, unknown> {
  if (typeof document === "undefined") return {};

  const landmarks: string[] = [];
  document.querySelectorAll("[role]").forEach((el, i) => {
    if (i < 20) {
      const role = el.getAttribute("role") ?? "";
      const label = el.getAttribute("aria-label") ?? "";
      landmarks.push(label ? `${role}: ${label}` : role);
    }
  });

  const buttonLabels: string[] = [];
  document.querySelectorAll("button").forEach((el, i) => {
    if (i < 30) {
      const label = el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 60) || "";
      if (label) buttonLabels.push(label);
    }
  });

  const linkLabels: string[] = [];
  document.querySelectorAll("a").forEach((el, i) => {
    if (i < 20) {
      const label = el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 60) || "";
      if (label) linkLabels.push(label);
    }
  });

  const formLabels: string[] = [];
  document.querySelectorAll("label").forEach((el, i) => {
    if (i < 20) {
      const text = el.textContent?.trim().slice(0, 60) ?? "";
      if (text) formLabels.push(text);
    }
  });

  return {
    landmarks,
    button_labels: buttonLabels,
    link_labels: linkLabels,
    form_labels: formLabels,
  };
}
