import React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import confetti from "canvas-confetti";
import "../Pipelines/Pipelines.css";

const steps = [
  "Project Idea & Requirement Analysis",
  "Problem Statement",
  "Literature Survey / Research",
  "Requirement Gathering",
  "System Architecture Design",
  "UI/UX Design",
  "Database Design",
  "Frontend Development",
  "Backend Development",
  "AI/ML Model Development",
  "Voice Recognition Integration",
  "Multilingual Support",
  "API Integration",
  "Authentication & Security",
  "Testing Phase",
  "Performance Optimization",
  "Deployment",
  "Documentation",
  "Final Review",
  "Project Completed",
];

/** How long the completion popup + confetti stay on screen. */
const CELEBRATION_MS = 15000;

/* The board is a vertical serpentine: stages run down the first column, elbow
   across at the bottom, then climb back up the next one. 5 rows x 4 columns
   holds all 20 stages inside a single screen. Phones fall back to the taller
   10 x 2 version, which is the same maths with a different row count. */
const GRID_ROWS = 5;

const rowsForViewport = () => {
  if (typeof window === "undefined") return GRID_ROWS;
  if (window.innerWidth < 480) return steps.length; // single file
  if (window.innerWidth < 760) return 10; // two columns
  return GRID_ROWS;
};

const CONFETTI_COLORS = [
  "#2979ff",
  "#42a5f5",
  "#81d4fa",
  "#4caf50",
  "#a5d6a7",
  "#ffb300",
  "#ff7043",
  "#ffffff",
];

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return "00 : 00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")} : ${secs
    .toString()
    .padStart(2, "0")}`;
};

const randomInRange = (min, max) => Math.random() * (max - min) + min;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** One length of tube. Geometry comes entirely from the variant class. */
const PipeSegment = ({ variant, filled, bubble = false }) => (
  <span
    className={`pipe pipe--${variant} ${filled ? "pipeFilled" : ""}`}
    aria-hidden="true"
  >
    <span className="pipeLiquid">
      <span className="pipeFlow" />
    </span>
    <span className="flange flangeStart" />
    <span className="flange flangeEnd" />
    {bubble && <span className="pipeBubble" />}
  </span>
);

export default function Pipeline() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [rows, setRows] = useState(rowsForViewport);

  useEffect(() => {
    const onResize = () => setRows(rowsForViewport());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const cols = Math.ceil(steps.length / rows);

  const [pipelineState, setPipelineState] = useState(() => {
    if (typeof window === "undefined")
      return { completed: [], startTime: Date.now() };
    try {
      const savedData = window.localStorage.getItem("pipelineData");
      if (savedData) return JSON.parse(savedData);

      const oldSaved = window.localStorage.getItem("pipelineCompleted");
      if (oldSaved) {
        return { completed: JSON.parse(oldSaved), startTime: Date.now() };
      }
    } catch {}
    return { completed: [], startTime: Date.now() };
  });

  const [flowIndex, setFlowIndex] = useState(-1);
  const [elapsed, setElapsed] = useState(0);

  // Celebration overlay state
  const [showCompletion, setShowCompletion] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(CELEBRATION_MS / 1000);
  const confettiFrame = useRef(null);

  const targetCompletedLength = pipelineState.completed.length;
  const isPipelineComplete = targetCompletedLength >= steps.length;
  const status = isPipelineComplete ? "Pipeline Completed" : "Running";
  const currentPath = isPipelineComplete
    ? "Completed"
    : steps[targetCompletedLength];

  const progressPercent = useMemo(
    () => Math.round((Math.max(flowIndex, 0) / steps.length) * 100),
    [flowIndex]
  );

  // ---------------------------------------------------------------- persist
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("pipelineData", JSON.stringify(pipelineState));
    } catch {}
  }, [pipelineState]);

  // ------------------------------------------------------------------ timer
  useEffect(() => {
    if (isPipelineComplete) return;
    const updateElapsed = () =>
      setElapsed(Math.floor((Date.now() - pipelineState.startTime) / 1000));
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [pipelineState.startTime, isPipelineComplete]);

  // --------------------------------------------------------- flow animation
  useEffect(() => {
    let current = -1;
    let interval;
    if (targetCompletedLength > 0) {
      interval = setInterval(() => {
        if (current < targetCompletedLength) {
          current++;
          setFlowIndex(current);
        } else {
          clearInterval(interval);
        }
      }, 350);
    } else {
      setFlowIndex(0);
    }
    return () => clearInterval(interval);
  }, [targetCompletedLength]);

  // ------------------------------------------------ falling confetti (15 s)
  const startConfetti = useCallback(() => {
    if (prefersReducedMotion()) return;

    const end = Date.now() + CELEBRATION_MS;

    // Emoji confetti needs canvas-confetti >= 1.6. On older versions this
    // falls back to paper pieces only, rather than throwing.
    let emojiShapes = [];
    try {
      emojiShapes = [
        confetti.shapeFromText({ text: "🎊", scalar: 2.4 }),
        confetti.shapeFromText({ text: "🎉", scalar: 2.4 }),
      ];
    } catch {
      emojiShapes = [];
    }

    let tick = 0;

    const frame = () => {
      // Drop a few pieces per frame from random points along the top edge,
      // so the fall covers the entire width of the screen.
      confetti({
        particleCount: 4,
        startVelocity: 0,
        ticks: 320,
        gravity: 0.55,
        decay: 0.94,
        drift: randomInRange(-0.6, 0.6),
        scalar: randomInRange(0.7, 1.4),
        shapes: ["square", "circle"],
        colors: CONFETTI_COLORS,
        origin: { x: Math.random(), y: Math.random() * 0.15 - 0.15 },
        zIndex: 10000,
        disableForReducedMotion: true,
      });

      // Emoji drop in more sparingly so they read as accents, not noise.
      tick += 1;
      if (emojiShapes.length && tick % 12 === 0) {
        confetti({
          particleCount: 2,
          startVelocity: 0,
          ticks: 320,
          gravity: 0.45,
          decay: 0.95,
          drift: randomInRange(-0.5, 0.5),
          scalar: 2.4,
          shapes: emojiShapes,
          flat: true,
          origin: { x: Math.random(), y: Math.random() * 0.15 - 0.15 },
          zIndex: 10000,
          disableForReducedMotion: true,
        });
      }

      if (Date.now() < end) {
        confettiFrame.current = requestAnimationFrame(frame);
      }
    };

    // One celebratory burst from each side to open the sequence.
    [0.15, 0.85].forEach((x) =>
      confetti({
        particleCount: 90,
        spread: 70,
        startVelocity: 45,
        origin: { x, y: 0.7 },
        colors: CONFETTI_COLORS,
        zIndex: 10000,
        disableForReducedMotion: true,
      })
    );

    confettiFrame.current = requestAnimationFrame(frame);
  }, []);

  const stopConfetti = useCallback(() => {
    if (confettiFrame.current) cancelAnimationFrame(confettiFrame.current);
    confettiFrame.current = null;
    confetti.reset();
  }, []);

  // Open the popup the moment the last stage lands.
  useEffect(() => {
    if (isPipelineComplete) setShowCompletion(true);
  }, [isPipelineComplete]);

  // Run confetti + countdown while the popup is open, then close it.
  useEffect(() => {
    if (!showCompletion) return;

    setSecondsLeft(CELEBRATION_MS / 1000);
    startConfetti();

    const countdown = setInterval(
      () => setSecondsLeft((s) => Math.max(s - 1, 0)),
      1000
    );
    const closeTimer = setTimeout(() => setShowCompletion(false), CELEBRATION_MS);

    return () => {
      clearInterval(countdown);
      clearTimeout(closeTimer);
      stopConfetti();
    };
  }, [showCompletion, startConfetti, stopConfetti]);

  // Let Escape dismiss the popup early.
  useEffect(() => {
    if (!showCompletion) return;
    const onKey = (e) => e.key === "Escape" && setShowCompletion(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showCompletion]);

  // ------------------------------------------------------------------ audio
  const playDualTone = (stage) => {
    if (typeof window === "undefined") return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playNote = (freq, delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.4);
    };

    const baseFreq = 440 + stage * 20;
    playNote(baseFreq, 0);
    playNote(baseFreq * 1.5, 0.15);
  };

  // ----------------------------------------------------------------- actions
  const handleClick = (index) => {
    if (pipelineState.completed.length === index + 1) return;

    playDualTone(index);
    const newCompleted = Array.from({ length: index + 1 }, (_, i) => i);
    const isComplete = newCompleted.length >= steps.length;

    let completionDate = pipelineState.completionDate;
    if (isComplete && !completionDate) {
      const now = new Date();
      completionDate = `${now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })} ${now.toLocaleTimeString()}`;
    }

    setPipelineState({
      completed: newCompleted,
      startTime: Date.now(),
      completionDate,
    });
  };

  const handleReset = () => {
    stopConfetti();
    setShowCompletion(false);
    setFlowIndex(-1);
    setPipelineState({ completed: [], startTime: Date.now() });
  };

  const completedCount = pipelineState.completed.length;

  return (
    <div className="pipelinePage">
      <div className="pipelinePanel">
        <div className="pipelineHeader">
          <div>
            <h1>{t('pipeline.title')}</h1>
            <p className="subtitle">
              Click a valve to confirm that phase is done. Completed stages stay
              saved across refreshes.
            </p>
          </div>

          <div className="statusBox">
            <div className="statusRow">
              <span className={`chip ${isPipelineComplete ? "done" : "running"}`}>
                <span className="chipDot" />
                {status}
              </span>
              {!isPipelineComplete && (
                <span className="timerBadge">⏱ {formatTime(elapsed)}</span>
              )}
            </div>
            <span className="pathLabel">Current path: {currentPath}</span>
            <div className="statusActions">
              <span className="stageCount">
                {completedCount} / {steps.length} stages
              </span>
              {isPipelineComplete && !showCompletion && (
                <button
                  type="button"
                  className="ghostBtn"
                  onClick={() => setShowCompletion(true)}
                >
                  Show summary
                </button>
              )}
              {completedCount > 0 && (
                <button type="button" className="ghostBtn" onClick={handleReset}>
                  Reset pipeline
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="progressBar">
          <div className="progressTrack" />
          <div className="progressFill" style={{ width: `${progressPercent}%` }}>
            <span>{progressPercent}%</span>
          </div>
        </div>

        <div
          className="pipeline"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {steps.map((step, index) => {
            const isVisuallyCompleted = index < flowIndex;
            const isVisuallyActive = flowIndex === index;
            const isActuallyCompleted = pipelineState.completed.includes(index);
            const isFlowingThrough = isActuallyCompleted && !isVisuallyCompleted;

            let valveClass = "idle";
            if (isVisuallyCompleted) valveClass = "completed";
            else if (isVisuallyActive) valveClass = "active";
            else if (isFlowingThrough) valveClass = "flowing";

            const col = Math.floor(index / rows);
            const posInCol = index % rows;
            const flowsDown = col % 2 === 0;
            const row = flowsDown ? posInCol + 1 : rows - posInCol;

            // Every cell off the bottom grid row carries the tube that links it
            // to the cell underneath. In an up-flowing column that tube belongs
            // to the pair (index - 1, index), so the liquid climbs into it.
            const hasLink = row < rows;
            const linkIndex = flowsDown ? index : index - 1;

            // The last stage of a column elbows across into the next column —
            // under the board at the bottom, over the top of it on the way back.
            const hasCrossover =
              posInCol === rows - 1 && index < steps.length - 1;
            const cross = flowsDown ? "xb" : "xt";

            const stateLabel = isVisuallyCompleted
              ? "Completed"
              : isVisuallyActive
              ? "In progress"
              : "Upcoming";

            return (
              <div
                key={step}
                className="stepContainer"
                style={{ gridRow: row, gridColumn: col + 1 }}
              >
                <button
                  type="button"
                  className={`valve ${valveClass}`}
                  onClick={() => handleClick(index)}
                  aria-label={`${step} — ${stateLabel}`}
                  aria-pressed={isActuallyCompleted}
                >
                  <span className="valveBolts" aria-hidden="true">
                    <i /><i /><i /><i />
                  </span>
                  <span className="valveFace">
                    <span className="valveLabel">
                      {isVisuallyCompleted ? "✓" : index + 1}
                    </span>
                  </span>
                  <span className="valveLed" aria-hidden="true" />
                  {isVisuallyCompleted && (
                    <span className="sparkles" aria-hidden="true">
                      <i /><i /><i />
                    </span>
                  )}
                </button>

                {hasLink && (
                  <PipeSegment
                    variant={flowsDown ? "vert" : "vertUp"}
                    filled={linkIndex < flowIndex}
                    bubble={
                      flowIndex === linkIndex &&
                      pipelineState.completed.includes(linkIndex)
                    }
                  />
                )}

                {hasCrossover && (
                  <>
                    <PipeSegment
                      variant={`${cross}Start`}
                      filled={isVisuallyCompleted}
                    />
                    <PipeSegment
                      variant={`${cross}Run`}
                      filled={isVisuallyCompleted}
                      bubble={flowIndex === index && isActuallyCompleted}
                    />
                    <PipeSegment
                      variant={`${cross}End`}
                      filled={isVisuallyCompleted}
                    />
                  </>
                )}

                <div className="stepText">
                  <strong>{step}</strong>
                  <span
                    className={
                      isVisuallyCompleted
                        ? "textCompleted"
                        : isVisuallyActive
                        ? "textActive"
                        : "textIdle"
                    }
                  >
                    {stateLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showCompletion && (
        <div
          className="completionOverlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="completionTitle"
        >
          <div className="completionCard">
            <button
              type="button"
              className="closeBtn"
              onClick={() => setShowCompletion(false)}
              aria-label={t('common.close')}
            >
              ×
            </button>

            <div className="trophy" aria-hidden="true">🏆</div>

            <h2 id="completionTitle" className="completionTitle">
              Welcome to the finish line
            </h2>

            <p className="completionLead">
              Every phase of the project pipeline is complete. Great work getting
              it all the way through.
            </p>

            <div className="completionStats">
              <div className="statBlock">
                <span className="statValue">{steps.length}</span>
                <span className="statLabel">{t('pipeline.stagesCleared')}</span>
              </div>
              <div className="statBlock">
                <span className="statValue">100%</span>
                <span className="statLabel">{t('pipeline.completion')}</span>
              </div>
              <div className="statBlock">
                <span className="statValue">{t('pipeline.delivered')}</span>
                <span className="statLabel">{t('pipeline.status')}</span>
              </div>
            </div>

            <div className="completionDate">
              Completed on
              <strong>{pipelineState.completionDate || "—"}</strong>
            </div>

            <button className="meetTeamBtn" onClick={() => navigate("/team")}>
              Meet our team members
            </button>

            <div className="autoClose">
              <span>Closing in {secondsLeft}s</span>
              <span className="autoCloseTrack" aria-hidden="true">
                <span className="autoCloseFill" />
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}