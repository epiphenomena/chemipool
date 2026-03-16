import {
    calculateFC, calculatePH, calculateTA, calculateCH, calculateCYA, calculateSALT, calculateBOR,
    calculateCSI, calculateSuggestedFC, UNITS
} from './pool.js';

// --- State Management ---

const DEFAULT_STATE = {
    unit: 0,
    size: 10000,
    fc: { now: 4, goal: 4, pcnt: 6, jug: 0, pop: 0 },
    ph: { now: 7.5, goal: 7.5, mapop: 2 },
    ta: { now: 100, goal: 100 },
    ch: { now: 250, goal: 250, fill: 0 },
    cya: { now: 40, goal: 40 },
    salt: { now: 1000, goal: 1000 },
    borate: { now: 0, goal: 0, pop: 0 },
    temp: 84,
    logs: []
};

let state = JSON.parse(localStorage.getItem('poolState')) || DEFAULT_STATE;
state = { ...DEFAULT_STATE, ...state };
if (!state.logs) state.logs = [];

function saveState() {
    localStorage.setItem('poolState', JSON.stringify(state));
}

// --- DOM Elements ---

const elements = {
    btnMeasurements: document.getElementById('btn-measurements'),
    btnLogs: document.getElementById('btn-logs'),
    btnSettings: document.getElementById('btn-settings'),
    viewMeasurements: document.getElementById('view-measurements'),
    viewLogs: document.getElementById('view-logs'),
    viewSettings: document.getElementById('view-settings'),

    // Measurements
    fcNow: document.getElementById('fc-now'),
    phNow: document.getElementById('ph-now'),
    taNow: document.getElementById('ta-now'),
    chNow: document.getElementById('ch-now'),
    cyaNow: document.getElementById('cya-now'),
    saltNow: document.getElementById('salt-now'),
    borateNow: document.getElementById('borate-now'),
    tempNow: document.getElementById('temp-now'),

    // Settings
    setUnits: document.getElementById('set-units'),
    setSize: document.getElementById('set-size'),
    goalFc: document.getElementById('goal-fc'),
    goalPh: document.getElementById('goal-ph'),
    goalTa: document.getElementById('goal-ta'),
    goalCh: document.getElementById('goal-ch'),
    goalCya: document.getElementById('goal-cya'),
    goalSalt: document.getElementById('goal-salt'),
    goalBorate: document.getElementById('goal-borate'),
    setFcPcnt: document.getElementById('set-fc-pcnt'),
    setFcJug: document.getElementById('set-fc-jug'),
    setFcPop: document.getElementById('set-fc-pop'),
    setMaPop: document.getElementById('set-ma-pop'),

    // Displays
    fcGoalDisplay: document.getElementById('fc-goal-display'),
    phGoalDisplay: document.getElementById('ph-goal-display'),
    taGoalDisplay: document.getElementById('ta-goal-display'),
    chGoalDisplay: document.getElementById('ch-goal-display'),
    cyaGoalDisplay: document.getElementById('cya-goal-display'),
    saltGoalDisplay: document.getElementById('salt-goal-display'),
    borateGoalDisplay: document.getElementById('borate-goal-display'),
    fcSourceDisplay: document.getElementById('fc-source-display'),
    unitLabel: document.querySelector('.unit-label'),

    // Results
    fcRes1: document.getElementById('fc-result-1'),
    fcRes2: document.getElementById('fc-result-2'),
    phResUp: document.getElementById('ph-result-up'),
    phResDown: document.getElementById('ph-result-down'),
    phUpAmount: document.getElementById('ph-up-amount'),
    phDownAmount: document.getElementById('ph-down-amount'),
    taRes: document.getElementById('ta-result'),
    chAddRes: document.getElementById('ch-add-result'),
    chReplaceRes: document.getElementById('ch-replace-result'),
    chRes: document.getElementById('ch-result'),
    chReplacePcnt: document.getElementById('ch-replace-pcnt'),
    cyaAddRes: document.getElementById('cya-add-result'),
    cyaReplaceRes: document.getElementById('cya-replace-result'),
    cyaRes: document.getElementById('cya-result'),
    cyaReplacePcnt: document.getElementById('cya-replace-pcnt'),
    saltAddRes: document.getElementById('salt-add-result'),
    saltReplaceRes: document.getElementById('salt-replace-result'),
    saltRes: document.getElementById('salt-result'),
    saltReplacePcnt: document.getElementById('salt-replace-pcnt'),
    borateAddRes: document.getElementById('borate-add-result'),
    borateReplaceRes: document.getElementById('borate-replace-result'),
    borateRes: document.getElementById('borate-result'),
    borateReplacePcnt: document.getElementById('borate-replace-pcnt'),
    csiNow: document.getElementById('csi-now'),
    csiTarget: document.getElementById('csi-target'),

    // Suggestions
    sugSwgMin: document.getElementById('sug-swg-min'),
    sugSwgTgt: document.getElementById('sug-swg-tgt'),
    sugNorMin: document.getElementById('sug-nor-min'),
    sugNorTgt: document.getElementById('sug-nor-tgt'),
    sugShock: document.getElementById('sug-shock'),
    sugMustard: document.getElementById('sug-mustard'),

    // Logs View
    logForm: document.getElementById('log-form'),
    logDate: document.getElementById('log-date'),
    logFc: document.getElementById('log-fc'),
    logPh: document.getElementById('log-ph'),
    logTa: document.getElementById('log-ta'),
    logCh: document.getElementById('log-ch'),
    logCya: document.getElementById('log-cya'),
    logSalt: document.getElementById('log-salt'),
    logBorate: document.getElementById('log-borate'),
    logTemp: document.getElementById('log-temp'),
    logNotes: document.getElementById('log-notes'),
    logBody: document.getElementById('log-body'),
    btnDownloadCsv: document.getElementById('btn-download-csv'),
    btnUploadCsv: document.getElementById('btn-upload-csv'),
    csvFileInput: document.getElementById('csv-file-input'),
    toast: document.getElementById('toast')
};

// --- Utilities ---

function showToast(msg) {
    elements.toast.textContent = msg;
    elements.toast.classList.remove('hidden');
    setTimeout(() => {
        elements.toast.classList.add('hidden');
    }, 3000);
}

// --- Initialization ---

function init() {
    // Fill inputs with state
    elements.setUnits.value = state.unit;
    elements.setSize.value = state.size;
    elements.fcNow.value = state.fc.now;
    elements.goalFc.value = state.fc.goal;
    elements.setFcPcnt.value = state.fc.pcnt;
    elements.setFcJug.value = state.fc.jug;
    elements.setFcPop.value = state.fc.pop;
    elements.phNow.value = state.ph.now;
    elements.goalPh.value = state.ph.goal;
    elements.setMaPop.value = state.ph.mapop;
    elements.taNow.value = state.ta.now;
    elements.goalTa.value = state.ta.goal;
    elements.chNow.value = state.ch.now;
    elements.goalCh.value = state.ch.goal;
    elements.cyaNow.value = state.cya.now;
    elements.goalCya.value = state.cya.goal;
    elements.saltNow.value = state.salt.now;
    elements.goalSalt.value = state.salt.goal;
    elements.borateNow.value = state.borate.now;
    elements.goalBorate.value = state.borate.goal;
    elements.tempNow.value = state.temp;

    elements.logDate.valueAsDate = new Date();

    updateUI();
    renderLogs();
    attachListeners();
}

// --- Logic ---

function updateUI() {
    elements.fcGoalDisplay.textContent = state.fc.goal;
    elements.phGoalDisplay.textContent = state.ph.goal;
    elements.taGoalDisplay.textContent = state.ta.goal;
    elements.chGoalDisplay.textContent = state.ch.goal;
    elements.cyaGoalDisplay.textContent = state.cya.goal;
    elements.saltGoalDisplay.textContent = state.salt.goal;
    elements.borateGoalDisplay.textContent = state.borate.goal;
    elements.fcSourceDisplay.textContent = elements.setFcPop.options[state.fc.pop].text;
    elements.unitLabel.textContent = state.unit == 1 ? "liters" : "gallons";

    const tempWarning = document.getElementById('temp-warning');
    if (state.temp < 52) tempWarning.classList.remove('hidden');
    else tempWarning.classList.add('hidden');

    const fc = calculateFC(state.size, state.unit, state.fc.now, state.fc.goal, state.fc.pcnt, state.fc.pop);
    elements.fcRes1.textContent = fc.fc1oz;
    elements.fcRes2.textContent = fc.fc2oz;

    const ph = calculatePH(state.size, state.unit, state.ph.now, state.ph.goal, state.ph.mapop, state.ta.now, state.borate.now);
    if (state.ph.now < state.ph.goal) {
        elements.phResUp.classList.remove('hidden');
        elements.phResDown.classList.add('hidden');
        elements.phUpAmount.textContent = ph.phu1oz + " washing soda / " + ph.phu2oz + " borax";
    } else if (state.ph.now > state.ph.goal) {
        elements.phResUp.classList.add('hidden');
        elements.phResDown.classList.remove('hidden');
        elements.phDownAmount.textContent = ph.phd1oz + " muriatic acid / " + ph.phd2oz + " dry acid";
    } else {
        elements.phResUp.classList.add('hidden');
        elements.phResDown.classList.add('hidden');
    }

    const ta = calculateTA(state.size, state.unit, state.ta.now, state.ta.goal);
    elements.taRes.textContent = ta.taoz;

    const ch = calculateCH(state.size, state.unit, state.ch.now, state.ch.goal, state.ch.fill);
    if (state.ch.now <= state.ch.goal) {
        elements.chAddRes.classList.remove('hidden');
        elements.chReplaceRes.classList.add('hidden');
        elements.chRes.textContent = ch.ch1oz;
    } else {
        elements.chAddRes.classList.add('hidden');
        elements.chReplaceRes.classList.remove('hidden');
        elements.chReplacePcnt.textContent = ch.chpcnt;
    }

    const cya = calculateCYA(state.size, state.unit, state.cya.now, state.cya.goal);
    if (state.cya.now <= state.cya.goal) {
        elements.cyaAddRes.classList.remove('hidden');
        elements.cyaReplaceRes.classList.add('hidden');
        elements.cyaRes.textContent = cya.cya1oz;
    } else {
        elements.cyaAddRes.classList.add('hidden');
        elements.cyaReplaceRes.classList.remove('hidden');
        elements.cyaReplacePcnt.textContent = cya.cyapcnt;
    }

    const salt = calculateSALT(state.size, state.unit, state.salt.now, state.salt.goal);
    if (state.salt.now <= state.salt.goal) {
        elements.saltAddRes.classList.remove('hidden');
        elements.saltReplaceRes.classList.add('hidden');
        elements.saltRes.textContent = salt.saltlb;
    } else {
        elements.saltAddRes.classList.add('hidden');
        elements.saltReplaceRes.classList.remove('hidden');
        elements.saltReplacePcnt.textContent = salt.saltpcnt;
    }

    const bor = calculateBOR(state.size, state.unit, state.borate.now, state.borate.goal, state.borate.pop);
    if (state.borate.now <= state.borate.goal) {
        elements.borateAddRes.classList.remove('hidden');
        elements.borateReplaceRes.classList.add('hidden');
        elements.borateRes.textContent = bor.boroz;
    } else {
        elements.borateAddRes.classList.add('hidden');
        elements.borateReplaceRes.classList.remove('hidden');
        elements.borateReplacePcnt.textContent = bor.borpcnt;
    }

    elements.csiNow.textContent = calculateCSI(state.ph.now, state.ta.now, state.ch.now, state.cya.now, state.salt.now, state.borate.now, state.temp, state.unit);
    elements.csiTarget.textContent = calculateCSI(state.ph.goal, state.ta.goal, state.ch.goal, state.cya.goal, state.salt.goal, state.borate.goal, state.temp, state.unit);

    const sug = calculateSuggestedFC(state.cya.now);
    elements.sugSwgMin.textContent = sug.swgMin;
    elements.sugSwgTgt.textContent = sug.swgTgt;
    elements.sugNorMin.textContent = sug.norMin;
    elements.sugNorTgt.textContent = sug.norTgt1 + "-" + sug.norTgt2;
    elements.sugShock.textContent = sug.shock;
    elements.sugMustard.textContent = sug.mustard;
}

function renderLogs() {
    const container = document.getElementById('log-list');
    container.innerHTML = '';
    [...state.logs].sort((a,b) => b.date.localeCompare(a.date)).forEach((log, index) => {
        const item = document.createElement('div');
        item.className = 'log-item';
        const maintStr = log.maintenance.join(', ');

        item.innerHTML = `
            <div class="log-item-header">
                <span class="log-item-date">${log.date}</span>
                <button class="btn-delete" data-date="${log.date}" data-index="${index}">Delete</button>
            </div>
            <div class="log-item-stats">
                <div><span>FC:</span> <b>${log.measurements.fc ?? '-'}</b></div>
                <div><span>pH:</span> <b>${log.measurements.ph ?? '-'}</b></div>
                <div><span>TA:</span> <b>${log.measurements.ta ?? '-'}</b></div>
                <div><span>CH:</span> <b>${log.measurements.ch ?? '-'}</b></div>
                <div><span>CYA:</span> <b>${log.measurements.cya ?? '-'}</b></div>
                <div><span>Salt:</span> <b>${log.measurements.salt ?? '-'}</b></div>
                <div><span>Temp:</span> <b>${log.measurements.temp ?? '-'}</b></div>
            </div>
            ${maintStr ? `<div class="log-item-maint">Maintenance: ${maintStr}</div>` : ''}
            ${log.notes ? `<div class="log-item-notes">${log.notes}</div>` : ''}
        `;
        container.appendChild(item);
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const date = btn.dataset.date;
            const originalIndex = state.logs.findIndex(l => l.date === date);
            if (originalIndex !== -1) {
                state.logs.splice(originalIndex, 1);
                saveState();
                renderLogs();
            }
        });
    });
}

function downloadCSV() {
    if (state.logs.length === 0) return;
    const headers = ["Date", "FC", "pH", "TA", "CH", "CYA", "Salt", "Borate", "Temp", "Maintenance", "Notes"];
    const rows = state.logs.map(log => [
        log.date,
        log.measurements.fc,
        log.measurements.ph,
        log.measurements.ta,
        log.measurements.ch,
        log.measurements.cya,
        log.measurements.salt,
        log.measurements.borate,
        log.measurements.temp,
        log.maintenance.join(';'),
        (log.notes || "").replace(/,/g, ' ')
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pool_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function uploadCSV(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        const newLogs = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const values = lines[i].split(',');
            const entry = {
                date: values[0],
                measurements: {
                    fc: parseFloat(values[1]),
                    ph: parseFloat(values[2]),
                    ta: parseFloat(values[3]),
                    ch: parseFloat(values[4]),
                    cya: parseFloat(values[5]),
                    salt: parseFloat(values[6]),
                    borate: parseFloat(values[7]),
                    temp: parseFloat(values[8])
                },
                maintenance: values[9] ? values[9].split(';') : [],
                notes: values[10] || ""
            };
            newLogs.push(entry);
        }

        state.logs = [...state.logs, ...newLogs];
        saveState();
        renderLogs();
        showToast(`Imported ${newLogs.length} logs!`);
    };
    reader.readAsText(file);
}

function attachListeners() {
    const views = { 'btn-measurements': elements.viewMeasurements, 'btn-logs': elements.viewLogs, 'btn-settings': elements.viewSettings };
    const btns = [elements.btnMeasurements, elements.btnLogs, elements.btnSettings];

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            Object.values(views).forEach(v => v.classList.add('hidden'));
            btn.classList.add('active');
            views[btn.id].classList.remove('hidden');
            if (btn.id === 'btn-logs') {
                elements.logFc.value = state.fc.now;
                elements.logPh.value = state.ph.now;
                elements.logTa.value = state.ta.now;
                elements.logCh.value = state.ch.now;
                elements.logCya.value = state.cya.now;
                elements.logSalt.value = state.salt.now;
                elements.logBorate.value = state.borate.now;
                elements.logTemp.value = state.temp;
            }
        });
    });

    const syncInput = (el, path) => {
        el.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (isNaN(val)) return;
            let current = state;
            const parts = path.split('.');
            for (let i = 0; i < parts.length - 1; i++) current = current[parts[i]];
            current[parts[parts.length - 1]] = val;
            updateUI();
            saveState();
        });
    };

    [
        [elements.fcNow, 'fc.now'], [elements.phNow, 'ph.now'], [elements.taNow, 'ta.now'], [elements.chNow, 'ch.now'],
        [elements.cyaNow, 'cya.now'], [elements.saltNow, 'salt.now'], [elements.borateNow, 'borate.now'], [elements.tempNow, 'temp'],
        [elements.setUnits, 'unit'], [elements.setSize, 'size'], [elements.goalFc, 'fc.goal'], [elements.goalPh, 'ph.goal'],
        [elements.goalTa, 'ta.goal'], [elements.goalCh, 'ch.goal'], [elements.goalCya, 'cya.goal'], [elements.goalSalt, 'salt.goal'],
        [elements.goalBorate, 'borate.goal'], [elements.setFcPcnt, 'fc.pcnt'], [elements.setFcJug, 'fc.jug'], [elements.setFcPop, 'fc.pop'], [elements.setMaPop, 'ph.mapop']
    ].forEach(p => syncInput(p[0], p[1]));

    document.querySelectorAll('.step-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const inputId = btn.dataset.input;
            const step = parseFloat(btn.dataset.step);
            const input = document.getElementById(inputId);
            let val = parseFloat(input.value) + step;
            if (inputId.includes('ph')) val = Math.max(6, Math.min(9, val));
            else if (inputId.includes('fc')) val = Math.max(0, Math.min(50, val));
            else if (inputId.includes('ta')) val = Math.max(0, Math.min(500, val));
            else if (inputId.includes('ch')) val = Math.max(0, Math.min(2000, val));
            else if (inputId.includes('cya')) val = Math.max(0, Math.min(500, val));
            else if (inputId.includes('salt')) val = Math.max(0, Math.min(10000, val));
            else if (inputId.includes('borate')) val = Math.max(0, Math.min(200, val));
            else if (inputId.includes('size')) val = Math.max(0, val);
            input.value = parseFloat(val.toFixed(2));
            input.dispatchEvent(new Event('input'));
        });
    });

    elements.logForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const measurements = {
            fc: parseFloat(elements.logFc.value), ph: parseFloat(elements.logPh.value),
            ta: parseFloat(elements.logTa.value), ch: parseFloat(elements.logCh.value),
            cya: parseFloat(elements.logCya.value), salt: parseFloat(elements.logSalt.value),
            borate: parseFloat(elements.logBorate.value), temp: parseFloat(elements.logTemp.value)
        };
        const maintenance = [];
        document.querySelectorAll('input[name="maint"]:checked').forEach(cb => maintenance.push(cb.parentElement.textContent.trim()));
        state.logs.push({ date: elements.logDate.value, measurements, maintenance, notes: elements.logNotes.value });
        state.fc.now = measurements.fc; state.ph.now = measurements.ph; state.ta.now = measurements.ta;
        state.ch.now = measurements.ch; state.cya.now = measurements.cya; state.salt.now = measurements.salt;
        state.borate.now = measurements.borate; state.temp = measurements.temp;
        elements.fcNow.value = state.fc.now; elements.phNow.value = state.ph.now; elements.taNow.value = state.ta.now;
        elements.chNow.value = state.ch.now; elements.cyaNow.value = state.cya.now; elements.saltNow.value = state.salt.now;
        elements.borateNow.value = state.borate.now; elements.tempNow.value = state.temp;
        saveState(); updateUI(); renderLogs();
        document.querySelectorAll('input[name="maint"]').forEach(cb => cb.checked = false);
        elements.logNotes.value = '';
        showToast('Log saved!');
    });

    elements.btnDownloadCsv.addEventListener('click', downloadCSV);
    elements.btnUploadCsv.addEventListener('click', () => elements.csvFileInput.click());
    elements.csvFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) uploadCSV(e.target.files[0]);
    });
}

document.addEventListener('DOMContentLoaded', init);
