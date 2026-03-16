// pool_refactored.js

export const UNITS = {
    US: 0,
    METRIC: 1,
    IMPERIAL: 2
};

export function getGallons(size, unit) {
    if (unit == UNITS.METRIC)
        return (parseInt(size) / 3.78541);
    if (unit == UNITS.IMPERIAL)
        return (parseInt(size) * 1.20095);
    return (parseInt(size));
}

export function formatWeight(oz, unit) {
    if (unit == UNITS.METRIC)
        return (Math.floor(oz * 28.3495 + 0.5) + " g");
    if (oz < 10) return (Math.floor(oz + 0.05) + "." + Math.floor(oz * 10 + 0.5) % 10 + " oz");
    return (Math.floor(oz + 0.5) + " oz");
}

export function formatLbs(oz, unit) {
    if (unit == UNITS.METRIC)
        return (Math.floor(oz * 0.0283495 + 0.5) + " kg");
    return (Math.floor(oz / 16 + 0.5) + " lbs");
}

export function formatVolume(oz, unit) {
    if (unit == UNITS.METRIC)
        return (Math.floor(oz * 29.5735 + 0.5) + " ml");
    let adjustedOz = oz;
    if (unit == UNITS.IMPERIAL) adjustedOz *= 1.04084;
    if (adjustedOz < 10) return (Math.floor(adjustedOz + 0.05) + "." + Math.floor(adjustedOz * 10 + 0.5) % 10 + " oz");
    return (Math.floor(adjustedOz + 0.5) + " oz");
}

export function formatGallons(gal, unit) {
    if (unit == UNITS.METRIC)
        return (Math.floor(gal / 7.48052 * 10 + 0.5) * 100 + " liters");
    let adjustedGal = gal;
    if (unit == UNITS.IMPERIAL) adjustedGal *= 0.832674;
    if (adjustedGal < 1000) return (Math.floor(adjustedGal / 10 + 0.5) * 10 + " gallons");
    return (Math.floor(adjustedGal / 100 + 0.5) * 100 + " gallons");
}

const FC_OZ_MUL = [6854.95, 4149.03, 3565.44, 3936.84, 4828.12, 5422.41, 2637.5, 7489.4];
const FC_VOL_RATIO = [null, 0.9351, 0.9352, 0.9352, 0.9352, 0.9352, 0.978, null];

export function calculateFC(size, unit, from, to, pcnt, fcpop) {
    const gallons = getGallons(size, unit);
    const results = {
        fcTrade: (pcnt > 9 ? "trade" : "weight"),
        fc1oz: "0",
        fc2oz: "0",
        fc2vol: "0"
    };

    if (from < to) {
        const bleachTemp = (to - from) * gallons / ((75.71 * pcnt + 0.746 * pcnt * pcnt) *
                        (pcnt > 9 ? (1.02 - 0.008 * pcnt) : 1));
        results.fc1oz = formatVolume(bleachTemp, unit);
        const othersTemp = (to - from) * gallons / FC_OZ_MUL[fcpop];
        results.fc2oz = formatWeight(othersTemp, unit);
        const volRatio = FC_VOL_RATIO[fcpop];
        if (volRatio === null) results.fc2vol = "unknown";
        else results.fc2vol = formatVolume(othersTemp * volRatio, unit);
    }
    return results;
}

const MA_MUL = [2.0, 1.11111, 1.0, .909091, 2.16897, 1.08448];

export function calculatePH(size, unit, from, to, mapop, tafrom, borfrom) {
    const gallons = getGallons(size, unit);
    const results = {
        phu1oz: "0", phu1vol: "0", phu2oz: "0", phu2vol: "0",
        phd1oz: "0", phd2oz: "0", phd2vol: "0"
    };

    const avgPH = (from + to) / 2;
    const adj = (192.1626 + -60.1221 * avgPH + 6.0752 * avgPH * avgPH + -0.1943 * avgPH * avgPH * avgPH) *
                (tafrom + 13.91) / 114.6;
    const ex = (-5.476259 + 2.414292 * avgPH + -0.355882 * avgPH * avgPH + 0.01755 * avgPH * avgPH * avgPH) * borfrom * (to - from) * gallons;
    const dg = (to - from) * gallons * adj;

    if (from < to) {
        const temp1 = (dg / 218.68) + (ex / 218.68);
        results.phu1oz = formatWeight(temp1, unit);
        results.phu1vol = formatVolume(temp1 * 0.8715, unit);
        const temp2 = (dg / 110.05) + (ex / 110.05);
        results.phu2oz = formatWeight(temp2, unit);
        results.phu2vol = formatVolume(temp2 * 0.9586, unit);
    }
    if (from > to) {
        const temp1 = (dg / -240.15 * MA_MUL[mapop]) + (ex / -240.15 * MA_MUL[mapop]);
        results.phd1oz = formatVolume(temp1, unit);
        const temp2 = (dg / -178.66) + (ex / -178.66);
        results.phd2oz = formatWeight(temp2, unit);
        results.phd2vol = formatVolume(temp2 * 0.6657, unit);
    }
    return results;
}

export function calculateTA(size, unit, from, to) {
    const results = { taoz: "0", tavol: "0" };
    if (from < to) {
        const temp = (to - from) * getGallons(size, unit) / 4259.15;
        results.taoz = formatWeight(temp, unit);
        results.tavol = formatVolume(temp * 0.7988, unit);
    }
    return results;
}

export function calculateCH(size, unit, from, to, chfill) {
    const gallons = getGallons(size, unit);
    const results = { ch1oz: "0", ch1vol: "0", ch2oz: "0", ch2vol: "0", chpcnt: "some" };
    if (from < to) {
        let temp = (to - from) * gallons / 6754.11;
        results.ch1oz = formatWeight(temp, unit);
        results.ch1vol = formatVolume(temp * 0.7988, unit);
        temp = (to - from) * gallons / 5098.82;
        results.ch2oz = formatWeight(temp, unit);
        results.ch2vol = formatVolume(temp * 1.148, unit);
    } else if (from > to) {
        if (to < chfill) results.chpcnt = "can't";
        else results.chpcnt = Math.floor(100 - ((to - chfill) / (from - chfill)) * 100 + 0.5) + "%";
    }
    return results;
}

export function calculateCYA(size, unit, from, to) {
    const gallons = getGallons(size, unit);
    const results = { cya1oz: "0", cya1vol: "0", cya2oz: "0", cyapcnt: "some" };
    if (from < to) {
        let temp = (to - from) * gallons / 7489.51;
        results.cya1oz = formatWeight(temp, unit);
        results.cya1vol = formatVolume(temp * 1.042, unit);
        temp = (to - from) * gallons / 2890;
        results.cya2oz = formatVolume(temp, unit);
    } else if (from > to) {
        results.cyapcnt = Math.floor(100 - (to / from) * 100 + 0.5) + "%";
    }
    return results;
}

export function calculateSALT(size, unit, from, to) {
    const results = { saltlb: "0", saltpcnt: "some" };
    if (from < to) {
        const temp = (to - from) * getGallons(size, unit) / 7468.64;
        results.saltlb = formatLbs(temp, unit);
    } else if (from > to) {
        results.saltpcnt = Math.floor(100 - (to / from) * 100 + 0.5) + "%";
    }
    return results;
}

const BOR_MUL = [849.271, 1309.52, 1111.69];
export function calculateBOR(size, unit, from, to, borpop) {
    const gallons = getGallons(size, unit);
    const results = { boroz: "0", borvol: "0", boracid: "0", borpcnt: "some" };
    if (from < to) {
        const temp = (to - from) * gallons / BOR_MUL[borpop];
        results.boroz = formatWeight(temp, unit);
        if (borpop === 1) {
            results.borvol = formatVolume(temp * 1.075, unit);
        } else if (borpop === 2) {
            results.borvol = formatVolume(temp * 0.5296, unit);
            results.boracid = formatVolume(temp * 0.624, unit);
        } else {
            results.borvol = formatVolume(temp * 0.9586, unit);
            results.boracid = formatVolume(temp * 0.4765, unit);
        }
    } else if (from > to) {
        results.borpcnt = Math.floor(100 - (to / from) * 100 + 0.5) + "%";
    }
    return results;
}

export function calculateCSI(ph, ta, ch, cya, salt, borate, temp, unit) {
    if (ph < 6 || ph > 9 || isNaN(ph)) return "PH Err";
    let t = temp;
    if (unit !== UNITS.METRIC) t = (temp - 32) * 5 / 9;
    const carbAlk = ta - 0.38772 * cya / (1 + Math.pow(10, 6.83 - ph)) - 4.63 * borate / (1 + Math.pow(10, 9.11 - ph));
    let extraNaCl = salt - 1.1678 * ch;
    if (extraNaCl < 0) extraNaCl = 0;
    const ionic = (1.5 * ch + 1 * ta) / 50045 + extraNaCl / 58440;
    const csi = ph - 11.677 + Math.log(ch) / Math.LN10 + Math.log(carbAlk) / Math.LN10 -
                2.56 * Math.sqrt(ionic) / (1 + 1.65 * Math.sqrt(ionic)) -
                1412.5 / (t + 273.15) + 4.7375;
    return (Math.floor(csi * 100 + 0.5) / 100).toString();
}

export function calculateSuggestedFC(cya) {
    return {
        swgMin: Math.max(1, Math.floor(cya * 0.045 + 0.7)),
        swgTgt: Math.max(3, Math.floor(cya * 0.075)),
        norMin: Math.max(1, Math.floor(cya * 0.075 + 0.7)),
        norTgt1: Math.max(3, Math.floor(cya / 10 + 1.5)),
        norTgt2: Math.max(3, Math.floor(cya / 10 + 3.5)),
        shock: Math.max(10, Math.floor(cya * 0.393 + 0.5)),
        mustard: Math.max(12, Math.floor(cya / 2 + 4.5))
    };
}

export function calculateSize(wid, len, deep, szpop, unit) {
    const volmult = [7.48052, 7.48052, 5.87518];
    let w = wid;
    let l = len;
    if (szpop === 2) l = w;
    if (szpop === 1 && l < w) [w, l] = [l, w];
    let temp = w * l;
    if (szpop === 1) temp = temp - 0.214602 * w * w;
    temp = temp * deep * volmult[szpop];
    return formatGallons(temp, unit);
}

const EFF_UNITS = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2];
function formatEFFValue(value) {
    if (value < 9.95) return (Math.floor(value * 10 + 0.5) / 10);
    else return (Math.floor(value + 0.5));
}

export function calculateEffect(effoz, effpop, unit, size) {
    const gallons = getGallons(size, unit);
    let oz = effoz;
    const effUnitType = EFF_UNITS[effpop];
    
    if (unit === UNITS.METRIC) {
        if (effUnitType === 1) oz *= 0.035274;
        else if (effUnitType === 2) oz *= 2.20462;
        else oz *= 0.033814;
    } else if (unit === UNITS.IMPERIAL) {
        if (effUnitType !== 2 && effUnitType === 0) oz *= 0.96076;
    }

    let result = "";
    const f = (val) => formatEFFValue(val);
    const m = (val) => Math.floor(val * 100 + 0.5) / 100;

    let currentOz = oz;
    switch (effpop) {
        case 0: currentOz = currentOz * 525 / 600; // fallthrough
        case 1: currentOz = currentOz * 600 / 825; // fallthrough
        case 2: currentOz = currentOz * 0.84867552; // fallthrough
        case 3: currentOz = currentOz * 100 / 125; // fallthrough
        case 4:
            result = `raise FC by ${f(currentOz / gallons * 976.562)} and raise Salt by ${f(currentOz / gallons * 1607)}`;
            break;
        case 5:
            result = `raise FC by ${f(oz / gallons * 6854.95)}, raise CYA by ${f(oz / gallons * 4159.41)}, lower pH by ${m(oz / gallons * 367)}, and raise Salt by ${f(oz / gallons * 5600)}`;
            break;
        case 6:
            result = `raise FC by ${f(oz / gallons * 4149.03)}, raise CYA by ${f(oz / gallons * 3776.46)}, lower pH by ${m(oz / gallons * 158)}, and raise Salt by ${f(oz / gallons * 3384)}`;
            break;
        case 7: currentOz = oz * 48 / 53; // fallthrough
        case 8: currentOz = currentOz * 53 / 65; // fallthrough
        case 9: currentOz = currentOz * 65 / 73; // fallthrough
        case 10:
            result = `raise FC by ${f(currentOz / gallons * 5422.41)}, raise CH by ${f(currentOz / gallons * 3827.09)}, and raise Salt by ${f(currentOz / gallons * 5500)}`;
            break;
        case 11:
            result = `raise FC by ${f(oz / gallons * 2637.5)} and raise Salt by ${f(oz / gallons * 4170)}`;
            break;
        case 12:
            result = `raise FC by ${f(oz / gallons * 7489.4)}, lower pH by ${m(oz / gallons * 625)}, and raise Salt by ${f(oz / gallons * 6140)}`;
            break;
        case 13: currentOz = oz / 2; // fallthrough
        case 14:
            result = `lower pH by ${m(currentOz / gallons * 240.15)} and lower TA by ${f(currentOz / gallons * 3911.47)}`;
            break;
        case 15:
            result = `lower pH by ${m(oz / gallons * 167.9)} and lower TA by ${f(oz / gallons * 2909.47)}`;
            break;
        case 16:
            result = `raise pH by ${m(oz / gallons * 217.1)} and raise TA by ${f(oz / gallons * 7072.46)}`;
            break;
        case 17:
            result = `raise pH by ${m(oz / gallons * 109.1)}, raise Borate by ${f(oz / gallons * 849.271)}, and raise TA by ${f(oz / gallons * 1949.93)}`;
            break;
        case 18:
            result = `raise pH by ${m(oz / gallons * 166.8)}, raise Borate by ${f(oz / gallons * 1111.69)}, and raise TA by ${f(oz / gallons * 2548.89)}`;
            break;
        case 19:
            result = `raise Borate by ${f(oz / gallons * 1309.52)} and lower PH by ${m(oz / gallons * 7.559)}`;
            break;
        case 20:
            result = `raise pH by ${m(oz / gallons * 546.3)} and raise TA by ${f(oz / gallons * 9135.78)}`;
            break;
        case 21:
            result = `raise TA by ${f(oz / gallons * 4461.56)} and raise pH by ${m(oz / gallons * 9.091)}`;
            break;
        case 22:
            result = `raise CH by ${f(oz / gallons * 6754.11)}`;
            break;
        case 23:
            result = `raise CH by ${f(oz / gallons * 5098.82)}`;
            break;
        case 24:
            result = `raise CYA by ${f(oz / gallons * 7489.51)} and lower pH by ${m(oz / gallons * 138.8)}`;
            break;
        case 25:
            result = `raise CYA by ${f(oz / gallons * 2890)}`;
            break;
        case 26:
            result = `raise Salt by ${f(oz / gallons * 7468.64 * 16)}`;
            break;
    }
    return result + ".";
}
