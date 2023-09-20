// populate the page with initial elements
function initializeForm() {
  const root = document.querySelector("#root");

  let typeInputDiv = document.createElement("div");
  let typeInputIcon = document.createElement("i");
  typeInputDiv.classList.add("has-icon-right");
  typeInputIcon.classList.add("form-icon");
  typeInputIcon.id = "typeInputIcon";
  let cableTypeSelectElement = document.createElement("select");
  cableTypeSelectElement.id = "type";
  cableTypeSelectElement.classList.add("form-select");
  root.appendChild(typeInputDiv);
  typeInputDiv.appendChild(cableTypeSelectElement);
  typeInputDiv.appendChild(typeInputIcon);

  let cableSubtypeSelectElement = document.createElement("select");
  cableSubtypeSelectElement.id = "subtype";
  cableSubtypeSelectElement.classList.add("form-select");
  root.appendChild(cableSubtypeSelectElement);

  let lengthInput = document.createElement("input");
  lengthInput.id = "length";
  lengthInput.classList.add("form-input");
  lengthInput.placeholder = "км";
  lengthInput.disabled = true;
  root.appendChild(lengthInput);

  let button = document.createElement("button");
  button.id = "calculate";
  button.classList.add("btn");
  button.innerText = "Рассчитать";
  button.disabled = true;
  root.appendChild(button);

  let p = document.createElement("p");
  p.id = "result";
  root.appendChild(p);
}

initializeForm();

// get the rendered elements
const cableTypeSelectElement = document.querySelector("#type");
const cableSubtypeSelectElement = document.querySelector("#subtype");
const lengthInput = document.querySelector("#length");
const button = document.querySelector("#calculate");
const result = document.querySelector("#result");
const typeInputIcon = document.querySelector("#typeInputIcon");

// clear the select and fill it with default values
function initializeSelectWithDefaultValues(element, value, isDisabled) {
  let option = document.createElement("option");
  option.text = value;
  element.add(option);
  element.disabled = isDisabled;
}

initializeSelectWithDefaultValues(
  cableTypeSelectElement,
  "Группа маркоразмера",
  false
);

initializeSelectWithDefaultValues(
  cableSubtypeSelectElement,
  "Подгруппа маркоразмера",
  true
);

// expose future data to the outer scope
let cablesData;
let cableSubtypeEntries;
let cableMassPerUnit;

// main function
const handleCableMassCalculation = async () => {
  try {
    const url = "cables.json";
    typeInputIcon.classList.add("loading");

    const data = await fetch(url);

    if (!data.ok) throw new Error("данные не были получены.");
    cablesData = await data.json();
    typeInputIcon.classList.remove("loading");

    populateCableTypeSelect();
    populateCableSubtypeSelect();
    getCableMassPerUnit();
    checkIfInputIsEmpty();
    calculateCableMass();
  } catch (error) {
    typeInputIcon.classList.remove("loading");
    cableTypeSelectElement.disabled = "true";
    cableTypeSelectElement.style.borderColor = "red";
    cableTypeSelectElement.options[0].text = "Ошибка загрузки данных";
    cableTypeSelectElement.style.color = "red";
    console.error(`Ошибка в обработке запроса: ${error.message}`);
  }
};

handleCableMassCalculation();

// fills the first select element with initial data
function populateCableTypeSelect() {
  Object.entries(cablesData).forEach(([key]) => {
    let option = document.createElement("option");
    option.text = key;
    cableTypeSelectElement.add(option);
  });
}

// fills the second select element with data
// based on the first select element option
function populateCableSubtypeSelect() {
  cableTypeSelectElement.addEventListener("change", (e) => {
    cableTypeSelectElement.options[0].disabled = true;
    cableSubtypeSelectElement.innerHTML = "";
    lengthInput.disabled = true;
    result.innerHTML = "";

    initializeSelectWithDefaultValues(
      cableSubtypeSelectElement,
      "Подгруппа маркоразмера",
      false
    );

    cableSubtypeSelectElement.options[0].disabled = true;

    let cableTypeValues = Object.values(cablesData);
    cableSubtypeEntries = Object.entries(
      cableTypeValues[e.currentTarget.selectedIndex - 1]
    );

    if (cableSubtypeEntries.length === 0) {
      let option = document.createElement("option");
      option.text = "Нет данных для данной группы";
      cableSubtypeSelectElement.innerHTML = "";
      cableSubtypeSelectElement.disabled = true;
      cableSubtypeSelectElement.add(option);
      button.disabled = true;
    } else {
      Object.values(cableSubtypeEntries).forEach((value) => {
        let option = document.createElement("option");
        option.text = value[0];
        cableSubtypeSelectElement.add(option);
      });
    }

    cableSubtypeSelectElement.focus();
  });
}

// finds the value needed (mass of the selected item
// in the second select element)
function getCableMassPerUnit() {
  cableSubtypeSelectElement.addEventListener("change", (e) => {
    lengthInput.disabled = false;
    button.disabled = false;
    result.innerHTML = "";

    let currentSubtypeValue = Object.values(
      cableSubtypeEntries[e.currentTarget.selectedIndex - 1][1]
    );
    cableMassPerUnit = currentSubtypeValue.find(
      (o) => o.name === "Расчетная масса (вес)"
    ).value;
    lengthInput.focus();
  });
}

// checking the input for non-numeric values
function checkIfInputIsEmpty() {
  lengthInput.addEventListener("input", (e) => {
    if (e.target.value === "" || isNaN(e.target.value)) {
      button.disabled = true;
    } else {
      button.disabled = false;
    }
  });
}

// do the math
function calculateCableMass() {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    result.innerHTML = `Масса <strong>${
      lengthInput.value
    }</strong>&nbsp;км кабеля <strong><nobr>${
      cableSubtypeSelectElement.selectedOptions[0].value
    }</nobr></strong>&nbsp;&mdash; <strong> ${
      lengthInput.value * cableMassPerUnit
    }</strong>&nbsp;кг.`;
  });
}
