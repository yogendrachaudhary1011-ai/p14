
(() => {
  const init = () => {
    const safariView = document.getElementById('safariView');
    if (safariView) {
      const steps = Array.from(safariView.querySelectorAll('.safari-process-step'));
      const cards = Array.from(safariView.querySelectorAll('[data-safari-feature]'));
      const processFlow = safariView.querySelector('.safari-process-flow');
      let progressTimer;
      const setSafariProgress = (selectedIndex) => {
        const previousIndex = Number(processFlow?.dataset.progressIndex ?? -1);
        if (processFlow && previousIndex !== selectedIndex && previousIndex >= 0) {
          processFlow.classList.remove('is-progressing');
          window.requestAnimationFrame(() => {
            processFlow.classList.add('is-progressing');
          });
          window.clearTimeout(progressTimer);
          progressTimer = window.setTimeout(() => {
            processFlow.classList.remove('is-progressing');
          }, 620);
        }
        if (processFlow) processFlow.dataset.progressIndex = String(selectedIndex);
        steps.forEach((item, index) => {
          const complete = index < selectedIndex;
          const active = index === selectedIndex;
          const reached = index <= selectedIndex;
          item.classList.toggle('is-complete', complete);
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', reached ? 'true' : 'false');
          if (active) item.setAttribute('aria-current', 'step');
          else item.removeAttribute('aria-current');
        });
        const target = steps[selectedIndex]?.dataset.safariStep;
        cards.forEach((card) => {
          card.classList.toggle('is-focused', card.dataset.safariFeature === target);
        });
      };
      steps.forEach((step, index) => {
        step.addEventListener('click', () => setSafariProgress(index));
      });
      setSafariProgress(0);

      safariView.querySelectorAll('[data-safari-fullscreen]').forEach((button) => {
        button.addEventListener('click', () => {
          const stage = button.closest('.safari-prototype-embed-stage, .safari-prototype-mobile-stage');
          if (!stage) return;
          if (document.fullscreenElement) {
            document.exitFullscreen?.();
          } else {
            stage.requestFullscreen?.().catch(() => {});
          }
        });
      });
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
