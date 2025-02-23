import {assertInstance} from '../utils/asserts.js';

const dialog = assertInstance(
  document.getElementById('ds-dialog'),
  HTMLDialogElement
);
const dialogTitle = assertInstance(
  document.getElementById('ds-title'),
  HTMLHeadingElement
);
const dialogBody = assertInstance(
  document.getElementById('ds-body'),
  HTMLParagraphElement
);
const dialogPrimaryAction = assertInstance(
  document.getElementById('ds-primary-action'),
  HTMLButtonElement
);
const dialogSecondaryAction = assertInstance(
  document.getElementById('ds-secondary-action'),
  HTMLButtonElement
);

dialog.addEventListener('click', ({target}) => {
  if (target instanceof Element && target.matches('menu button')) {
    dialog.close(/** @type {!HTMLButtonElement} */ (target).value);
  }
});

/**
 * Configuration for a button with its label and value.
 * @typedef {object} ButtonConfig
 * @property {string} label
 * @property {string} value
 */

/**
 * Configuration for rendering a dialog.
 * @typedef {object} DialogConfig
 * @property {string} title
 * @property {string} bodyText
 * @property {!ButtonConfig} primaryButton
 * @property {!ButtonConfig} [secondaryButton]
 */

/**
 * Opens a dialog with configuration describing which buttons to render.
 * @param {!DialogConfig} config
 * @returns {!Promise<string>} The value of the button clicked, or the empty
 *     string if cancelled with the Escape key. Rejects if the dialog is already
 *     open.
 */
export async function openDialog({
  title,
  bodyText,
  primaryButton,
  secondaryButton,
}) {
  if (dialog.open) throw new Error('Dialog already open');

  dialog.returnValue = '';
  dialogTitle.textContent = title;
  dialogBody.textContent = bodyText;
  dialogPrimaryAction.textContent = primaryButton.label;
  dialogPrimaryAction.value = primaryButton.value;
  dialogSecondaryAction.hidden = !!secondaryButton;
  if (secondaryButton) {
    dialogSecondaryAction.textContent = secondaryButton.label;
    dialogSecondaryAction.value = secondaryButton.value;
  }

  return new Promise((resolve) => {
    dialog.addEventListener('close', () => resolve(dialog.returnValue), {
      once: true,
    });
  });
}
