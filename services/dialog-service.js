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
 * Actions for a confirmation dialog.
 * @enum {string}
 */
export const DialogAction = {
  CONFIRM: 'confirm',
  CANCEL: 'cancel',
};

/**
 * Configuration for an action button with its label and value.
 * @typedef {object} ButtonConfig
 * @property {string} label
 * @property {string} [value]
 */

/**
 * Configuration for rendering a dialog.
 * @typedef {object} DialogConfig
 * @property {('dialog' | 'alertdialog')} [role]
 * @property {string} title
 * @property {(!Node | string)} body Must be phrasing content only. See
 *     {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Content_categories#phrasing_content}.
 * @property {!ButtonConfig} primaryButton
 * @property {!ButtonConfig} [secondaryButton]
 */

/**
 * Opens a cancelable dialog with configuration for content and actions.
 * @param {!DialogConfig} config
 * @returns {!Promise<string>} Resolves to the value of the button clicked, or
 *     the empty string if canceled with the Escape key. Rejects if the dialog
 *     is already open.
 */
export async function openDialog({
  role = 'dialog',
  title,
  body,
  primaryButton,
  secondaryButton,
}) {
  if (dialog.open) throw new Error('Dialog already open');

  dialog.returnValue = '';
  dialog.role = role;
  dialogTitle.textContent = title;
  dialogBody.replaceChildren(body);
  dialogPrimaryAction.textContent = primaryButton.label;
  dialogPrimaryAction.value = primaryButton.value ?? '';
  dialogSecondaryAction.hidden = !secondaryButton;
  if (secondaryButton) {
    dialogSecondaryAction.textContent = secondaryButton.label;
    dialogSecondaryAction.value = secondaryButton.value ?? '';
  }

  const result = new Promise((resolve) => {
    dialog.addEventListener('close', () => resolve(dialog.returnValue), {
      once: true,
    });
  });
  dialog.showModal();
  return result;
}
