import {
    calculateFC, calculatePH, calculateTA, calculateCH, calculateCYA, calculateSALT, calculateBOR,
    calculateCSI, calculateSuggestedFC, UNITS
} from './pool.js';

// --- State Management ---

const DEFAULT_MAINTENANCE_TASKS = [
    "Skimmers", "Cleaner Bag", "Pump Basket", "Brushing", 
    "Vacuuming", "Filter Clean", "SWG (Vinegar)", "SWG (HCL)"
];

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
    logs: [],
    maintenanceTasks: DEFAULT_MAINTENANCE_TASKS
};

let state = JSON.parse(localStorage.getItem('poolState')) || DEFAULT_STATE;
state = { ...DEFAULT_STATE, ...state };
if (!state.logs) state.logs = [];
if (!state.maintenanceTasks) state.maintenanceTasks = [...DEFAULT_MAINTENANCE_TASKS];

function saveState() {
    localStorage.setItem('poolState', JSON.stringify(state));
    if (elements.jsonSettings) updateJsonSettings();
}

// --- DOM Elements ---

const elements = {
    btnMeasurements: document.getElementById('btn-measurements'),
    btnLogs: document.getElementById('btn-logs'),
    btnSettings: document.getElementById('btn-settings'),
    viewMeasurements: document.getElementById('view-measurements'),
    viewLogs: document.getElementById('view-logs'),
    viewSettings: document.getElementById('view-settings'),
    daysSinceLog: document.getElementById('days-since-log-container'),

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
    setFcPop: document.getElementById('set-fc-pop'),
    setMaPop: document.getElementById('set-ma-pop'),
    newTaskInput: document.getElementById('new-task-input'),
    btnAddTask: document.getElementById('btn-add-task'),
    maintTaskList: document.getElementById('maint-task-list'),

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
    toggleSuggestions: document.getElementById('toggle-suggestions'),
    suggestionsPanel: document.getElementById('suggestions-panel'),

    // Logs View
    logForm: document.getElementById('log-form'),
    logDate: document.getElementById('log-date'),
    logNotes: document.getElementById('log-notes'),
    maintCheckboxGrid: document.getElementById('maint-checkbox-grid'),
    btnSaveLog: document.getElementById('btn-save-log'),
    btnDownloadCsv: document.getElementById('btn-download-csv'),
    btnUploadCsv: document.getElementById('btn-upload-csv'),
    csvFileInput: document.getElementById('csv-file-input'),
    jsonSettings: document.getElementById('json-settings'),
    btnDownloadJson: document.getElementById('btn-download-json'),
    btnUploadJson: document.getElementById('btn-upload-json'),
    jsonFileInput: document.getElementById('json-file-input'),
    toast: document.getElementById('toast')
};

// --- Utilities ---

function showToast(msg, btnToDisable = null) {
    elements.toast.textContent = msg;
    elements.toast.classList.remove('hidden');
    if (btnToDisable) btnToDisable.disabled = true;
    
    setTimeout(() => {
        elements.toast.classList.add('hidden');
        if (btnToDisable) btnToDisable.disabled = false;
    }, 3000);
}

function updateJsonSettings() {
    elements.jsonSettings.value = JSON.stringify(state, null, 2);
}

// --- Initialization ---

function init() {
    // Fill inputs with state
    elements.setUnits.value = state.unit;
    elements.setSize.value = state.size;
    elements.fcNow.value = state.fc.now;
    elements.goalFc.value = state.fc.goal;
    elements.setFcPcnt.value = state.fc.pcnt;
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

    renderMaintenanceCheckboxes();
    renderMaintenanceTasksManager();
    updateUI();
    renderLogs();
    updateJsonSettings();
    attachListeners();
}

// --- Logic ---

function renderMaintenanceCheckboxes() {
    elements.maintCheckboxGrid.innerHTML = '';
    state.maintenanceTasks.forEach(task => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'maint';
        checkbox.value = task.toLowerCase().replace(/\s+/g, '_');
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(' ' + task));
        elements.maintCheckboxGrid.appendChild(label);
    });
}

function renderMaintenanceTasksManager() {
    elements.maintTaskList.innerHTML = '';
    state.maintenanceTasks.forEach((task, index) => {
        const item = document.createElement('div');
        item.className = 'task-manager-item';
        item.innerHTML = `
            <span>${task}</span>
            <div class="task-manager-btns">
                <button class="task-btn move-up" data-index="${index}" ${index === 0 ? 'disabled' : ''}>↑</button>
                <button class="task-btn move-down" data-index="${index}" ${index === state.maintenanceTasks.length - 1 ? 'disabled' : ''}>↓</button>
                <button class="task-btn delete-task" data-index="${index}">×</button>
            </div>
        `;
        elements.maintTaskList.appendChild(item);
    });

    // Attach manager listeners
    elements.maintTaskList.querySelectorAll('.delete-task').forEach(btn => {
        btn.addEventListener('click', () => {
            state.maintenanceTasks.splice(parseInt(btn.dataset.index), 1);
            saveState();
            renderMaintenanceTasksManager();
            renderMaintenanceCheckboxes();
        });
    });

    elements.maintTaskList.querySelectorAll('.move-up').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            [state.maintenanceTasks[idx], state.maintenanceTasks[idx - 1]] = [state.maintenanceTasks[idx - 1], state.maintenanceTasks[idx]];
            saveState();
            renderMaintenanceTasksManager();
            renderMaintenanceCheckboxes();
        });
    });

    elements.maintTaskList.querySelectorAll('.move-down').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            [state.maintenanceTasks[idx], state.maintenanceTasks[idx + 1]] = [state.maintenanceTasks[idx + 1], state.maintenanceTasks[idx]];
            saveState();
            renderMaintenanceTasksManager();
            renderMaintenanceCheckboxes();
        });
    });
}

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

    updateDaysSinceLog();
}

function updateDaysSinceLog() {
    if (state.logs.length === 0) {
        elements.daysSinceLog.innerHTML = "No logs recorded yet.";
        return;
    }

    const lastLog = [...state.logs].sort((a,b) => b.date.localeCompare(a.date))[0];
    const lastDate = new Date(lastLog.date);
    const today = new Date();
    today.setHours(0,0,0,0);
    lastDate.setHours(0,0,0,0);
    
    const diffTime = today - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        elements.daysSinceLog.innerHTML = "Last log recorded <b>today</b>.";
        elements.daysSinceLog.classList.remove('warning');
    } else {
        elements.daysSinceLog.innerHTML = `Last log recorded <b>${diffDays}</b> day${diffDays > 1 ? 's' : ''} ago.`;
        if (diffDays >= 3) elements.daysSinceLog.classList.add('warning');
        else elements.daysSinceLog.classList.remove('warning');
    }
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
                updateDaysSinceLog();
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
        updateDaysSinceLog();
        showToast(`Imported ${newLogs.length} logs!`);
    };
    reader.readAsText(file);
}

function downloadJSON() {
    const jsonContent = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pool_state_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function uploadJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const newState = JSON.parse(e.target.result);
            state = { ...DEFAULT_STATE, ...newState };
            saveState();
            window.location.reload();
        } catch (err) {
            showToast("Error parsing JSON file");
        }
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
        [elements.goalBorate, 'borate.goal'], [elements.setFcPcnt, 'fc.pcnt'], [elements.setFcPop, 'fc.pop'], [elements.setMaPop, 'ph.mapop']
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

    elements.toggleSuggestions.addEventListener('click', () => {
        elements.suggestionsPanel.classList.toggle('hidden');
    });

    elements.btnAddTask.addEventListener('click', () => {
        const taskName = elements.newTaskInput.value.trim();
        if (taskName) {
            state.maintenanceTasks.push(taskName);
            saveState();
            renderMaintenanceTasksManager();
            renderMaintenanceCheckboxes();
            elements.newTaskInput.value = '';
        }
    });

    elements.logForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const measurements = {
            fc: state.fc.now, ph: state.ph.now, ta: state.ta.now,
            ch: state.ch.now, cya: state.cya.now, salt: state.salt.now,
            borate: state.borate.now, temp: state.temp
        };
        const maintenance = [];
        document.querySelectorAll('input[name="maint"]:checked').forEach(cb => maintenance.push(cb.parentElement.textContent.trim()));
        state.logs.push({ date: elements.logDate.value, measurements, maintenance, notes: elements.logNotes.value });
        saveState();
        renderLogs();
        updateDaysSinceLog();
        document.querySelectorAll('input[name="maint"]').forEach(cb => cb.checked = false);
        elements.logNotes.value = '';
        showToast('Log saved!', elements.btnSaveLog);
    });

    elements.btnDownloadCsv.addEventListener('click', downloadCSV);
    elements.btnUploadCsv.addEventListener('click', () => elements.csvFileInput.click());
    elements.csvFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) uploadCSV(e.target.files[0]);
    });

    elements.btnDownloadJson.addEventListener('click', downloadJSON);
    elements.btnUploadJson.addEventListener('click', () => elements.jsonFileInput.click());
    elements.jsonFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) uploadJSON(e.target.files[0]);
    });

    elements.jsonSettings.addEventListener('change', () => {
        try {
            const newState = JSON.parse(elements.jsonSettings.value);
            state = { ...DEFAULT_STATE, ...newState };
            saveState();
            window.location.reload();
        } catch (err) {
            showToast("Invalid JSON in textarea");
            updateJsonSettings();
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
