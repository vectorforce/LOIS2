const NEG = "!";
const IMPL = "->";
const EQ = "~";
const CON = "&";
const DIS = "|";

const OPENING_BRACKET = "(";
const CLOSING_BRACKET = ")";
const GLOBAL = 'g';

var RESULT;
var INPUT_CHARS = [];

function check(response) {
    let formula = document.getElementById('input').value;

    let tableLabel = document.getElementById("tableLabel");
    let truthTable = document.getElementById('truthTable');
    
    if (isCorrect(formula)) {
		tableLabel.innerHTML ="<div class=\"mb-2 float-left\"><b>Таблица истинности</b></div>";
		INPUT_CHARS = getElements(formula);
        INPUT_CHARS.sort();
        
		let map = buildTruthTable(formula);
		checkSimpleFormula(formula, map);
        truthTable.innerHTML = drawTable(map.truthTable);
        
		if((response && isTautology(map)) || (!response && !isTautology(map))){
			result.innerHTML = "<div class=\"alert alert-success\" role=\"alert\"><b>Ответ верный!</b></div>";
			return;
		} else {
			result.innerHTML = "<div class=\"alert alert-danger\" role=\"alert\"><b>Ответ неверный!</b></div>";
			return;
		}		
    } else {
		tableLabel.innerHTML = "";
        result.innerHTML = "<div class=\"alert alert-info\" role=\"alert\"><b>Некорректная формула!</b></div>";
        truthTable.innerHTML = "";
    }
}

function isCorrect(formula) {
    let regFormula = "([(][!]<ATOM_OR_CONST>[)])|([(]<ATOM_OR_CONST>((&)|(\\|)|(->)|(~))<ATOM_OR_CONST>[)])";
    let single = "([A-Z]|[0-1])";
    let patter = "<ATOM_OR_CONST>";
    let wildcard = "A";

    regFormula = regFormula.replace(new RegExp(patter, GLOBAL), single);
    regFormula = new RegExp(regFormula);

    let currentFormula = formula;
    formula = formula.replace(regFormula, wildcard);

    while (formula !== currentFormula) {
        currentFormula = formula;
        formula = formula.replace(regFormula, wildcard);
    }

    let arrOutput = formula.match(new RegExp(single, GLOBAL));

    return (formula.length === 1) && (arrOutput != null) && (arrOutput.length === 1);
}

/*
    @Author Dvornichenko A.
*/
function checkSimpleFormula(formula, object){
	if (formula === "0" || formula === "1") {
		for (let i = 0; i < Object.keys(object.truthTable).length; i++) {
			let result = object.truthTable[i];
			result[(formula + " ")] = parseInt(formula);
			object.truthTable[i] = result;
		}
		object.result = formula + " ";
	}
	else return;
}

function isTautology(map){
	for (let i = 0; i < Object.keys(map.truthTable).length; i++) {
		let result = map.truthTable[i];
		if (parseInt(result[map.result]) !== 1) {
			return false;
		}
    }

	return true;
}

function buildTruthTable(formula){
    let charsCount = INPUT_CHARS.length;
    let tableSize = Math.pow(2, charsCount);
    let truthTable = {};

    for (let i = 0; i < tableSize; i++) {
        let currentRow = convertToBinary(i, charsCount);
        let tempRow = getStartValues(INPUT_CHARS, currentRow);
        let results = getResponse(formula, tempRow);

        for (let key of Object.keys(results)) {
            tempRow[key] = results[key];
        }

        truthTable[i] = tempRow;
    }

    return {
        truthTable: truthTable,
		result: RESULT
    }
}

function getElements(formula) {
    let char = "([A-Z])";
    char = new RegExp(char, GLOBAL);
    let results = formula.match(char) || [];
    
    return results.filter(function (symbol, index) {
        return results.indexOf(symbol) === index;
    });
}

function convertToBinary(number, stringLength) {
    let string = (number >>> 0).toString(2);
    for (let i = string.length; i < stringLength; i++) {
        string = "0" + string;
    }

    return string;
}

function getStartValues(elements, currentNumber) {
    let object = {};
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        object[element] = currentNumber[i];
    }

    return object;
}

function getResponse(formula, row) {
    let currentFormula = formula;

    for (let key of Object.keys(row)) {
        let value = row[key];
        currentFormula = currentFormula.replace(new RegExp(key, GLOBAL), value);
    }

    return evaluateCurrentRow(currentFormula, formula);
}

function evaluateCurrentRow(formula, charFormula) {
    let regFormula = "([(][!][0-1][)])|([(][0-1]((&)|(->)|(~)|(\\|))[0-1][)])";
    let regCharFormula = "([(][!]([A-Zzf]|[\\d])[)])|([(]([A-Zzf]|[\\d])((&)|(->)|(~)|(\\|))([A-Zzf]|[\\d])[)])";
    let regCounter = "[!]|[~]|[&]|[|]|[>]";
	let counter;
    regCounter = new RegExp(regCounter, GLOBAL);

	if(charFormula.match(regCounter)) counter = charFormula.match(regCounter).length;
        else counter = 0;
        
    let results = [];
    let operations = [];
    let i = 0;
    regFormula = new RegExp(regFormula);
    regCharFormula = new RegExp(regCharFormula);

	while(charFormula.includes("0") || charFormula.includes("1")){
		charFormula = charFormula.replace("0", "z");
		charFormula = charFormula.replace("1", "f");
    }
    
    RESULT = charFormula;
    
    while (regFormula.exec(formula) != null && regCharFormula.exec(charFormula) != null) {
        let subFormula = regFormula.exec(formula)[0];
        let charIndex = regCharFormula.exec(charFormula)[0];
        let result = chooseOperation(subFormula);
        let resultIndex = deleteDigits(charIndex, operations);

		while(resultIndex.includes("z") || resultIndex.includes("f")){
			resultIndex = resultIndex.replace("z", "0");
			resultIndex = resultIndex.replace("f", "1");
        }
        
        results[resultIndex] = result;
        formula = formula.replace(subFormula, result);
        counter--;

        if (counter === 0) {
            RESULT = resultIndex;
            results[resultIndex] = result;
        }
		
        operations[i] = resultIndex;
        charFormula = charFormula.replace(charIndex, i);
        i++;
    }

    return results;
}

/*
    @Author Dvornichenko A.
*/
function deleteDigits(formula, operations) {
    let regNegation = "([(][!][\\d]+[)])";
    let regLeftDelete = "(([(][\\d]+)((&)|(->)|(~)|(\\|))[A-Zzf][)])";
    let regRightDelete = "(([(][A-Zzf])((&)|(->)|(~)|(\\|))[\\d]+[)])";
    let regTwoDelete = "(([(][\\d]+)((&)|(->)|(~)|(\\|))[\\d]+[)])";
    let expLeft = formula.match(new RegExp(regNegation + "|" + regLeftDelete, GLOBAL));
    let expRight = formula.match(new RegExp(regNegation + "|" + regRightDelete, GLOBAL));
    let exp = formula.match(new RegExp(regNegation + "|" + regTwoDelete, GLOBAL));
    if (exp !== null || expLeft !== null || expRight !== null) {
        let first;
        let operation = "";
        let second;
        let wrong;
        if (expRight !== null) {
            wrong = expRight[0];
        } else if (expLeft !== null) {
            wrong = expLeft[0];
        } else if (exp !== null) {
            wrong = exp[0];
        }
        if (wrong.indexOf(NEG) === -1) {
            if (wrong.indexOf(IMPL) > -1) {
                operation = IMPL;
                if (expRight !== null) {
                    first = wrong[1];
                    second = parseInt(wrong[4]);
                    return OPENING_BRACKET + first + operation + operations[second] + CLOSING_BRACKET;
                } else if (expLeft !== null) {
                    first = parseInt(wrong[1]);
                    second = wrong[4];
                    return OPENING_BRACKET + operations[first] + operation + second + CLOSING_BRACKET;
                } else if (exp !== null) {
                    first = parseInt(wrong[1]);
                    second = parseInt(wrong[4]);
                    return OPENING_BRACKET + operations[first] + operation + operations[second] + CLOSING_BRACKET;
                }
            } else {
                operation = wrong[2];
                if (expRight !== null) {
                    first = wrong[1];
                    second = parseInt(wrong[3]);
                    return OPENING_BRACKET + first + operation + operations[second] + CLOSING_BRACKET;
                } else if (expLeft !== null) {
                    first = parseInt(wrong[1]);
                    second = wrong[3];
                    return OPENING_BRACKET + operations[first] + operation + second + CLOSING_BRACKET;
                } else if (exp !== null) {
                    first = parseInt(wrong[1]);
                    second = parseInt(wrong[3]);
                    return OPENING_BRACKET + operations[first] + operation + operations[second] + CLOSING_BRACKET;
                }
            }
        } else {
            first = parseInt(wrong[2]);
            operation = NEG;
            return OPENING_BRACKET + operation + operations[first] + CLOSING_BRACKET;
        }
    } else {
        return formula;
    }
}

/*
    @Author Dvornichenko A.
*/
function chooseOperation(inputFormula) {
    if (inputFormula.indexOf(NEG) > -1) {
        return negation(inputFormula);
    } else if (inputFormula.indexOf(CON) > -1) {
        return conjuction(inputFormula);
    } else if (inputFormula.indexOf(EQ) > -1) {
        return equivalence(inputFormula);
    } else if (inputFormula.indexOf(IMPL) > -1) {
        return implication(inputFormula);
    } else if (inputFormula.indexOf(DIS) > -1) {
        return disjunction(inputFormula);
    } else {
        return -1;
    }
}

function negation(inputFormula) {
    return (!parseInt(inputFormula[2])) ? 1 : 0;
}

function conjuction(inputFormula) {
    return (parseInt(inputFormula[1]) && parseInt(inputFormula[3])) ? 1 : 0;
}

function disjunction(inputFormula) {
    return (parseInt(inputFormula[1]) || parseInt(inputFormula[3])) ? 1 : 0;
}

function implication(inputFormula) {
    return ((!parseInt(inputFormula[1])) || parseInt(inputFormula[4])) ? 1 : 0;
}

function equivalence(inputFormula) {
    return (parseInt(inputFormula[1]) === parseInt(inputFormula[3])) ? 1 : 0;
}

function drawTable(truthTable) {
    let tableSize = Math.pow(2, INPUT_CHARS.length);
    let innerHTML = "<thead class=\"thead-dark\">";
    let tr = "<tr>";

    for (let key of Object.keys(truthTable[0])) {
        tr += "<th>" + key + "</th>"
    }
    tr += "</tr>";
    innerHTML += tr;

    for (let i = 0; i < tableSize; i++) {
        let currentRow = truthTable[i];
        tr = "<tr>";

        for (let key of Object.keys(currentRow)) {
            let val = currentRow[key];
            tr += "<td>" + val + "</td>"
        }

        tr += "</tr>";
        innerHTML += tr;
    }

    return innerHTML;
}
