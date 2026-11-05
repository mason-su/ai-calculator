(function () {
  "use strict";

  const expressionEl = document.getElementById("expression");
  const resultEl = document.getElementById("result");
  const messageEl = document.getElementById("message");

  let currentValue = "0";
  let previousValue = null;
  let operator = null;
  let justEvaluated = false;

  function showMessage(text) {
    messageEl.textContent = text;
  }

  function clearMessage() {
    messageEl.textContent = "";
  }

  function formatDisplay(value) {
    if (!Number.isFinite(value)) {
      return "Error";
    }

    const asNumber = Number(value);
    if (!Number.isFinite(asNumber)) {
      return "Error";
    }

    // Keep integers clean; limit long decimals for readability.
    if (Number.isInteger(asNumber)) {
      return String(asNumber);
    }

    return parseFloat(asNumber.toPrecision(12)).toString();
  }

  function updateDisplay() {
    const expressionParts = [];

    if (previousValue !== null && operator !== null) {
      expressionParts.push(formatDisplay(previousValue), operatorSymbol(operator));
    }

    expressionEl.textContent = expressionParts.join(" ");
    resultEl.textContent = currentValue;
  }

  function operatorSymbol(op) {
    switch (op) {
      case "+":
        return "+";
      case "-":
        return "−";
      case "*":
        return "×";
      case "/":
        return "÷";
      default:
        return op;
    }
  }

  function resetCalculator() {
    currentValue = "0";
    previousValue = null;
    operator = null;
    justEvaluated = false;
    clearMessage();
    updateDisplay();
  }

  function inputDigit(digit) {
    clearMessage();

    if (justEvaluated) {
      currentValue = digit === "." ? "0." : digit;
      justEvaluated = false;
      updateDisplay();
      return;
    }

    if (digit === ".") {
      if (currentValue.includes(".")) {
        showMessage("Only one decimal point is allowed.");
        return;
      }
      currentValue = currentValue + ".";
      updateDisplay();
      return;
    }

    if (currentValue === "0") {
      currentValue = digit;
    } else {
      currentValue += digit;
    }

    updateDisplay();
  }

  function chooseOperator(nextOperator) {
    clearMessage();

    if (previousValue !== null && operator !== null && !justEvaluated) {
      const success = evaluate();
      if (!success) {
        return;
      }
    }

    previousValue = Number(currentValue);
    operator = nextOperator;
    justEvaluated = false;
    currentValue = "0";
    updateDisplay();
  }

  function calculate(a, b, op) {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        if (b === 0) {
          return { error: "Cannot divide by zero." };
        }
        return a / b;
      default:
        return { error: "Unknown operator." };
    }
  }

  function evaluate() {
    if (operator === null || previousValue === null) {
      showMessage("Enter an expression first (for example: 8 ÷ 2).");
      return false;
    }

    const left = previousValue;
    const right = Number(currentValue);

    if (!Number.isFinite(left) || !Number.isFinite(right)) {
      showMessage("Invalid number. Please clear and try again.");
      return false;
    }

    const outcome = calculate(left, right, operator);

    if (outcome && typeof outcome === "object" && outcome.error) {
      showMessage(outcome.error);
      return false;
    }

    currentValue = formatDisplay(outcome);
    previousValue = null;
    operator = null;
    justEvaluated = true;
    clearMessage();
    updateDisplay();
    return true;
  }

  function backspace() {
    clearMessage();

    if (justEvaluated) {
      resetCalculator();
      return;
    }

    if (currentValue.length <= 1) {
      currentValue = "0";
    } else {
      currentValue = currentValue.slice(0, -1);
    }

    updateDisplay();
  }

  document.querySelector(".keys").addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button) {
      return;
    }

    if (button.dataset.digit !== undefined) {
      inputDigit(button.dataset.digit);
      return;
    }

    if (button.dataset.operator !== undefined) {
      chooseOperator(button.dataset.operator);
      return;
    }

    switch (button.dataset.action) {
      case "clear":
        resetCalculator();
        break;
      case "backspace":
        backspace();
        break;
      case "equals":
        evaluate();
        break;
      default:
        break;
    }
  });

  document.addEventListener("keydown", function (event) {
    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
      event.preventDefault();
      inputDigit(key);
      return;
    }

    if (key === "+" || key === "-" || key === "*" || key === "/") {
      event.preventDefault();
      chooseOperator(key);
      return;
    }

    if (key === "Enter" || key === "=") {
      event.preventDefault();
      evaluate();
      return;
    }

    if (key === "Backspace") {
      event.preventDefault();
      backspace();
      return;
    }

    if (key === "Escape") {
      event.preventDefault();
      resetCalculator();
    }
  });

  updateDisplay();
})();
