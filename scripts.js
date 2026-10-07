"use strict";

const ACADEMIC_RULES = Object.freeze({
  contributionMaximum: 20,
  totalMaximum: 40,
  directPassMinimum: 28,
  recoveryMinimum: 18,
  recoveryPassingAverage: 24,
  recoveryExamMaximum: 40,
});

const form = document.querySelector("#grade-form");
const firstGradeInput = document.querySelector("#first-grade");
const secondGradeInput = document.querySelector("#second-grade");
const formError = document.querySelector("#form-error");
const emptyResult = document.querySelector("#empty-result");
const resultContent = document.querySelector("#result-content");
const totalScore = document.querySelector("#total-score");
const scoreProgress = document.querySelector("#score-progress");
const statusBox = document.querySelector("#status-box");
const statusIcon = document.querySelector("#status-icon");
const statusTitle = document.querySelector("#status-title");
const statusDescription = document.querySelector("#status-description");
const recoveryResult = document.querySelector("#recovery-result");
const recoveryScore = document.querySelector("#recovery-score");

function evaluateGrades(firstGrade, secondGrade) {
  const accumulated = firstGrade + secondGrade;

  if (accumulated >= ACADEMIC_RULES.directPassMinimum) {
    return {
      accumulated,
      status: "approved",
      title: "Aprobación directa",
      description: "La calificación acumulada es suficiente para aprobar la materia.",
      recoveryRequired: null,
    };
  }

  if (accumulated >= ACADEMIC_RULES.recoveryMinimum) {
    const recoveryRequired = ACADEMIC_RULES.recoveryPassingAverage * 2 - accumulated;
    return {
      accumulated,
      status: "recovery",
      title: "Debe rendir recuperación",
      description: "Puede rendir el examen de recuperación para aprobar la materia.",
      recoveryRequired,
    };
  }

  return {
    accumulated,
    status: "failed",
    title: "No aprueba la materia",
    description: "La calificación no alcanza el mínimo requerido para rendir recuperación.",
    recoveryRequired: null,
  };
}

function readGrade(input, label) {
  const rawValue = input.value.trim();
  const value = Number(rawValue);

  if (rawValue === "" || !Number.isFinite(value)) {
    markInvalid(input);
    throw new Error(`Ingresa la nota del ${label}.`);
  }

  if (value < 0 || value > ACADEMIC_RULES.contributionMaximum) {
    markInvalid(input);
    throw new Error(`La nota del ${label} debe estar entre 0 y 20 puntos.`);
  }

  return value;
}

function showResult(result) {
  emptyResult.hidden = true;
  resultContent.hidden = false;
  totalScore.textContent = formatGrade(result.accumulated);
  scoreProgress.style.width = `${result.accumulated / ACADEMIC_RULES.totalMaximum * 100}%`;

  statusBox.className = `status-box status-${result.status}`;
  statusIcon.textContent = result.status === "approved" ? "✓" : result.status === "recovery" ? "!" : "×";
  statusTitle.textContent = result.title;
  statusDescription.textContent = result.description;

  if (result.status === "recovery") {
    const required = Math.min(result.recoveryRequired, ACADEMIC_RULES.recoveryExamMaximum);
    recoveryScore.textContent = formatGrade(required);
    recoveryResult.hidden = false;
  } else {
    recoveryResult.hidden = true;
  }
}

function markInvalid(input) {
  input.classList.add("invalid");
  input.setAttribute("aria-invalid", "true");
}

function clearValidation() {
  formError.textContent = "";
  [firstGradeInput, secondGradeInput].forEach((input) => {
    input.classList.remove("invalid");
    input.removeAttribute("aria-invalid");
  });
}

function formatGrade(value) {
  return new Intl.NumberFormat("es-EC", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearValidation();

  try {
    const firstGrade = readGrade(firstGradeInput, "primer aporte");
    const secondGrade = readGrade(secondGradeInput, "segundo aporte");
    showResult(evaluateGrades(firstGrade, secondGrade));
  } catch (error) {
    formError.textContent = error.message;
    form.querySelector(".invalid")?.focus();
  }
});

form.addEventListener("reset", () => {
  window.setTimeout(() => {
    clearValidation();
    emptyResult.hidden = false;
    resultContent.hidden = true;
  });
});

[firstGradeInput, secondGradeInput].forEach((input) => {
  input.addEventListener("input", () => {
    input.classList.remove("invalid");
    input.removeAttribute("aria-invalid");
    formError.textContent = "";
  });
});
