const currentOperandElement = document.querySelector('.current-operand');
const previousOperandElement = document.querySelector('.previous-operand');
const toggleHistoryBtn = document.querySelector('.toggle-history');
const buttonsContainer = document.querySelector('.buttons-container');
const memoryIndicator = document.querySelector('.memory-indicator');
const historyPanel = document.querySelector('.history-panel');
const historyList = document.getElementById('history-list');

let currentOperand = '0';
let previousOperand = '';
let operation = undefined;
let memoryValue = 0;
let memoryActive = false;
let calculationHistory = [];

// Toggle history panel
toggleHistoryBtn.addEventListener('click', () => {
    historyPanel.style.display = 'block';
    renderHistory();
});

function closeHistory() {
    historyPanel.style.display = 'none';
}

function renderHistory() {
    historyList.innerHTML = '';
    if (calculationHistory.length === 0) {
        historyList.innerHTML = '<div style="color: #a5b1c2; text-align: center; padding: 20px;">No history yet</div>';
        return;
    }
    
    calculationHistory.slice().reverse().forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div>${item.expression}</div>
            <div style="color: var(--equals-color);">= ${item.result}</div>
        `;
        historyItem.addEventListener('click', () => {
            currentOperand = item.result;
            updateDisplay();
            closeHistory();
        });
        historyList.appendChild(historyItem);
    });
}

function clearHistory() {
    calculationHistory = [];
    renderHistory();
}

function addToHistory(expression, result) {
    calculationHistory.push({
        expression: expression,
        result: result
    });
    // Keep only last 50 items
    if (calculationHistory.length > 50) {
        calculationHistory.shift();
    }
}

function updateDisplay() {
    currentOperandElement.textContent = currentOperand;
    previousOperandElement.textContent = previousOperand;
    currentOperandElement.scrollLeft = currentOperandElement.scrollWidth;
    
    if (memoryActive) {
        memoryIndicator.style.display = 'block';
        memoryIndicator.textContent = 'M: ' + memoryValue;
    } else {
        memoryIndicator.style.display = 'none';
    }
}

function appendNumber(number) {
    if (number === 'Math.PI') {
        currentOperand = Math.PI.toString();
    } else if (number === 'Math.E') {
        currentOperand = Math.E.toString();
    } else if (number === 'Math.PI/2') {
        currentOperand = (Math.PI/2).toString();
    } else if (number === 'Math.PI/4') {
        currentOperand = (Math.PI/4).toString();
    } else if (number === 'Math.PI*2') {
        currentOperand = (Math.PI*2).toString();
    } else {
        if (currentOperand === '0' && number !== '.') {
            currentOperand = number;
        } else {
            if (number === '.' && currentOperand.includes('.')) return;
            currentOperand += number;
        }
    }
    updateDisplay();
}

function appendOperator(operator) {
    if (currentOperand === '') return;
    if (previousOperand !== '') {
        calculate();
    }
    operation = operator;
    previousOperand = currentOperand + ' ' + operator;
    currentOperand = '';
    updateDisplay();
}

function calculateFunction(func, closingBracket) {
    if (currentOperand === '' && previousOperand !== '') {
        currentOperand = previousOperand.split(' ')[0];
        previousOperand = '';
    }
    
    try {
        const result = eval(func + currentOperand + closingBracket);
        addToHistory(func + currentOperand + closingBracket, result);
        currentOperand = result.toString();
        updateDisplay();
    } catch (error) {
        currentOperand = 'Error';
        updateDisplay();
        setTimeout(clearAll, 1500);
    }
}

function calculateFactorial() {
    const num = parseFloat(currentOperand);
    if (num < 0 || !Number.isInteger(num)) {
        currentOperand = 'Error';
        updateDisplay();
        setTimeout(clearAll, 1500);
        return;
    }
    let result = 1;
    for (let i = 2; i <= num; i++) {
        result *= i;
    }
    addToHistory(currentOperand + '!', result);
    currentOperand = result.toString();
    updateDisplay();
}

function calculateReciprocal() {
    if (currentOperand === '0') {
        currentOperand = 'Error';
        updateDisplay();
        setTimeout(clearAll, 1500);
        return;
    }
    const result = 1 / parseFloat(currentOperand);
    addToHistory('1/(' + currentOperand + ')', result);
    currentOperand = result.toString();
    updateDisplay();
}

function degToRad() {
    const result = parseFloat(currentOperand) * Math.PI / 180;
    addToHistory(currentOperand + '° → rad', result);
    currentOperand = result.toString();
    updateDisplay();
}

function radToDeg() {
    const result = parseFloat(currentOperand) * 180 / Math.PI;
    addToHistory(currentOperand + 'rad → °', result);
    currentOperand = result.toString();
    updateDisplay();
}

function appendRandomNumber() {
    currentOperand = Math.random().toString();
    updateDisplay();
}

function calculate() {
    let computation;
    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);
    const expression = previousOperand + ' ' + currentOperand;
    
    if (isNaN(prev) || isNaN(current)) {
        if (previousOperand === '' && currentOperand !== '') {
            try {
                computation = eval(currentOperand.replace(/×/g, '*').replace(/÷/g, '/'));
                addToHistory(currentOperand, computation);
            } catch (error) {
                computation = 'Error';
            }
        } else {
            return;
        }
    } else {
        switch (operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
            case '×':
                computation = prev * current;
                break;
            case '/':
            case '÷':
                computation = prev / current;
                break;
            case '**':
                computation = Math.pow(prev, current);
                break;
            default:
                return;
        }
        addToHistory(expression, computation);
    }
    
    currentOperand = computation.toString();
    operation = undefined;
    previousOperand = '';
    updateDisplay();
}

function clearAll() {
    currentOperand = '0';
    previousOperand = '';
    operation = undefined;
    updateDisplay();
}

function deleteLastChar() {
    if (currentOperand.length === 1) {
        currentOperand = '0';
    } else {
        currentOperand = currentOperand.slice(0, -1);
    }
    updateDisplay();
}

function toggleSign() {
    if (currentOperand.startsWith('-')) {
        currentOperand = currentOperand.substring(1);
    } else {
        currentOperand = '-' + currentOperand;
    }
    updateDisplay();
}

// Memory functions
function memoryAdd() {
    const current = parseFloat(currentOperand);
    if (!isNaN(current)) {
        memoryValue += current;
        memoryActive = true;
        updateDisplay();
    }
}

function memorySubtract() {
    const current = parseFloat(currentOperand);
    if (!isNaN(current)) {
        memoryValue -= current;
        memoryActive = true;
        updateDisplay();
    }
}

function memoryRecall() {
    currentOperand = memoryValue.toString();
    updateDisplay();
}

function memoryClear() {
    memoryValue = 0;
    memoryActive = false;
    updateDisplay();
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
    else if (e.key === '.') appendNumber('.');
    else if (e.key === '+') appendOperator('+');
    else if (e.key === '-') appendOperator('-');
    else if (e.key === '*') appendOperator('×');
    else if (e.key === '/') appendOperator('/');
    else if (e.key === 'Enter' || e.key === '=') calculate();
    else if (e.key === 'Escape') clearAll();
    else if (e.key === 'Backspace') deleteLastChar();
    else if (e.key === '(') appendOperator('(');
    else if (e.key === ')') appendOperator(')');
    else if (e.key === '^') appendOperator('**');
    else if (e.key === 'm' && e.shiftKey) memoryAdd();
    else if (e.key === 'm' && e.altKey) memorySubtract();
    else if (e.key === 'm' && e.ctrlKey) memoryClear();
    else if (e.key === 'm') memoryRecall();
    else if (e.key === 'h' || e.key === 'H') toggleHistoryBtn.click();
});

// Initialize display
updateDisplay();