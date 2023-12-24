// populate the page with initial elements
function initializeForm() {
  var root = document.querySelector("#root");

  var formElement = document.createElement("form")
  root.appendChild(formElement)

  var typeInputDiv = document.createElement("div");
  var typeInputIcon = document.createElement("i");
  typeInputDiv.classList.add("has-icon-right");
  typeInputIcon.classList.add("form-icon");
  typeInputIcon.id = "typeInputIcon";
  var cableTypeSelectElement = document.createElement("select");
  cableTypeSelectElement.id = "type";
  cableTypeSelectElement.classList.add("form-select");
  formElement.appendChild(typeInputDiv);
  typeInputDiv.appendChild(cableTypeSelectElement);
  typeInputDiv.appendChild(typeInputIcon);

  var cableSubtypeSelectElement = document.createElement("select");
  cableSubtypeSelectElement.id = "subtype";
  cableSubtypeSelectElement.classList.add("form-select");
  formElement.appendChild(cableSubtypeSelectElement);

  var lengthInput = document.createElement("input");
  lengthInput.id = "length";
  lengthInput.classList.add("form-input");
  lengthInput.placeholder = "км";
  lengthInput.disabled = true;
  formElement.appendChild(lengthInput);

  var button = document.createElement("button");
  button.type = "submit"
  button.id = "calculate";
  button.classList.add("btn");
  button.innerText = "Рассчитать";
  button.disabled = true;
  formElement.appendChild(button);

  var p = document.createElement("p");
  p.id = "result";
  formElement.appendChild(p);

  cableTypeSelectElement.focus()
}

initializeForm();

// get the rendered elements
var cableTypeSelectElement = document.querySelector("#type");
var cableSubtypeSelectElement = document.querySelector("#subtype");
var lengthInput = document.querySelector("#length");
var button = document.querySelector("#calculate");
var result = document.querySelector("#result");
var typeInputIcon = document.querySelector("#typeInputIcon");

// clear the select and fill it with default values
function initializeSelectWithDefaultValues(element, value, isDisabled) {
  var option = document.createElement("option");
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
var cablesData;
var cableSubtypeEntries;
var cableMassPerUnit;

// main function
var handleCableMassCalculation = async () => {
  try {
    var url = "cables.json";
    typeInputIcon.classList.add("loading");

    var data = await fetch(url);

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
    var option = document.createElement("option");
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

    var cableTypeValues = Object.values(cablesData);
    cableSubtypeEntries = Object.entries(
      cableTypeValues[e.currentTarget.selectedIndex - 1]
    );

    if (cableSubtypeEntries.length === 0) {
      var option = document.createElement("option");
      option.text = "Нет данных для данной группы";
      cableSubtypeSelectElement.innerHTML = "";
      cableSubtypeSelectElement.disabled = true;
      cableSubtypeSelectElement.add(option);
      button.disabled = true;
    } else {
      Object.values(cableSubtypeEntries).forEach((value) => {
        var option = document.createElement("option");
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
    result.innerHTML = "";

    var currentSubtypeValue = Object.values(
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
