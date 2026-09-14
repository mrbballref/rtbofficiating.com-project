'use strict';

const FORM_TEMPLATES = window.FORM_TEMPLATES || {};

const IRS_PDF_URLS = {
  w9: 'https://www.irs.gov/pub/irs-pdf/fw9.pdf',
  w4: 'https://www.irs.gov/pub/irs-pdf/fw4.pdf',
  w2: 'https://www.irs.gov/pub/irs-pdf/fw2.pdf',
  nec1099: 'https://www.irs.gov/pub/irs-pdf/f1099nec.pdf',
  misc1099: 'https://www.irs.gov/pub/irs-pdf/f1099msc.pdf',
  int1099: 'https://www.irs.gov/pub/irs-pdf/f1099int.pdf',
  div1099: 'https://www.irs.gov/pub/irs-pdf/f1099div.pdf',
  k1099: 'https://www.irs.gov/pub/irs-pdf/f1099k.pdf',
  r1099: 'https://www.irs.gov/pub/irs-pdf/f1099r.pdf',
  f1040: 'https://www.irs.gov/pub/irs-pdf/f1040.pdf',
  scheduleC: 'https://www.irs.gov/pub/irs-pdf/f1040sc.pdf',
  f1040es: 'https://www.irs.gov/pub/irs-pdf/f1040es.pdf',
  f1040x: 'https://www.irs.gov/pub/irs-pdf/f1040x.pdf',
  f941: 'https://www.irs.gov/pub/irs-pdf/f941.pdf',
  f940: 'https://www.irs.gov/pub/irs-pdf/f940.pdf',
  ss4: 'https://www.irs.gov/pub/irs-pdf/fss4.pdf',
  w7: 'https://www.irs.gov/pub/irs-pdf/fw7.pdf',
  f4506t: 'https://www.irs.gov/pub/irs-pdf/f4506t.pdf',
  f2848: 'https://www.irs.gov/pub/irs-pdf/f2848.pdf',
  f9465: 'https://www.irs.gov/pub/irs-pdf/f9465.pdf',
  w8ben: 'https://www.irs.gov/pub/irs-pdf/fw8ben.pdf',
  f1065: 'https://www.irs.gov/pub/irs-pdf/f1065.pdf',
  f1120: 'https://www.irs.gov/pub/irs-pdf/f1120.pdf',
  f1120s: 'https://www.irs.gov/pub/irs-pdf/f1120s.pdf',
  f990: 'https://www.irs.gov/pub/irs-pdf/f990.pdf',
  f1041: 'https://www.irs.gov/pub/irs-pdf/f1041.pdf'
};

const CURRENT_IRS_REVISIONS = {
  w9: 'Rev. March 2024',
  w4: '2026',
  w2: '2026',
  nec1099: 'Rev. December 2026',
  misc1099: 'Rev. December 2026',
  int1099: 'Rev. January 2024',
  div1099: 'Rev. January 2024',
  k1099: 'Rev. December 2026',
  r1099: '2026',
  f1040: '2025',
  scheduleC: '2025',
  f1040es: '2026',
  f1040x: 'Rev. December 2025',
  f941: 'Rev. March 2026',
  f940: '2025',
  ss4: 'Rev. December 2025',
  w7: 'Rev. December 2024',
  f4506t: 'Rev. April 2025',
  f2848: 'Rev. January 2021',
  f9465: 'Rev. September 2020',
  w8ben: 'Rev. October 2021',
  f1065: '2025',
  f1120: '2025',
  f1120s: '2025',
  f990: '2025',
  f1041: '2025'
};

Object.entries(IRS_PDF_URLS).forEach(([key, url]) => {
  if (!FORM_TEMPLATES[key]) return;
  FORM_TEMPLATES[key].pdfUrl = url;
  if (CURRENT_IRS_REVISIONS[key]) FORM_TEMPLATES[key].revision = CURRENT_IRS_REVISIONS[key];
});

const state = {
  id: crypto.randomUUID(),
  name: 'W-9 — Taxpayer ID and Certification',
  type: 'w9',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  editing: true,
  dirty: false,
  zoom: 1,
  sourceKind: null,
  sourceFileName: null,
  originalPdfBytes: null,
  pdfBytes: null,
  signature: null,
  signatureType: null,
  signatureTarget: null,
  signedAt: null
};

const elements = {
  formType: document.getElementById('formType'),
  newFormType: document.getElementById('newFormType'),
  newFormName: document.getElementById('newFormName'),
  formAgency: document.getElementById('formAgency'),
  formRevision: document.getElementById('formRevision'),
  formNumber: document.getElementById('formNumber'),
  formPurpose: document.getElementById('formPurpose'),
  officialFormLink: document.getElementById('officialFormLink'),
  officialPdfLink: document.getElementById('officialPdfLink'),
  officialInstructionsLink: document.getElementById('officialInstructionsLink'),
  loadOfficialBtn: document.getElementById('loadOfficialBtn'),
  uploadPdfBtn: document.getElementById('uploadPdfBtn'),
  dashboardProfileBtn: document.getElementById('dashboardProfileBtn'),
  pdfFileInput: document.getElementById('pdfFileInput'),
  sourceNotice: document.getElementById('sourceNotice'),
  taxForm: document.getElementById('taxForm'),
  editorTitle: document.getElementById('editorTitle'),
  fieldSearch: document.getElementById('fieldSearch'),
  fieldSummary: document.getElementById('fieldSummary'),
  saveStatus: document.getElementById('saveStatus'),
  createBtn: document.getElementById('createBtn'),
  editBtn: document.getElementById('editBtn'),
  saveBtn: document.getElementById('saveBtn'),
  printBtn: document.getElementById('printBtn'),
  printPreviewBtn: document.getElementById('printPreviewBtn'),
  emailBtn: document.getElementById('emailBtn'),
  signatureBtn: document.getElementById('signatureBtn'),
  vaultBtn: document.getElementById('vaultBtn'),
  createDialog: document.getElementById('createDialog'),
  confirmCreateBtn: document.getElementById('confirmCreateBtn'),
  emailDialog: document.getElementById('emailDialog'),
  emailForm: document.getElementById('emailForm'),
  emailTo: document.getElementById('emailTo'),
  emailSubject: document.getElementById('emailSubject'),
  emailMessage: document.getElementById('emailMessage'),
  sendEmailBtn: document.getElementById('sendEmailBtn'),
  signatureDialog: document.getElementById('signatureDialog'),
  signatureCanvas: document.getElementById('signatureCanvas'),
  signatureConsent: document.getElementById('signatureConsent'),
  signatureTarget: document.getElementById('signatureTarget'),
  typedSignature: document.getElementById('typedSignature'),
  typedSignaturePreview: document.getElementById('typedSignaturePreview'),
  applySignatureBtn: document.getElementById('applySignatureBtn'),
  clearSignatureBtn: document.getElementById('clearSignatureBtn'),
  drawTab: document.getElementById('drawTab'),
  typeTab: document.getElementById('typeTab'),
  drawSignaturePanel: document.getElementById('drawSignaturePanel'),
  typeSignaturePanel: document.getElementById('typeSignaturePanel'),
  vaultDialog: document.getElementById('vaultDialog'),
  closeVaultBtn: document.getElementById('closeVaultBtn'),
  vaultList: document.getElementById('vaultList'),
  zoomIn: document.getElementById('zoomIn'),
  zoomOut: document.getElementById('zoomOut'),
  zoomLabel: document.getElementById('zoomLabel'),
  pdfFrame: document.getElementById('pdfFrame'),
  pdfEmptyState: document.getElementById('pdfEmptyState'),
  pdfLoading: document.getElementById('pdfLoading'),
  toast: document.getElementById('toast')
};

let pdfDocument = null;
let pdfForm = null;
let pdfFields = [];
let currentPdfObjectUrl = null;
let renderTimer = null;
let toastTimer = null;
let signatureMode = 'draw';
let drawing = false;
let lastPoint = null;
let dbPromise = null;
let pendingFileAction = null;
let dashboardContext = null;
let taxDocumentSyncStarted = false;

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getTemplate(type = state.type) {
  return FORM_TEMPLATES[type] || {};
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  toastTimer = setTimeout(() => elements.toast.classList.remove('show'), 3400);
}

function setStatus(message) {
  elements.saveStatus.textContent = message;
}

function markDirty() {
  state.dirty = true;
  state.updatedAt = new Date().toISOString();
  setStatus('Unsaved PDF changes');
}

function markSaved() {
  state.dirty = false;
  state.updatedAt = new Date().toISOString();
  setStatus('Saved to device and vault');
}

function populateFormSelectors() {
  const groups = new Map();
  Object.entries(FORM_TEMPLATES).forEach(([key, template]) => {
    const group = template.group || 'Other Government Forms';
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push({ key, template });
  });

  const markup = Array.from(groups.entries()).map(([group, forms]) => `
    <optgroup label="${escapeHtml(group)}">
      ${forms.map(({ key, template }) => `<option value="${escapeHtml(key)}">${escapeHtml(template.shortTitle || `${template.formNumber} — ${template.title}`)}</option>`).join('')}
    </optgroup>
  `).join('');

  elements.formType.innerHTML = markup;
  elements.newFormType.innerHTML = markup;
  elements.formType.value = state.type;
  elements.newFormType.value = state.type;
}

function renderMetadata() {
  const template = getTemplate();
  const pdfUrl = template.pdfUrl || '';
  elements.formAgency.textContent = template.agency || 'Government agency';
  elements.formRevision.textContent = template.revision || 'Verify current revision';
  elements.formNumber.textContent = template.formNumber || 'Official Government Form';
  elements.formPurpose.textContent = template.purpose || 'Upload the official fillable PDF issued by the applicable government agency.';
  elements.officialFormLink.href = template.officialUrl || '#';
  elements.officialInstructionsLink.href = template.instructionsUrl || template.officialUrl || '#';
  elements.officialPdfLink.href = pdfUrl || '#';
  elements.officialFormLink.hidden = !template.officialUrl;
  elements.officialInstructionsLink.hidden = !(template.instructionsUrl || template.officialUrl);
  elements.officialPdfLink.hidden = !pdfUrl;
  elements.loadOfficialBtn.textContent = pdfUrl ? 'Load Official IRS Form' : 'Choose Government PDF';
}

function setLoading(loading, message = 'Loading the official PDF…') {
  elements.pdfLoading.hidden = !loading;
  if (loading) {
    elements.pdfLoading.querySelector('strong').textContent = message;
    elements.pdfEmptyState.hidden = true;
    elements.pdfFrame.hidden = true;
  }
}

function clearPdfObjectUrl() {
  if (currentPdfObjectUrl) {
    URL.revokeObjectURL(currentPdfObjectUrl);
    currentPdfObjectUrl = null;
  }
}

function showExactRemotePdf(url) {
  clearPdfObjectUrl();
  elements.pdfFrame.src = `${url}#view=FitH&zoom=${Math.round(state.zoom * 100)}`;
  elements.pdfFrame.hidden = false;
  elements.pdfEmptyState.hidden = true;
  elements.pdfLoading.hidden = true;
}

function showLocalPdf(bytes) {
  clearPdfObjectUrl();
  const blob = new Blob([bytes], { type: 'application/pdf' });
  currentPdfObjectUrl = URL.createObjectURL(blob);
  elements.pdfFrame.src = `${currentPdfObjectUrl}#view=FitH&zoom=${Math.round(state.zoom * 100)}`;
  elements.pdfFrame.hidden = false;
  elements.pdfEmptyState.hidden = true;
  elements.pdfLoading.hidden = true;
}

function resetPdfWorkspace({ keepType = true } = {}) {
  clearTimeout(renderTimer);
  clearPdfObjectUrl();
  pdfDocument = null;
  pdfForm = null;
  pdfFields = [];
  state.originalPdfBytes = null;
  state.pdfBytes = null;
  state.sourceKind = null;
  state.sourceFileName = null;
  state.signature = null;
  state.signatureType = null;
  state.signatureTarget = null;
  state.signedAt = null;
  state.dirty = false;
  state.zoom = 1;
  if (!keepType) state.type = 'w9';
  elements.taxForm.innerHTML = '';
  elements.fieldSummary.textContent = 'No PDF loaded.';
  elements.editorTitle.textContent = 'Load a form to begin';
  elements.fieldSearch.value = '';
  elements.pdfFrame.removeAttribute('src');
  elements.pdfFrame.hidden = true;
  elements.pdfEmptyState.hidden = false;
  elements.pdfLoading.hidden = true;
  elements.zoomLabel.textContent = '100%';
}

function prettyFieldName(name) {
  return String(name || 'Unnamed field')
    .replace(/\[\d+\]/g, '')
    .replace(/[_.:/-]+/g, ' ')
    .replace(/\b(topmostSubform|Page\d+|form1|f1_\d+)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim() || String(name || 'Unnamed field');
}

function decodePdfString(value) {
  try {
    if (!value) return '';
    if (typeof value.decodeText === 'function') return value.decodeText();
    return String(value);
  } catch {
    return '';
  }
}

function getFieldLabel(field) {
  const alternate = decodePdfString(field?.acroField?.getAlternateName?.());
  const mapping = decodePdfString(field?.acroField?.getMappingName?.());
  return alternate || mapping || prettyFieldName(field.getName());
}

function fieldType(field) {
  return field?.constructor?.name || 'PDFField';
}

function fieldValue(field) {
  const type = fieldType(field);
  try {
    if (type === 'PDFTextField') return field.getText() || '';
    if (type === 'PDFCheckBox') return field.isChecked();
    if (type === 'PDFRadioGroup') return field.getSelected() || '';
    if (type === 'PDFDropdown') return field.getSelected()?.[0] || '';
    if (type === 'PDFOptionList') return field.getSelected() || [];
  } catch (error) {
    console.warn('Could not read PDF field', field.getName(), error);
  }
  return '';
}

function renderPdfFieldControl(field, index) {
  const type = fieldType(field);
  const name = field.getName();
  const label = getFieldLabel(field);
  const value = fieldValue(field);
  const disabled = !state.editing || field.isReadOnly?.() ? 'disabled' : '';
  const common = `data-pdf-field-index="${index}" data-pdf-field-name="${escapeHtml(name)}" ${disabled}`;

  if (type === 'PDFTextField') {
    const maxLength = field.getMaxLength?.();
    const max = Number.isFinite(maxLength) && maxLength > 0 ? `maxlength="${maxLength}"` : '';
    if (field.isMultiline?.()) {
      return `<label class="pdf-field-card" data-search-text="${escapeHtml(`${label} ${name}`.toLowerCase())}">
        <span class="field-label">${escapeHtml(label)}</span>
        <span class="pdf-technical-name">${escapeHtml(name)}</span>
        <textarea class="control textarea" rows="3" ${common} ${max}>${escapeHtml(value)}</textarea>
      </label>`;
    }
    return `<label class="pdf-field-card" data-search-text="${escapeHtml(`${label} ${name}`.toLowerCase())}">
      <span class="field-label">${escapeHtml(label)}</span>
      <span class="pdf-technical-name">${escapeHtml(name)}</span>
      <input class="control" type="text" value="${escapeHtml(value)}" ${common} ${max} />
    </label>`;
  }

  if (type === 'PDFCheckBox') {
    return `<label class="pdf-field-card pdf-checkbox-card" data-search-text="${escapeHtml(`${label} ${name}`.toLowerCase())}">
      <span><input type="checkbox" ${value ? 'checked' : ''} ${common} /> <strong>${escapeHtml(label)}</strong></span>
      <span class="pdf-technical-name">${escapeHtml(name)}</span>
    </label>`;
  }

  if (type === 'PDFRadioGroup' || type === 'PDFDropdown') {
    const options = type === 'PDFRadioGroup' ? field.getOptions() : field.getOptions();
    const optionsMarkup = ['<option value="">Select an option</option>', ...options.map(option => `<option value="${escapeHtml(option)}" ${value === option ? 'selected' : ''}>${escapeHtml(option)}</option>`)].join('');
    return `<label class="pdf-field-card" data-search-text="${escapeHtml(`${label} ${name}`.toLowerCase())}">
      <span class="field-label">${escapeHtml(label)}</span>
      <span class="pdf-technical-name">${escapeHtml(name)}</span>
      <select class="control" ${common}>${optionsMarkup}</select>
    </label>`;
  }

  if (type === 'PDFOptionList') {
    const selected = Array.isArray(value) ? value : [];
    const optionsMarkup = field.getOptions().map(option => `<option value="${escapeHtml(option)}" ${selected.includes(option) ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('');
    return `<label class="pdf-field-card" data-search-text="${escapeHtml(`${label} ${name}`.toLowerCase())}">
      <span class="field-label">${escapeHtml(label)}</span>
      <span class="pdf-technical-name">${escapeHtml(name)}</span>
      <select class="control" multiple size="4" ${common}>${optionsMarkup}</select>
    </label>`;
  }

  if (type === 'PDFSignature') {
    return `<div class="pdf-field-card signature-field-card" data-search-text="${escapeHtml(`${label} ${name}`.toLowerCase())}">
      <strong>${escapeHtml(label)}</strong>
      <span class="pdf-technical-name">${escapeHtml(name)}</span>
      <button class="btn btn-accent btn-small" type="button" data-open-signature-for="${index}">Apply E-Signature</button>
    </div>`;
  }

  return `<div class="pdf-field-card unsupported-field-card" data-search-text="${escapeHtml(`${label} ${name}`.toLowerCase())}">
    <strong>${escapeHtml(label)}</strong>
    <span class="pdf-technical-name">${escapeHtml(name)}</span>
    <span class="field-help">This PDF control is maintained by the official document viewer.</span>
  </div>`;
}

function renderPdfFieldEditor() {
  if (!pdfFields.length) {
    elements.editorTitle.textContent = 'Official PDF viewer';
    elements.fieldSummary.textContent = 'This PDF does not expose editable AcroForm fields to the browser. You can still fill it in the embedded official viewer, or upload a completed PDF for saving to the vault.';
    elements.taxForm.innerHTML = '';
    populateSignatureTargets();
    return;
  }

  const editableCount = pdfFields.filter(field => ['PDFTextField', 'PDFCheckBox', 'PDFRadioGroup', 'PDFDropdown', 'PDFOptionList', 'PDFSignature'].includes(fieldType(field))).length;
  elements.editorTitle.textContent = `${getTemplate().formNumber || 'Official Form'} Fields`;
  elements.fieldSummary.textContent = `${pdfFields.length} PDF controls found · ${editableCount} supported in the generator`;
  elements.taxForm.innerHTML = pdfFields.map(renderPdfFieldControl).join('');
  bindPdfFieldControls();
  filterFieldCards();
  populateSignatureTargets();
}

function bindPdfFieldControls() {
  elements.taxForm.querySelectorAll('[data-pdf-field-index]').forEach(control => {
    const eventName = control.type === 'checkbox' || control.tagName === 'SELECT' ? 'change' : 'input';
    control.addEventListener(eventName, () => updatePdfFieldFromControl(control));
  });
  elements.taxForm.querySelectorAll('[data-open-signature-for]').forEach(button => {
    button.addEventListener('click', () => {
      elements.signatureTarget.value = button.dataset.openSignatureFor;
      openSignatureDialog();
    });
  });
}

function filterFieldCards() {
  const query = elements.fieldSearch.value.trim().toLowerCase();
  let visible = 0;
  elements.taxForm.querySelectorAll('[data-search-text]').forEach(card => {
    const show = !query || card.dataset.searchText.includes(query);
    card.hidden = !show;
    if (show) visible += 1;
  });
  if (pdfFields.length) {
    elements.fieldSummary.textContent = query ? `${visible} matching PDF fields` : `${pdfFields.length} PDF controls found`;
  }
}

function updatePdfFieldFromControl(control) {
  const index = Number(control.dataset.pdfFieldIndex);
  const field = pdfFields[index];
  if (!field || !state.editing) return;
  const type = fieldType(field);

  try {
    if (type === 'PDFTextField') field.setText(control.value || '');
    if (type === 'PDFCheckBox') control.checked ? field.check() : field.uncheck();
    if (type === 'PDFRadioGroup') control.value ? field.select(control.value) : field.clear?.();
    if (type === 'PDFDropdown') control.value ? field.select(control.value) : field.clear();
    if (type === 'PDFOptionList') {
      const values = Array.from(control.selectedOptions).map(option => option.value);
      values.length ? field.select(values) : field.clear();
    }
    markDirty();
    schedulePdfRefresh();
  } catch (error) {
    console.error(error);
    showToast(`That official PDF field could not be changed: ${getFieldLabel(field)}`);
  }
}

function schedulePdfRefresh() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => refreshPdfBytesAndPreview(), 220);
}

async function refreshPdfBytesAndPreview() {
  if (!pdfDocument) return;
  try {
    pdfForm?.updateFieldAppearances?.();
    const saved = await pdfDocument.save({ useObjectStreams: false, addDefaultPage: false });
    state.pdfBytes = new Uint8Array(saved);
    state.updatedAt = new Date().toISOString();
    showLocalPdf(state.pdfBytes);
  } catch (error) {
    console.error(error);
    showToast('The official PDF preview could not be refreshed. Your field entries remain in the editor.');
  }
}

async function loadPdfBytes(bytes, { sourceKind = 'upload', fileName = 'government-form.pdf' } = {}) {
  if (!window.PDFLib?.PDFDocument) {
    throw new Error('The PDF editing library did not load. Check the internet connection and reload the app.');
  }
  setLoading(true, 'Reading the official PDF fields…');
  const cleanBytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const doc = await window.PDFLib.PDFDocument.load(cleanBytes, {
    ignoreEncryption: true,
    updateMetadata: false,
    throwOnInvalidObject: false
  });
  const form = doc.getForm();
  try {
    if (form.hasXFA?.()) form.deleteXFA();
  } catch (error) {
    console.warn('XFA could not be removed', error);
  }

  pdfDocument = doc;
  pdfForm = form;
  pdfFields = form.getFields();
  state.originalPdfBytes = cleanBytes.slice();
  state.pdfBytes = cleanBytes.slice();
  state.sourceKind = sourceKind;
  state.sourceFileName = fileName;
  state.updatedAt = new Date().toISOString();
  state.dirty = false;
  renderPdfFieldEditor();
  await refreshPdfBytesAndPreview();
  setStatus(sourceKind === 'irs' ? 'Official IRS PDF loaded' : 'Government PDF loaded');
  elements.sourceNotice.textContent = `${fileName} is loaded as the exact document layer. Changes are written into the PDF fields and preserved when you save.`;
}

async function fetchOfficialPdf() {
  const template = getTemplate();
  const url = template.pdfUrl;
  if (!url) {
    pendingFileAction = 'load';
    elements.pdfFileInput.click();
    return;
  }

  setLoading(true);
  setStatus('Loading official IRS PDF');
  try {
    const response = await fetch(url, { mode: 'cors', cache: 'no-store', credentials: 'omit' });
    if (!response.ok) throw new Error(`IRS PDF request failed (${response.status})`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const fileName = url.split('/').pop() || `${state.type}.pdf`;
    await loadPdfBytes(bytes, { sourceKind: 'irs', fileName });
    showToast('The original IRS PDF is loaded and ready to complete.');
  } catch (error) {
    console.warn('Direct PDF editing unavailable; using exact embedded IRS PDF.', error);
    pdfDocument = null;
    pdfForm = null;
    pdfFields = [];
    state.pdfBytes = null;
    state.sourceKind = 'remote-viewer';
    state.sourceFileName = url.split('/').pop() || 'irs-form.pdf';
    renderPdfFieldEditor();
    showExactRemotePdf(url);
    setStatus('Official PDF viewer loaded');
    elements.sourceNotice.innerHTML = 'The exact IRS PDF is displayed in the embedded viewer. This browser blocked direct field access. Complete and download the PDF in the viewer, then use <strong>Upload Government PDF</strong> so Save Form can place the completed PDF in your chosen location and Document Vault.';
    showToast('Exact IRS PDF loaded. Upload the completed download to use vault saving.');
  }
}

async function handleUploadedPdf(file) {
  if (!file) return;
  if (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    showToast('Choose a PDF file issued by the applicable government agency.');
    return;
  }
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    state.name = state.name || file.name.replace(/\.pdf$/i, '');
    await loadPdfBytes(bytes, { sourceKind: 'upload', fileName: file.name });
    markDirty();
    if (pendingFileAction === 'save') await handleSave();
    if (pendingFileAction === 'email') handleEmailOpen();
    if (pendingFileAction === 'print') handlePrintPreview();
  } catch (error) {
    console.error(error);
    showToast(`The PDF could not be loaded: ${error.message}`);
  } finally {
    pendingFileAction = null;
    elements.pdfFileInput.value = '';
  }
}

function getSafeFileName(extension = 'pdf') {
  const base = state.name.trim().replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '') || 'tax-form';
  return `${base}.${extension}`;
}

function postTaxDocumentToDashboard(record, bytes, options = {}) {
  if (window.parent === window || !record?.id || !bytes?.length) return;
  const dataBytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const data = dataBytes.buffer.slice(dataBytes.byteOffset, dataBytes.byteOffset + dataBytes.byteLength);
  const template = getTemplate(record.type);
  const safeBase = String(record.name || template.shortTitle || 'tax-form').trim().replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '') || 'tax-form';
  window.parent.postMessage({ type: 'gunr-document-save', payload: {
    source: 'tax-form-generator', sourceId: record.id, name: `${safeBase}.pdf`, type: 'application/pdf',
    documentCategory: 'tax-forms', status: record.signedAt ? 'Signed' : 'Completed',
    description: template.purpose || template.shortTitle || record.name,
    tags: [template.formNumber, template.revision].filter(Boolean),
    activity: options.activity || 'Generated', silent: options.silent === true, data
  } }, '*', [data]);
}

function sendTaxDocumentToDashboard(options = {}) {
  if (!state.pdfBytes?.length) return;
  postTaxDocumentToDashboard(state, state.pdfBytes, options);
}

async function syncAllTaxDocumentsToDashboard() {
  if (window.parent === window) return;
  const records = await getVaultDocuments();
  for (const record of records) {
    if (!(record.pdfBlob instanceof Blob)) continue;
    const bytes = new Uint8Array(await record.pdfBlob.arrayBuffer());
    postTaxDocumentToDashboard(record, bytes, { silent: true, activity: 'Synced' });
  }
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1800);
}

async function savePdfToChosenLocation(bytes) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  if ('showSaveFilePicker' in window) {
    const handle = await window.showSaveFilePicker({
      suggestedName: getSafeFileName('pdf'),
      types: [{ description: 'Completed Tax Form PDF', accept: { 'application/pdf': ['.pdf'] } }]
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return;
  }
  downloadBlob(blob, getSafeFileName('pdf'));
}

function openVaultDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open('TaxFormGeneratorVault', 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('forms')) {
        const store = db.createObjectStore('forms', { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function saveToVault() {
  const db = await openVaultDb();
  const record = {
    id: state.id,
    name: state.name,
    type: state.type,
    createdAt: state.createdAt,
    updatedAt: new Date().toISOString(),
    sourceKind: state.sourceKind,
    sourceFileName: state.sourceFileName,
    pdfBlob: new Blob([state.pdfBytes], { type: 'application/pdf' }),
    signature: state.signature,
    signatureType: state.signatureType,
    signatureTarget: state.signatureTarget,
    signedAt: state.signedAt,
    version: 4
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction('forms', 'readwrite');
    tx.objectStore('forms').put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getVaultDocuments() {
  const db = await openVaultDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('forms', 'readonly');
    const request = tx.objectStore('forms').getAll();
    request.onsuccess = () => resolve(request.result.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))));
    request.onerror = () => reject(request.error);
  });
}

async function deleteFromVault(id) {
  const db = await openVaultDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('forms', 'readwrite');
    tx.objectStore('forms').delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function ensurePdfBytes(action) {
  if (state.pdfBytes?.length) return true;
  pendingFileAction = action;
  elements.pdfFileInput.click();
  showToast('Select the completed PDF downloaded from the official viewer.');
  return false;
}

async function handleSave() {
  if (!(await ensurePdfBytes('save'))) return;
  try {
    if (pdfDocument) await refreshPdfBytesAndPreview();
    await savePdfToChosenLocation(state.pdfBytes);
    await saveToVault();
    sendTaxDocumentToDashboard();
    markSaved();
    showToast('Completed PDF saved to your chosen location and Document Vault.');
  } catch (error) {
    if (error?.name === 'AbortError') {
      showToast('Save canceled. The Document Vault was not changed.');
      return;
    }
    console.error(error);
    showToast('The completed PDF could not be saved.');
  }
}

function currentPreviewUrl() {
  if (currentPdfObjectUrl) return currentPdfObjectUrl;
  return getTemplate().pdfUrl || null;
}

async function handlePrintPreview() {
  if (!state.pdfBytes?.length && !currentPreviewUrl()) {
    pendingFileAction = 'print';
    elements.pdfFileInput.click();
    return;
  }
  if (pdfDocument) await refreshPdfBytesAndPreview();
  const url = currentPreviewUrl();
  if (!url) return;
  const win = window.open(`${url}#view=FitH`, '_blank', 'noopener');
  if (!win) showToast('Allow pop-ups to open the official PDF print preview.');
}

async function handlePrint() {
  await handlePrintPreview();
  showToast('Use the PDF viewer Print control to print the exact official form.');
}

async function handleEmailOpen() {
  if (!(await ensurePdfBytes('email'))) return;
  elements.emailSubject.value = `Completed tax form: ${state.name}`;
  elements.emailMessage.value = `Please review the attached completed tax form PDF: ${state.name}.\n\nDocument ID: ${state.id}\nLast updated: ${new Date(state.updatedAt).toLocaleString()}`;
  elements.emailDialog.showModal();
}

async function handlePrepareEmail(event) {
  event.preventDefault();
  if (!elements.emailForm.reportValidity()) return;
  if (pdfDocument) await refreshPdfBytesAndPreview();
  downloadBlob(new Blob([state.pdfBytes], { type: 'application/pdf' }), getSafeFileName('pdf'));
  const params = new URLSearchParams({
    subject: elements.emailSubject.value,
    body: `${elements.emailMessage.value}\n\nThe completed PDF has been downloaded. Attach it to this message before sending.`
  });
  window.location.href = `mailto:${encodeURIComponent(elements.emailTo.value)}?${params.toString()}`;
  elements.emailDialog.close();
  showToast('Email prepared. Attach the downloaded completed PDF.');
}

function applyZoom() {
  state.zoom = Math.min(2, Math.max(0.5, state.zoom));
  elements.zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
  const url = currentPdfObjectUrl || getTemplate().pdfUrl;
  if (url && !elements.pdfFrame.hidden) {
    elements.pdfFrame.src = `${url}#view=FitH&zoom=${Math.round(state.zoom * 100)}`;
  }
}

function setSignatureMode(mode) {
  signatureMode = mode;
  const draw = mode === 'draw';
  elements.drawSignaturePanel.hidden = !draw;
  elements.typeSignaturePanel.hidden = draw;
  elements.drawTab.classList.toggle('active', draw);
  elements.typeTab.classList.toggle('active', !draw);
  elements.drawTab.setAttribute('aria-selected', String(draw));
  elements.typeTab.setAttribute('aria-selected', String(!draw));
}

function clearSignatureCanvas() {
  const ctx = elements.signatureCanvas.getContext('2d');
  ctx.clearRect(0, 0, elements.signatureCanvas.width, elements.signatureCanvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, elements.signatureCanvas.width, elements.signatureCanvas.height);
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function canvasPoint(event) {
  const rect = elements.signatureCanvas.getBoundingClientRect();
  const point = event.touches ? event.touches[0] : event;
  return {
    x: (point.clientX - rect.left) * (elements.signatureCanvas.width / rect.width),
    y: (point.clientY - rect.top) * (elements.signatureCanvas.height / rect.height)
  };
}

function startDrawing(event) {
  drawing = true;
  lastPoint = canvasPoint(event);
  event.preventDefault();
}

function draw(event) {
  if (!drawing) return;
  const point = canvasPoint(event);
  const ctx = elements.signatureCanvas.getContext('2d');
  ctx.beginPath();
  ctx.moveTo(lastPoint.x, lastPoint.y);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();
  lastPoint = point;
  event.preventDefault();
}

function stopDrawing() {
  drawing = false;
  lastPoint = null;
}

function canvasHasInk() {
  const pixels = elements.signatureCanvas.getContext('2d').getImageData(0, 0, elements.signatureCanvas.width, elements.signatureCanvas.height).data;
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i] < 245 || pixels[i + 1] < 245 || pixels[i + 2] < 245) return true;
  }
  return false;
}

function dataUrlToUint8Array(dataUrl) {
  const base64 = dataUrl.split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function candidateSignatureFields() {
  return pdfFields
    .map((field, index) => ({ field, index, type: fieldType(field), name: field.getName(), label: getFieldLabel(field) }))
    .filter(item => item.type === 'PDFTextField' || item.type === 'PDFSignature')
    .sort((a, b) => {
      const aLikely = /sign|signature|authorized|taxpayer.*name/i.test(`${a.name} ${a.label}`) ? 0 : 1;
      const bLikely = /sign|signature|authorized|taxpayer.*name/i.test(`${b.name} ${b.label}`) ? 0 : 1;
      return aLikely - bLikely || a.label.localeCompare(b.label);
    });
}

function populateSignatureTargets() {
  const candidates = candidateSignatureFields();
  elements.signatureTarget.innerHTML = candidates.length
    ? candidates.map(item => `<option value="${item.index}">${escapeHtml(item.label)} — ${escapeHtml(item.name)}</option>`).join('')
    : '<option value="">No writable signature field found</option>';
  elements.applySignatureBtn.disabled = !candidates.length || !pdfDocument;
}

function openSignatureDialog() {
  if (!pdfDocument || !state.pdfBytes) {
    showToast('Load or upload an editable official PDF before applying an e-signature.');
    return;
  }
  populateSignatureTargets();
  clearSignatureCanvas();
  elements.signatureConsent.checked = false;
  elements.typedSignature.value = '';
  elements.typedSignaturePreview.textContent = 'Your Signature';
  setSignatureMode('draw');
  elements.signatureDialog.showModal();
}

function pageForWidget(widget) {
  const pageRef = widget.P?.();
  if (!pageRef) return pdfDocument.getPages()[0];
  return pdfDocument.getPages().find(page => page.ref === pageRef || String(page.ref) === String(pageRef)) || pdfDocument.getPages()[0];
}

async function applyDrawnSignatureToField(field, dataUrl) {
  const widgets = field.acroField?.getWidgets?.() || [];
  if (!widgets.length) throw new Error('The selected signature field has no visible PDF position.');
  const widget = widgets[0];
  const rect = widget.getRectangle();
  const page = pageForWidget(widget);
  const image = await pdfDocument.embedPng(dataUrlToUint8Array(dataUrl));
  const padding = Math.min(3, Math.max(1, rect.height * 0.08));
  const maxWidth = Math.max(1, rect.width - padding * 2);
  const maxHeight = Math.max(1, rect.height - padding * 2);
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  page.drawImage(image, {
    x: rect.x + padding,
    y: rect.y + (rect.height - height) / 2,
    width,
    height
  });
  if (fieldType(field) === 'PDFTextField') {
    try { field.setText(''); } catch {}
  }
}

async function handleApplySignature(event) {
  event.preventDefault();
  if (!elements.signatureConsent.checked) {
    showToast('Consent is required before applying an electronic signature.');
    return;
  }
  const fieldIndex = Number(elements.signatureTarget.value);
  const field = pdfFields[fieldIndex];
  if (!field) {
    showToast('Select a writable signature field on the official form.');
    return;
  }

  try {
    if (signatureMode === 'draw') {
      if (!canvasHasInk()) {
        showToast('Draw your signature before applying it.');
        return;
      }
      const dataUrl = elements.signatureCanvas.toDataURL('image/png');
      await applyDrawnSignatureToField(field, dataUrl);
      state.signature = dataUrl;
      state.signatureType = 'draw';
    } else {
      const typed = elements.typedSignature.value.trim();
      if (!typed) {
        showToast('Enter your full legal name before applying the signature.');
        return;
      }
      if (fieldType(field) !== 'PDFTextField') {
        showToast('Choose a text-based signature field for a typed signature.');
        return;
      }
      field.setText(typed);
      state.signature = typed;
      state.signatureType = 'type';
    }
    state.signatureTarget = field.getName();
    state.signedAt = new Date().toISOString();
    markDirty();
    await refreshPdfBytesAndPreview();
    renderPdfFieldEditor();
    elements.signatureDialog.close();
    showToast('Electronic signature applied to the official PDF. Save the form to preserve it.');
  } catch (error) {
    console.error(error);
    showToast(`The signature could not be placed: ${error.message}`);
  }
}

async function renderVault() {
  try {
    const documents = await getVaultDocuments();
    if (!documents.length) {
      elements.vaultList.innerHTML = '<div class="vault-empty">No completed PDFs have been saved to the vault yet.</div>';
      return;
    }
    elements.vaultList.innerHTML = documents.map(doc => {
      const legacy = !doc.pdfBlob;
      return `<article class="vault-item">
        <div>
          <div class="vault-name">${escapeHtml(doc.name || 'Untitled Tax Form')}</div>
          <p class="vault-meta">${escapeHtml(FORM_TEMPLATES[doc.type]?.shortTitle || doc.type || 'Government Form')} · Updated ${escapeHtml(new Date(doc.updatedAt).toLocaleString())}${legacy ? ' · Legacy data-only record' : ''}</p>
        </div>
        <div class="vault-actions">
          <button class="btn btn-secondary" data-vault-action="open" data-id="${escapeHtml(doc.id)}" ${legacy ? 'disabled' : ''}>Open</button>
          <button class="btn btn-secondary" data-vault-action="download" data-id="${escapeHtml(doc.id)}" ${legacy ? 'disabled' : ''}>Download PDF</button>
          <button class="btn btn-secondary" data-vault-action="delete" data-id="${escapeHtml(doc.id)}">Delete</button>
        </div>
      </article>`;
    }).join('');

    elements.vaultList.querySelectorAll('[data-vault-action]').forEach(button => {
      button.addEventListener('click', async () => {
        const doc = documents.find(item => item.id === button.dataset.id);
        if (!doc) return;
        if (button.dataset.vaultAction === 'open' && doc.pdfBlob) {
          state.id = doc.id;
          state.name = doc.name;
          state.type = FORM_TEMPLATES[doc.type] ? doc.type : 'governmentCustom';
          state.createdAt = doc.createdAt;
          state.updatedAt = doc.updatedAt;
          state.signature = doc.signature || null;
          state.signatureType = doc.signatureType || null;
          state.signatureTarget = doc.signatureTarget || null;
          state.signedAt = doc.signedAt || null;
          state.zoom = 1;
          elements.formType.value = state.type;
          renderMetadata();
          const bytes = new Uint8Array(await doc.pdfBlob.arrayBuffer());
          await loadPdfBytes(bytes, { sourceKind: 'vault', fileName: doc.sourceFileName || getSafeFileName('pdf') });
          state.dirty = false;
          setStatus('Opened from Document Vault');
          elements.vaultDialog.close();
          showToast('Completed PDF opened from the Document Vault.');
        }
        if (button.dataset.vaultAction === 'download' && doc.pdfBlob) {
          downloadBlob(doc.pdfBlob, `${String(doc.name || 'tax-form').replace(/[^a-z0-9-_]+/gi, '-')}.pdf`);
        }
        if (button.dataset.vaultAction === 'delete') {
          const confirmed = window.confirm(`Delete “${doc.name || 'this document'}” from the Document Vault?`);
          if (!confirmed) return;
          await deleteFromVault(doc.id);
          await renderVault();
          showToast('Document deleted from the vault.');
        }
      });
    });
  } catch (error) {
    console.error(error);
    elements.vaultList.innerHTML = '<div class="vault-empty">The Document Vault is unavailable in this browser session.</div>';
  }
}

function createNewForm(type, name) {
  resetPdfWorkspace();
  state.id = crypto.randomUUID();
  state.type = type;
  state.name = name || getTemplate(type).shortTitle || getTemplate(type).title || 'Untitled Tax Form';
  state.createdAt = new Date().toISOString();
  state.updatedAt = new Date().toISOString();
  state.editing = true;
  elements.formType.value = type;
  renderMetadata();
  elements.editBtn.textContent = 'Lock';
  elements.editBtn.setAttribute('aria-pressed', 'true');
  setStatus('New form');
  if (getTemplate(type).pdfUrl) fetchOfficialPdf();
  else {
    pendingFileAction = 'load';
    elements.pdfFileInput.click();
  }
}

function dashboardTaxValues() {
  const profile = dashboardContext?.profile || {};
  const tax = dashboardContext?.taxProfile || {};
  const legalName = String(tax.legalName || [profile.firstName, profile.lastName].filter(Boolean).join(' ')).trim();
  const address = String(tax.mailingAddress || '').trim();
  return {
    legalName,
    businessName: String(tax.businessName || '').trim(),
    address,
    city: String(tax.city || profile.city || '').trim(),
    region: String(tax.region || profile.region || '').trim(),
    postalCode: String(tax.postalCode || '').trim(),
    email: String(profile.email || '').trim(),
    phone: String(profile.phone || '').trim()
  };
}

function dashboardValueForPdfField(field) {
  const values = dashboardTaxValues();
  const text = `${getFieldLabel(field)} ${field.getName()}`.toLowerCase().replace(/[^a-z0-9]+/g, ' ');
  if (/requester|preparer|employer|payer|spouse|dependent|recipient/.test(text)) return '';
  if (/business name|disregarded entity/.test(text)) return values.businessName;
  if (/legal name|taxpayer name|name as shown|individual name|your name/.test(text)) return values.legalName;
  if (/street address|mailing address|address number|address line 1/.test(text)) return values.address;
  if (/city.*state.*zip|city state and zip|city or town/.test(text)) return [values.city, values.region, values.postalCode].filter(Boolean).join(', ');
  if (/\bcity\b/.test(text) && !/capacity/.test(text)) return values.city;
  if (/\bstate\b|province|region/.test(text)) return values.region;
  if (/zip|postal/.test(text)) return values.postalCode;
  if (/email/.test(text)) return values.email;
  if (/phone|telephone/.test(text)) return values.phone;
  return '';
}

async function applyDashboardProfile() {
  if (!dashboardContext) {
    showToast('Dashboard profile information is not available.');
    return;
  }
  if (!pdfFields.length) {
    showToast('Load an official fillable PDF before applying dashboard information.');
    return;
  }
  let changed = 0;
  pdfFields.forEach(field => {
    if (fieldType(field) !== 'PDFTextField' || field.isReadOnly?.()) return;
    const value = dashboardValueForPdfField(field);
    if (!value) return;
    try {
      if (!field.getText?.()) {
        field.setText(value);
        changed += 1;
      }
    } catch {}
  });
  if (!changed) {
    showToast('No empty matching fields were found in this PDF.');
    return;
  }
  markDirty();
  renderPdfFieldEditor();
  await refreshPdfBytesAndPreview();
  showToast(`${changed} matching PDF ${changed === 1 ? 'field' : 'fields'} filled from the dashboard.`);
}

function bindEvents() {
  elements.formType.addEventListener('change', () => {
    const nextType = elements.formType.value;
    const confirmed = !state.dirty || window.confirm('Changing the official form will discard unsaved PDF changes. Continue?');
    if (!confirmed) {
      elements.formType.value = state.type;
      return;
    }
    createNewForm(nextType, getTemplate(nextType).shortTitle || getTemplate(nextType).title);
  });

  elements.loadOfficialBtn.addEventListener('click', () => {
    if (getTemplate().pdfUrl) fetchOfficialPdf();
    else {
      pendingFileAction = 'load';
      elements.pdfFileInput.click();
    }
  });

  elements.uploadPdfBtn.addEventListener('click', () => {
    pendingFileAction = 'load';
    elements.pdfFileInput.click();
  });

  elements.dashboardProfileBtn.addEventListener('click', applyDashboardProfile);

  elements.pdfFileInput.addEventListener('change', () => handleUploadedPdf(elements.pdfFileInput.files?.[0]));

  elements.createBtn.addEventListener('click', () => {
    elements.newFormType.value = 'w9';
    elements.newFormName.value = FORM_TEMPLATES.w9.shortTitle;
    elements.createDialog.showModal();
    setTimeout(() => elements.newFormName.select(), 0);
  });

  elements.newFormType.addEventListener('change', () => {
    const template = getTemplate(elements.newFormType.value);
    elements.newFormName.value = template.shortTitle || template.title || 'Untitled Tax Form';
  });

  elements.confirmCreateBtn.addEventListener('click', event => {
    event.preventDefault();
    if (!elements.newFormName.reportValidity()) return;
    elements.createDialog.close();
    createNewForm(elements.newFormType.value, elements.newFormName.value.trim());
  });

  elements.editBtn.addEventListener('click', () => {
    state.editing = !state.editing;
    elements.editBtn.textContent = state.editing ? 'Lock' : 'Edit';
    elements.editBtn.setAttribute('aria-pressed', String(state.editing));
    renderPdfFieldEditor();
    showToast(state.editing ? 'Official PDF fields unlocked for editing.' : 'Official PDF fields locked.');
  });

  elements.fieldSearch.addEventListener('input', filterFieldCards);
  elements.saveBtn.addEventListener('click', handleSave);
  elements.printBtn.addEventListener('click', handlePrint);
  elements.printPreviewBtn.addEventListener('click', handlePrintPreview);
  elements.emailBtn.addEventListener('click', handleEmailOpen);
  elements.emailForm.addEventListener('submit', handlePrepareEmail);
  elements.signatureBtn.addEventListener('click', openSignatureDialog);

  elements.vaultBtn.addEventListener('click', async () => {
    await renderVault();
    elements.vaultDialog.showModal();
  });
  elements.closeVaultBtn.addEventListener('click', () => elements.vaultDialog.close());

  elements.zoomIn.addEventListener('click', () => {
    state.zoom += 0.1;
    applyZoom();
  });
  elements.zoomOut.addEventListener('click', () => {
    state.zoom -= 0.1;
    applyZoom();
  });

  elements.drawTab.addEventListener('click', () => setSignatureMode('draw'));
  elements.typeTab.addEventListener('click', () => setSignatureMode('type'));
  elements.clearSignatureBtn.addEventListener('click', clearSignatureCanvas);
  elements.typedSignature.addEventListener('input', () => {
    elements.typedSignaturePreview.textContent = elements.typedSignature.value || 'Your Signature';
  });
  elements.applySignatureBtn.addEventListener('click', handleApplySignature);

  ['mousedown', 'touchstart'].forEach(event => elements.signatureCanvas.addEventListener(event, startDrawing, { passive: false }));
  ['mousemove', 'touchmove'].forEach(event => elements.signatureCanvas.addEventListener(event, draw, { passive: false }));
  ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(event => elements.signatureCanvas.addEventListener(event, stopDrawing));

  window.addEventListener('beforeunload', event => {
    if (!state.dirty) return;
    event.preventDefault();
    event.returnValue = '';
  });
}

function initialize() {
  document.body.classList.toggle('is-embedded', new URLSearchParams(location.search).get('embed') === '1');
  window.addEventListener('message', event => {
    if (event.data?.type !== 'gunr-tax-dashboard-context') return;
    dashboardContext = event.data.payload || null;
    elements.dashboardProfileBtn.hidden = !dashboardContext;
    if (dashboardContext) elements.dashboardProfileBtn.textContent = 'Use Dashboard Profile';
    if (dashboardContext && !taxDocumentSyncStarted) {
      taxDocumentSyncStarted = true;
      syncAllTaxDocumentsToDashboard().catch(error => console.error('Initial tax document sync failed', error));
    }
  });
  if (window.parent !== window) window.parent.postMessage({ type: 'gunr-tax-generator-ready' }, '*');
  populateFormSelectors();
  renderMetadata();
  bindEvents();
  clearSignatureCanvas();
  elements.formType.value = state.type;
  elements.newFormType.value = state.type;
  if (!window.PDFLib?.PDFDocument) {
    elements.sourceNotice.textContent = 'The PDF editing library could not load. The exact official PDFs can still open in the embedded viewer, but in-generator field editing requires an internet connection to load the PDF library.';
  }
  fetchOfficialPdf();
}

initialize();
