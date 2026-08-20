const COUNTRIES_URL =
  "https://countriesnow.space/api/v0.1/countries";

const US_STATES_URL =
  "https://countriesnow.space/api/v0.1/countries/states";

const US_CITIES_URL =
  "https://countriesnow.space/api/v0.1/countries/state/cities";

const SHEET_WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbzSKTZddXKensvnHYAB1q_qj8VtUcTaELh_gLgsj4YMWMXZ9EpUZHA4oH7DtndhK0pSpw/exec";


let mpqPreResult = {
  userType: null,

  location: {
    country: null,
    state: null,
    city: null
  },

  email: null
};


let mpqStepIndex = 0;

let countriesLoaded = false;

let cityOptions = [];


// =====================================================
// OPEN FLOW
// =====================================================

function showPreResultsFlow() {

  const overlay =
    document.getElementById("pre-results-overlay");

  const modal =
    document.getElementById("pre-results-modal");

  if (!overlay || !modal) {

    console.warn(
      "Pre-results UI missing. Showing results directly."
    );

    showResultsPage();

    return;
  }


  overlay.classList.add("active");

  modal.classList.add("active");


  document.body.style.overflow =
    "hidden";


  setActiveStep(0);

  showConsentStep();
}


// =====================================================
// CLOSE FLOW
// =====================================================

function hidePreResultsFlow() {

  document
    .getElementById("pre-results-overlay")
    ?.classList.remove("active");


  document
    .getElementById("pre-results-modal")
    ?.classList.remove("active");


  document.body.style.overflow =
    "";
}


// =====================================================
// CONSENT
// =====================================================

function showConsentStep() {

  document
    .getElementById("opt_in_screen")
    ?.classList.add("active");
}


function hideConsentStep() {

  document
    .getElementById("opt_in_screen")
    ?.classList.remove("active");
}


// =====================================================
// STEP CONTROL
// =====================================================

function setActiveStep(step) {

  mpqStepIndex = step;


  document
    .querySelectorAll(".mpq-step")
    .forEach(stepElement => {

      const isActive =
        Number(stepElement.dataset.step) === step;

      stepElement.classList.toggle(
        "active",
        isActive
      );
    });


  const backBtn =
    document.getElementById("mpqBackBtn");

  const skipBtn =
    document.getElementById("mpqSkipBtn");

  const nextBtn =
    document.getElementById("mpqNextBtn");

  const finishBtn =
    document.getElementById("mpqFinishBtn");


  backBtn.style.display =
    step === 0
      ? "none"
      : "inline-flex";


  nextBtn.style.display =
    step < 2
      ? "inline-flex"
      : "none";


  finishBtn.style.display =
    step === 2
      ? "inline-flex"
      : "none";


  skipBtn.style.display =
    "inline-flex";


  if (
    step === 1 &&
    !countriesLoaded
  ) {
    populateCountries();
  }


  validateCurrentStep();
}


// =====================================================
// VALIDATION
// =====================================================

function validateCurrentStep() {

  const nextBtn =
    document.getElementById("mpqNextBtn");


  const finishBtn =
    document.getElementById("mpqFinishBtn");


  if (mpqStepIndex === 0) {

    const userType =
      document.getElementById(
        "mpqUserType"
      )?.value;


    nextBtn.disabled =
      !userType;


    finishBtn.disabled =
      true;


    return;
  }


  if (mpqStepIndex === 1) {

    const country =
      document.getElementById(
        "mpqCountry"
      )?.value;


    nextBtn.disabled =
      !country;


    finishBtn.disabled =
      true;


    return;
  }


  nextBtn.disabled =
    true;


  finishBtn.disabled =
    false;
}


// =====================================================
// COUNTRIES
// =====================================================

async function populateCountries() {

  const countrySelect =
    document.getElementById(
      "mpqCountry"
    );


  try {

    countrySelect.disabled =
      true;


    countrySelect.innerHTML =
      `<option disabled selected>
        Loading countries...
      </option>`;


    const response =
      await fetch(
        COUNTRIES_URL
      );


    const json =
      await response.json();


    const countries =
      (json?.data || [])
        .map(
          country =>
            country.country ||
            country.name
        )
        .filter(Boolean)
        .sort(
          (a, b) =>
            a.localeCompare(b)
        );


    const US =
      "United States";


    const ordered =
      [
        US,
        ...countries.filter(
          country =>
            country !== US
        )
      ];


    countrySelect.innerHTML =

      `<option
        value=""
        disabled
        selected
      >
        Select country
      </option>`

      +

      ordered
        .map(
          country =>
            `<option value="${country}">
              ${country}
            </option>`
        )
        .join("");


    countriesLoaded =
      true;

  }

  catch (error) {

    console.error(
      "Country loading failed:",
      error
    );


    countrySelect.innerHTML = `
      <option value="" disabled selected>
        Select country
      </option>

      <option value="United States">
        United States
      </option>

      <option value="Canada">
        Canada
      </option>

      <option value="India">
        India
      </option>
    `;

  }

  finally {

    countrySelect.disabled =
      false;
  }
}


// =====================================================
// STATES
// =====================================================

async function populateStates() {

  const stateSelect =
    document.getElementById(
      "mpqState"
    );


  try {

    stateSelect.disabled =
      true;


    const response =
      await fetch(
        US_STATES_URL,
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            country:
              "United States"
          })
        }
      );


    const json =
      await response.json();


    const states =
      (
        json?.data?.states ||
        []
      )
        .map(
          state =>
            state.name
        )
        .filter(Boolean)
        .sort(
          (a, b) =>
            a.localeCompare(b)
        );


    stateSelect.innerHTML =

      `<option value="">
        Select state
      </option>`

      +

      states
        .map(
          state =>
            `<option value="${state}">
              ${state}
            </option>`
        )
        .join("");


    stateSelect.disabled =
      false;

  }

  catch (error) {

    console.error(
      "State loading failed:",
      error
    );
  }
}


// =====================================================
// CITIES
// =====================================================

async function populateCities(
  stateName
) {

  const cityInput =
    document.getElementById(
      "mpqCity"
    );


  const cityList =
    document.getElementById(
      "mpqCityList"
    );


  try {

    const response =
      await fetch(
        US_CITIES_URL,
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              country:
                "United States",

              state:
                stateName
            })
        }
      );


    const json =
      await response.json();


    cityOptions =
      (json?.data || [])
        .filter(Boolean)
        .sort(
          (a, b) =>
            a.localeCompare(b)
        );


    cityList.innerHTML =
      cityOptions
        .slice(0, 100)
        .map(
          city =>
            `<option value="${city}">`
        )
        .join("");


    cityInput.disabled =
      false;

  }

  catch (error) {

    console.error(
      "City loading failed:",
      error
    );


    cityOptions =
      [];
  }
}


// =====================================================
// SAVE PRE-RESULT INFO
// =====================================================

async function savePreResultsToSheet() {

  const payload = {

    userType:
      mpqPreResult.userType ||
      "",

    country:
      mpqPreResult.location
        .country ||
      "",

    state:
      mpqPreResult.location
        .state ||
      "",

    city:
      mpqPreResult.location
        .city ||
      "",

    email:
      mpqPreResult.email ||
      "",

    ua:
      navigator.userAgent ||
      ""
  };


  const body =
    new URLSearchParams({

      data:
        JSON.stringify(payload)

    }).toString();


  try {

    await fetch(
      SHEET_WEBAPP_URL,
      {

        method: "POST",

        mode: "no-cors",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded"
        },

        body
      }
    );

  }

  catch (error) {

    console.warn(
      "Pre-result logging skipped:",
      error
    );
  }
}


// =====================================================
// EVENTS
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const confirmBtn =
      document.getElementById(
        "confirmBtn"
      );

    const cancelBtn =
      document.getElementById(
        "cancelBtn"
      );

    const userType =
      document.getElementById(
        "mpqUserType"
      );

    const country =
      document.getElementById(
        "mpqCountry"
      );

    const state =
      document.getElementById(
        "mpqState"
      );

    const city =
      document.getElementById(
        "mpqCity"
      );

    const email =
      document.getElementById(
        "mpqEmail"
      );

    const backBtn =
      document.getElementById(
        "mpqBackBtn"
      );

    const skipBtn =
      document.getElementById(
        "mpqSkipBtn"
      );

    const nextBtn =
      document.getElementById(
        "mpqNextBtn"
      );

    const finishBtn =
      document.getElementById(
        "mpqFinishBtn"
      );


    // Consent = yes
    confirmBtn?.addEventListener(
      "click",
      () => {

        hideConsentStep();

        setActiveStep(0);
      }
    );


    // Consent = no
    cancelBtn?.addEventListener(
      "click",
      () => {

        hidePreResultsFlow();

        showResultsPage();
      }
    );


    userType?.addEventListener(
      "change",
      () => {

        mpqPreResult.userType =
          userType.value ||
          null;


        validateCurrentStep();
      }
    );


    country?.addEventListener(
      "change",
      async () => {

        const value =
          country.value ||
          null;


        mpqPreResult.location.country =
          value;


        const stateWrap =
          document.getElementById(
            "mpqStateWrap"
          );


        if (
          value ===
          "United States"
        ) {

          stateWrap.style.display =
            "flex";


          await populateStates();

        }

        else {

          stateWrap.style.display =
            "none";


          state.value =
            "";


          mpqPreResult.location.state =
            null;
        }


        validateCurrentStep();
      }
    );


    state?.addEventListener(
      "change",
      async () => {

        mpqPreResult.location.state =
          state.value ||
          null;


        if (state.value) {
          await populateCities(
            state.value
          );
        }
      }
    );


    city?.addEventListener(
      "change",
      () => {

        mpqPreResult.location.city =

          city.value.trim() ||
          null;
      }
    );


    backBtn?.addEventListener(
      "click",
      () => {

        if (
          mpqStepIndex > 0
        ) {

          setActiveStep(
            mpqStepIndex - 1
          );
        }
      }
    );


    skipBtn?.addEventListener(
      "click",
      () => {

        hidePreResultsFlow();

        showResultsPage();
      }
    );


    nextBtn?.addEventListener(
      "click",
      () => {

        if (
          mpqStepIndex === 0
        ) {

          mpqPreResult.userType =
            userType.value ||
            null;

        }


        else if (
          mpqStepIndex === 1
        ) {

          mpqPreResult.location = {

            country:
              country.value ||
              null,

            state:
              country.value ===
              "United States"
                ? (
                    state.value ||
                    null
                  )
                : null,

            city:
              city.value.trim() ||
              null
          };
        }


        setActiveStep(
          mpqStepIndex + 1
        );
      }
    );


    finishBtn?.addEventListener(
      "click",
      async () => {

        mpqPreResult.email =

          email.value.trim() ||
          null;


        finishBtn.disabled =
          true;


        finishBtn.textContent =
          "Saving...";


        try {

          await Promise.race([

            savePreResultsToSheet(),

            new Promise(
              resolve =>
                setTimeout(
                  resolve,
                  1200
                )
            )

          ]);

        }

        finally {

          finishBtn.disabled =
            false;


          finishBtn.textContent =
            "Reveal my result";
        }


        hidePreResultsFlow();

        showResultsPage();
      }
    );

  }
);