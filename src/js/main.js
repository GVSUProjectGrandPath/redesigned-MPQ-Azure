let currentQuestionIndex = 0; // Tracks the current question index
let selectedAnswers = []; // array for selected answers
let totalPoints = {
  "saver": 0,
  "lavish": 0,
  "investor": 0,
  "hustler": 0,
  "risk-taker": 0,
  "defensive": 0,
  "shopper": 0,
  "indifferent": 0
}; // Stores total points for each personality type

//api for location(states,city-pushpa)
const COUNTRIES_URL = 'https://countriesnow.space/api/v0.1/countries';
const US_STATES_URL = 'https://countriesnow.space/api/v0.1/countries/states';
const US_CITIES_URL = 'https://countriesnow.space/api/v0.1/countries/state/cities';

const OPTIN_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycby7t7mIEgDYofIZ2t7qdJWj63kYOX717jEdkISz8L3EaUTjuP-rNHLTI4qjgWnw6cA/exec'; // <-- their endpoint

let mpqPreResult = {
  userType: null,
  location: { country: null, state: null, city: null },
  email: null
};

// Tiny utilities used ONLY in the modal for subtle pause/feedback Pushpa
function pauseThen(fn, ms = 240) { setTimeout(fn, ms); }
function microTap(el, dur = 140) {
  el.style.transform = 'scale(0.98)';
  setTimeout(() => { el.style.transform = ''; }, dur);
}
// Google Sheet endpoint Pushpa //
const SHEET_WEBAPP_URL =
  'https://script.google.com/macros/s/AKfycbzSKTZddXKensvnHYAB1q_qj8VtUcTaELh_gLgsj4YMWMXZ9EpUZHA4oH7DtndhK0pSpw/exec';

async function savePreResultsToSheet(pre) {
  const payload = {
    userType: pre.userType || '',
    country: pre.location?.country || '',
    state: pre.location?.state || '',
    city: pre.location?.city || '',
    email: pre.email || '',
    ua: navigator.userAgent || ''
  };


  const body = new URLSearchParams({ data: JSON.stringify(payload) }).toString();

  try {
    // Fire-and-forget: no preflight, opaque response, no console error
    await fetch(SHEET_WEBAPP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, // allowed in no-cors
      body
    });
    // Don't read res; in no-cors it's opaque.
    return true;
  } catch (e) {
    // Even if the browser reports an error, don't break the UX.
    console.warn('Sheet log skipped:', e?.message || e);
    return false;
  }
}


//google sheet pushpa//
document.addEventListener('DOMContentLoaded', () => {
  const welcomeScreen = document.getElementById('welcome-screen2');
  const quizContainer = document.getElementById('quiz-container');
  const startButton = document.getElementById('start-button2');
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');
  // ===== Pre-Results (multi-step: user type → location → email) =====
  const overlayEl = document.getElementById('pre-results-overlay');
  const modalEl = document.getElementById('pre-results-modal');
  const backBtn = document.getElementById('mpqBackBtn');
  const skipBtn = document.getElementById('mpqSkipBtn');
  const nextBtn = document.getElementById('mpqNextBtn');
  const finishBtn = document.getElementById('mpqFinishBtn');
  // inputs
  const userTypeSelect = document.getElementById('mpqUserType');
  const emailInput = document.getElementById('mpqEmail');
  const stateSelect = document.getElementById('mpqState');
  const countrySelect = document.getElementById('mpqCountry');
  const stateWrap = document.getElementById('mpqStateWrap'); // wrapper can be hidden
  let mpqCountriesLoaded = false;

  // diego
  const optinEl = document.getElementById('opt_in_screen');
  const optYesBtn = document.getElementById('confirmBtn');
  const optNoBtn = document.getElementById('cancelBtn');

  function showOptIn() {
    // hide the global nav while opt-in is up
    backBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    finishBtn.style.display = 'none';
    skipBtn.style.display = 'none';

    optinEl.style.display = 'flex';
  }

  function hideOptIn() {
    optinEl.style.display = 'none';

    // restore normal nav for step 0
    backBtn.style.display = 'none';
    nextBtn.style.display = 'inline-flex';
    skipBtn.style.display = 'none';
    finishBtn.style.display = 'none';
  }

  // fire opt-in overlay as soon as the pre-results modal opens
  const _origShowPre = showPreResultsFlow;
  showPreResultsFlow = function () {
    // keep your original behavior
    if (!overlayEl || !modalEl) return showResults();
    overlayEl.style.display = 'block';
    modalEl.style.display = 'flex';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    wirePreResultsControls();
    setActiveStep(0);      // user type is under the overlay
    showOptIn();           // <-- this makes opt-in appear first
  };

  optYesBtn?.addEventListener('click', async () => {
    optYesBtn.disabled = true;
    optYesBtn.textContent = 'Saving…';

    try { await sendOptInToSheet(); } catch (_) { }

    optYesBtn.disabled = false;
    optYesBtn.textContent = 'Confirm';

    hideOptIn();           // hide the opt-in overlay only
    setActiveStep(0);      // make sure step 0 (user type) is visible
    // OR if you want to jump right into country/state/email step:
    // setActiveStep(1);
  });


  optNoBtn?.addEventListener('click', async () => {
    microTap(optNoBtn);
    setBtnLoading(optNoBtn, true, 'Closing…');
    try {
      await new Promise(r => setTimeout(r, 500)); // tiny feedback
    } finally {
      setBtnLoading(optNoBtn, false);
    }
    hideOptIn();          // close the opt-in overlay
    hidePreResultsFlow(); // close the whole pre-results modal
    showResults();        // go straight to results
  });



  // diego end

  // local state
  let mpqStepIndex = 0;
  let mpqStatesLoaded = false;
  let mpqWired = false;
  let cityAllOptions = [];

  // Build suggestions only when the user types
  const cityInput = document.getElementById('mpqCity');
  const cityList = document.getElementById('mpqCityList');

  function setBtnLoading(btn, isLoading, text = 'Saving…') {
    if (isLoading) {
      if (!btn.dataset.origText) btn.dataset.origText = btn.textContent;
      btn.textContent = text;
      btn.classList.add('loading');
      btn.disabled = true;
    } else {
      btn.textContent = btn.dataset.origText || btn.textContent;
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }


  function updateCitySuggestions(q) {
    // Hide list until at least 2 chars (tweak if you want 1)
    if (!q || q.trim().length < 2) {
      cityList.innerHTML = '';            // no options => no dropdown
      return;
    }
    const ql = q.toLowerCase();
    const filtered = cityAllOptions
      .filter(c => c.toLowerCase().includes(ql))
      .slice(0, 50); // cap results for UX
    cityList.innerHTML = filtered.map(c => `<option value="${c}">`).join('');
  }

  // As user types, update suggestions and revalidate
  cityInput.addEventListener('input', () => {
    updateCitySuggestions(cityInput.value);
    validateCurrentStep();
  });

  // When user confirms the value (enter/tab/click), store if valid
  cityInput.addEventListener('change', () => {
    const val = (cityInput.value || '').trim();
    // If we have a list (US + state chosen + cities loaded), enforce match; else free text (>=2 chars)
    if (cityAllOptions.length) {
      mpqPreResult.location.city = cityAllOptions.includes(val) ? val : null;
    } else {
      mpqPreResult.location.city = val.length >= 2 ? val : null;
    }
    validateCurrentStep();
  });

  // When Country changes
  countrySelect?.addEventListener('change', async () => {
    mpqPreResult.location.country = countrySelect.value || null;

    // reset dependent fields
    stateSelect.value = '';
    mpqPreResult.location.state = null;
    cityInput.value = '';
    mpqPreResult.location.city = null;
    cityAllOptions = [];
    cityList.innerHTML = '';

    if (countrySelect.value === 'United States') {
      // show state, load US states
      if (stateWrap) stateWrap.style.display = '';
      await populateStates();                 // your existing US-only loader
      // City: wait for state if they want suggestions, but allow free-text too
      cityInput.disabled = false;
      cityInput.placeholder = 'Type your city (select a state for suggestions)';
    } else {
      // hide/disable state for non-US
      if (stateWrap) stateWrap.style.display = 'none';
      stateSelect.disabled = true;
      cityInput.disabled = false;
      cityInput.placeholder = 'Type your city';
      // City: free text
      cityAllOptions = [];
    }

    validateCurrentStep();
  });

  // When State changes (US only, still optional)
  stateSelect?.addEventListener('change', async () => {
    const stateName = stateSelect.value || null;
    mpqPreResult.location.state = stateName;

    if (countrySelect.value === 'United States' && stateName) {
      await populateCities(stateName);          // fills cityAllOptions
      cityInput.disabled = false;
      cityInput.placeholder = 'Start typing your city';
    } else {
      // cleared state → allow free text city
      cityAllOptions = [];
      cityInput.disabled = false;
      cityInput.placeholder = 'Type your city';
    }
    validateCurrentStep();
  });


  async function populateCountries() {
    try {
      countrySelect.disabled = true;
      countrySelect.innerHTML = `<option value="" disabled selected>Loading countries…</option>`;

      const res = await fetch(COUNTRIES_URL);
      const json = await res.json();

      // Build and sort list
      const countries = (json?.data || [])
        .map(c => c.country || c.name)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));

      // Ensure United States appears first
      const US = 'United States';
      const ordered = [US, ...countries.filter(c => c !== US)];

      countrySelect.innerHTML =
        `<option value="" disabled selected>Select country</option>` +
        ordered.map(c => `<option value="${c}">${c}</option>`).join('');
    } catch (e) {
      console.error('Failed to load countries:', e);
      // Fallback (already has US first)
      countrySelect.innerHTML = `
      <option value="" disabled selected>Could not load — pick fallback</option>
      <option value="United States">United States</option>
      <option value="Canada">Canada</option>
      <option value="United Kingdom">United Kingdom</option>
      <option value="Australia">Australia</option>
      <option value="India">India</option>
    `;
    } finally {
      countrySelect.disabled = false;
      mpqCountriesLoaded = true;
    }
  }

  //popup questions start
  async function populateStates() {
    try {
      stateSelect.disabled = true;
      // control city INPUT + DATALIST (not a select)
      cityInput.disabled = true;
      cityInput.value = '';
      cityList.innerHTML = '';
      cityInput.placeholder = 'Type and select a state first';

      stateSelect.innerHTML = `<option value="" disabled selected>Loading states…</option>`;

      const res = await fetch(US_STATES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: 'United States' })
      });
      const json = await res.json();

      const states = (json?.data?.states || [])
        .map(s => s.name)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));

      stateSelect.innerHTML =
        `<option value="" disabled selected>Select state</option>` +
        states.map(s => `<option value="${s}">${s}</option>`).join('');

      stateSelect.disabled = false;
      mpqStatesLoaded = true;
    } catch (e) {
      console.error('Failed to load states:', e);
      stateSelect.innerHTML = `
          <option value="" disabled selected>Could not load — pick fallback</option>
          <option value="California">California</option>
          <option value="Florida">Florida</option>
          <option value="Michigan">Michigan</option>
          <option value="New York">New York</option>
          <option value="Texas">Texas</option>
        `;
      stateSelect.disabled = false;
    }
  }

  async function populateCities(stateName) {
    try {
      cityInput.disabled = true;
      cityInput.value = '';
      cityList.innerHTML = '';    // keep empty until user types
      cityAllOptions = [];

      const res = await fetch(US_CITIES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: 'United States', state: stateName })
      });
      const json = await res.json();

      cityAllOptions = (json?.data || [])
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));

      cityInput.disabled = false;
      cityInput.focus();
    } catch (e) {
      console.error('Failed to load cities:', e);
      cityAllOptions = [];
      cityInput.disabled = false;
    }
  }

  //opens your preresult modal
  function showPreResultsFlow() {
    if (!overlayEl || !modalEl) {
      console.warn('Pre-results UI missing; showing results directly.');
      return showResults();
    }
    overlayEl.style.display = 'block';
    modalEl.style.display = 'flex';

    // lock scroll
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    wirePreResultsControls();
    setActiveStep(0);
  }

  function hidePreResultsFlow() {
    if (overlayEl) overlayEl.style.display = 'none';
    if (modalEl) modalEl.style.display = 'none';
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }
  // Wire all modal controls once (Back / Next / Finish / Skip + inputs)
  function wirePreResultsControls() {
    if (mpqWired) return;
    mpqWired = true;

    // Skip → treat as skipped and show results
    skipBtn.addEventListener('click', () => {
      microTap(skipBtn);
      skipBtn.disabled = true;
      // logModalAnswer('skipped');
      pauseThen(() => {
        hidePreResultsFlow();
        showResults();
        skipBtn.disabled = false;
      }, 100);
    });

    // Back
    backBtn.addEventListener('click', () => {
      microTap(backBtn);
      if (mpqStepIndex > 0) setActiveStep(mpqStepIndex - 1);
    });

    // Next (step 0 → 1, step 1 → 2)
    nextBtn.addEventListener('click', () => {
      microTap(nextBtn);

      if (mpqStepIndex === 0) {
        mpqPreResult.userType = userTypeSelect.value || null;
      } else if (mpqStepIndex === 1) {
        const country = countrySelect.value || null;
        const state = (country === 'United States') ? (stateSelect.value || null) : null;
        const cityVal = (cityInput.value || '').trim();

        mpqPreResult.location = {
          country,
          state,   // may be null (optional)
          city: cityAllOptions.length
            ? (cityAllOptions.includes(cityVal) ? cityVal : null)
            : (cityVal || null)
        };
      }
      setActiveStep(mpqStepIndex + 1);
    });

    // Finish (step 2)
    finishBtn.addEventListener('click', async () => {
      microTap(finishBtn);
      const emailVal = (emailInput.value || '').trim();
      mpqPreResult.email = emailVal.length ? emailVal : null;

      // show button loader + timebox the wait so UI never feels stuck
      setBtnLoading(finishBtn, true, 'Saving…');
      try {
        await Promise.race([
          savePreResultsToSheet(mpqPreResult),      // your existing logger
          new Promise(r => setTimeout(r, 1200))     // cap perceived wait
        ]);
      } finally {
        setBtnLoading(finishBtn, false);
      }

      hidePreResultsFlow();
      showResults();  // keep or guard with your flag if you don’t want to show results here
    });

    // Live validation + dynamics
    userTypeSelect?.addEventListener('change', () => {
      const wrap = document.querySelector('.mpq-select-wrap') || userTypeSelect;
      wrap.style.opacity = '0.85';
      setTimeout(() => { wrap.style.opacity = ''; }, 140);
      validateCurrentStep();
    });

    // Click outside overlay → skip once
    overlayEl?.addEventListener('click', async () => {
      // logModalAnswer('skipped');
      try { await savePreResultsToSheet(mpqPreResult); } catch { }
      hidePreResultsFlow();
      showResults();
    }, { once: true });
  }

  // ===== Pre-Results (single question) =====

  function setActiveStep(step) {
    mpqStepIndex = step;

    document.querySelectorAll('.mpq-step').forEach(s => {
      s.style.display = Number(s.dataset.step) === step ? 'block' : 'none';
    });

    backBtn.style.display = step === 0 ? 'none' : 'inline-flex';
    nextBtn.style.display = step < 2 ? 'inline-flex' : 'none';
    finishBtn.style.display = step === 2 ? 'inline-flex' : 'none';

    if (step === 1) {
      if (!mpqCountriesLoaded) populateCountries();
      // do NOT call populateStates() here anymore
    }
    validateCurrentStep();
  }

  function validateCurrentStep() {
    if (mpqStepIndex === 0) {
      nextBtn.disabled = !(userTypeSelect && userTypeSelect.value);
      finishBtn.disabled = true;
      return;
    }

    if (mpqStepIndex === 1) {
      const countryOk = !!countrySelect?.value;
      // City & State are optional now
      nextBtn.disabled = !countryOk;
      finishBtn.disabled = true;
      return;
    }

    // step 2 (email optional)
    nextBtn.disabled = true;
    finishBtn.disabled = false;
  }


  //popup questions end

  const bodyElement = document.body;

  const totalQuestions = questions.length;

  // forces Safari to recognize :active for start button on mobile devices
  document.addEventListener("touchstart", function () { }, true);



  // Starts the quiz when the start button is clicked
  startButton.addEventListener('click', () => {
    welcomeScreen.style.display = 'none';
    quizContainer.style.display = 'flex';
    loadQuestion(currentQuestionIndex); // Load the first question
  });

  // backbutton
  const backButton = document.getElementById('back-button');

  if (window.matchMedia('(pointer: coarse)').matches) {
    backButton.addEventListener('touchstart', () => {
      backButton.classList.add('touchpress');
    });

    backButton.addEventListener('touchend', () => {
      setTimeout(() => {
        backButton.classList.remove('touchpress');
      }, 100); // match CSS animation duration
    });

    startButton.addEventListener('touchstart', () => {
      startButton.classList.add('touchpress');
    });

    startButton.addEventListener('touchend', () => {
      setTimeout(() => {
        startButton.classList.remove('touchpress');
      }, 100); // match CSS animation duration
    });
  }

  backButton.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      loadQuestion(currentQuestionIndex);
    } else {
      // Return to welcome screen if on first question
      quizContainer.style.display = 'none';
      welcomeScreen.style.display = 'flex';
      document.querySelectorAll('.answer-button').forEach(btn => btn.classList.remove('active'));
    }
  });

  document.getElementById('restart-button').addEventListener('click', restartQuiz);

  function MobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function updateScrollLock() {
    const feedbackPopup = document.getElementById('feedback-popup');
    const nextStepsPopup = document.getElementById('next-steps-popup');
    const sendResultsPopup = document.getElementById('resultSending-popup');

    const isFeedbackOpen = feedbackPopup.classList.contains('active');
    const isResultSendingOpen = sendResultsPopup.classList.contains('active');
    const isNextStepsOpen = window.getComputedStyle(nextStepsPopup).display === "block";
    const isAnyPopupOpen = isFeedbackOpen || isNextStepsOpen || isResultSendingOpen;

    if (isAnyPopupOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = 'auto';
      document.body.style.overflow = 'auto';
    }
  }

  if (MobileDevice()) {
    bodyElement.style.backgroundColor = 'black';
    document.querySelectorAll('#feedback-form label').forEach(label => {
      label.style.fontWeight = '550';
    });
  }
  // Show Next Steps Popup
  document.getElementById('next-steps-button').addEventListener('click', function () {
    document.querySelector('.nextStepsOverlay').style.display = 'block';
    document.getElementById('next-steps-popup').style.display = 'block';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  });

  // Close Next Steps Popup
  document.getElementById('closeNextStepsPopup').addEventListener('click', function () {
    document.querySelector('.nextStepsOverlay').style.display = 'none';
    document.getElementById('next-steps-popup').style.display = 'none';
    updateScrollLock();
    // document.documentElement.style.overflow = 'auto';
    // document.body.style.overflow = 'auto';
  });

  // Open Money Mindset Meetup JPG in new window
  document.getElementById('meetup-jpg-btn').addEventListener('click', function () {
    window.open('/src/assets/Money_Mindset_Meetup.jpg', '_blank');
  });

  // Sets up event listeners for answer buttons (NO pause here, per your request)
  document.querySelectorAll('.answer-button').forEach(button => {
    button.addEventListener('click', function () {
      recordAnswer(this.value);
    });

    if (window.matchMedia('(pointer: coarse)').matches) {

      button.addEventListener('touchstart', () => {
        button.classList.add('touchpress');
      });


      button.addEventListener('touchend', () => {
        setTimeout(() => {
          button.classList.remove('touchpress');
        }, 100); // match CSS animation duration
      });
    }

    // if (MobileDevice()) {
    //   button.classList.remove("mobile-click");
    //   void button.offsetWidth;
    //   button.classList.add("mobile-click");
    // }
  });
  // });

  // Attach Download Results button handler ONCE (no nested DOMContentLoaded)
  const downloadBtn = document.getElementById("downloadResultsBtn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
      // Use what showResults() stored earlier
      const userPersonalityType = window.userPersonalityType || "saver";
      // Make sure the path and extension match your files exactly
      const fileName = `${userPersonalityType}.jpg`;
      const fileUrl = `/src/assets/animal_results/${fileName}`;

      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  }

  // Updates the progress bar based on current question index
  function updateProgressBar() {
    if (totalQuestions > 0) {
      const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
      progressBar.style.width = `${progress}%`;
    }
  }

  // Loads the question at the specified index
  function loadQuestion(index) {
    const question = questions[index];
    document.getElementById('question-text').innerText = question.value;
    document.getElementById('step-indicator').innerText = `${index + 1} of  ${totalQuestions}`;

    updateProgressBar();

    document.getElementById('answer-sa').value = "sa";
    document.getElementById('answer-a').value = "a";
    document.getElementById('answer-n').value = "n";
    document.getElementById('answer-d').value = "d";
    document.getElementById('answer-sd').value = "sd";

    // Clear any previously active buttons and previous mobile clicks
    document.querySelectorAll('.answer-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.answer-button').forEach(btn => btn.classList.remove('mobile-click'));

    // Highlight the previously selected answer if it exists
    const selected = selectedAnswers[index];
    if (selected) {
      const button = document.querySelector(`.answer-button[value="${selected}"]`);
      if (button) button.classList.add('active');
    }
  }

  // Records the answer and updates the total points
  function recordAnswer(answer) {
    const question = questions[currentQuestionIndex];

    // If a previous answer exists for this question, subtract its points first
    const previousAnswer = selectedAnswers[currentQuestionIndex];
    if (previousAnswer) {
      const prevPoints = question.points[previousAnswer];
      for (const key in prevPoints) {
        if (totalPoints.hasOwnProperty(key)) {
          totalPoints[key] -= prevPoints[key]; // Subtract old points
        }
      }
    }

    // Save the new selected answer
    selectedAnswers[currentQuestionIndex] = answer;

    // Add new points
    const newPoints = question.points[answer];
    for (const key in newPoints) {
      if (totalPoints.hasOwnProperty(key)) {
        totalPoints[key] += newPoints[key];
      }
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      loadQuestion(currentQuestionIndex);
    } else {
      // Show single-step modal BEFORE results
      showPreResultsFlow();
    }
  }

  // Displays the quiz results and personality type
  function showResults() {
    let maxPoints = -Infinity;
    let personalityType = '';

    // Determine the personality type with the highest points
    for (const type in totalPoints) {
      if (totalPoints[type] > maxPoints) {
        maxPoints = totalPoints[type];
        personalityType = type;
      }
    }

    // 👉 Make the personalityType available to the Download button
    window.userPersonalityType = personalityType;

    const personalityData = personalitiesData.descriptions[personalityType];

    //display none when result page is shown.
    progressContainer.style.display = 'none';
    document.getElementById('step-indicator').style.display = 'none';
    document.getElementById('question-container').style.display = 'none';
    document.getElementById('back-button').style.display = 'none';
    document.getElementById('answers').style.display = 'none';
    document.getElementById('result-container').style.display = 'block';
    document.getElementById('quiz-header').style.display = 'none';

    document.getElementById('result-header').innerHTML = `You are most similar to the ${capitalize(personalityData.animal)} 
		<span id="scrollTextHeader">(Scroll for more)</span>`;

    const total = getTotalPoints();
    const resultsContainer = document.getElementById('detailed-results');
    resultsContainer.innerHTML = '';

    // Sort personality types by percentage
    const sortedTypes = Object.keys(totalPoints).map(type => {
      const percentage = (totalPoints[type] / total) * 100;
      return { type, percentage };
    }).sort((a, b) => b.percentage - a.percentage);

    // Create buttons for each personality type
    let scaleFactor = 0;
    let count = 0;
    sortedTypes.forEach(({ type, percentage }) => {
      const animalName = personalitiesData.descriptions[type].animal;
      const activeSymbol = '<i class="fa-solid fa-eye"></i>';
      const inactiveSymbol = '';
      const click = '';

      const button = document.createElement('button');
      button.innerHTML = `${capitalize(animalName)}: ${percentage.toFixed(2)}% ${inactiveSymbol}`;

      button.onclick = () => {
        showPersonalityDetails(type);
        for (const btn of resultsContainer.children) {
          btn.classList.remove('active');
          btn.style.animation = 'none';
          btn.innerHTML = btn.innerHTML.replace(activeSymbol, inactiveSymbol);
          btn.innerHTML = btn.innerHTML.replace(click, inactiveSymbol);
        }
        button.classList.add('active');
        button.innerHTML = `${capitalize(animalName)}: ${percentage.toFixed(2)}% ${activeSymbol}`;
      };

      if (count === 1) {
        button.innerHTML = `${capitalize(animalName)}: ${percentage.toFixed(2)}% ${click}`;
        count = 2;
      }

      if (count === 0 && type === personalityType) {
        button.classList.add('active');
        button.innerHTML = `${capitalize(animalName)}: ${percentage.toFixed(2)}% ${activeSymbol}`;

        count = 1;
        scaleFactor = 100 / percentage;
        button.style.width = '165%';
      }
      else {
        const buttonWidth = Math.max(105 + (percentage * (scaleFactor || 1) * 0.6));
        button.style.width = `${buttonWidth}%`;
      }

      resultsContainer.appendChild(button);
    });

    const scrollDownText1 = document.getElementById('scroll-down-text1');
    const scrollDownText2 = document.getElementById('scroll-down-text');
    let scrollTextcount = 0;
    let scrollTextList = [scrollDownText1, scrollDownText2];

    scrollTextList.forEach(text => {
      if (!text) return;
      const rect = text.getBoundingClientRect();
      if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
        scrollTextcount++;
      }
      if (getComputedStyle(text).display === "none") {
        scrollTextcount--;
      }
    });

    const scrollTextHeader = document.getElementById('scrollTextHeader');

    if (scrollTextcount === 0 && scrollTextHeader) {
      scrollTextHeader.style.display = 'inline-block';
    } else if (scrollTextHeader) {
      scrollTextHeader.style.display = 'none';
    }

    const resultsPageContainer = document.getElementById('result-container');

    function onFirstScroll() {
      if (!scrollTextHeader) return;
      const currentDisplay = getComputedStyle(scrollTextHeader).display;
      if (resultsPageContainer.scrollTop > 0 && currentDisplay === "inline-block") {
        scrollTextHeader.style.display = 'none';
        resultsPageContainer.removeEventListener('scroll', onFirstScroll);
      }
    }

    resultsPageContainer.addEventListener('scroll', onFirstScroll);

    showPersonalityDetails(personalityType);

    // Save quiz result to the backend
    const currentDate = new Date().toISOString();
    const quizResult = {
      ResultId: Date.now().toString(),
      date: currentDate,
      personalityType: personalityType,
      saver: totalPoints.saver,
      lavish: totalPoints.lavish,
      investor: totalPoints.investor,
      hustler: totalPoints.hustler,
      risktaker: totalPoints["risk-taker"],
      defensive: totalPoints.defensive,
      shopper: totalPoints.shopper,
      indifferent: totalPoints.indifferent,
    };

    saveQuizResult(quizResult); // Call the new function to save the result
    saveResultToFirestore(quizResult);



    function saveQuizResult(quizResult) {
      fetch("/api/save-result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(quizResult)
      })
        .then(res => res.json())
        .then(data => console.log("✅ Result saved to backend:", data))
        .catch(err => console.error("❌ Error saving to backend:", err));
    }

    function saveResultToFirestore(quizResult) {
      const collectionName = "finlit_results"; // New Firestore collection
      const docRef = db.collection(collectionName).doc(quizResult.personalityType);

      docRef.get().then((doc) => {
        if (doc.exists) {
          return docRef.update({
            resultCount: firebase.firestore.FieldValue.increment(1)
          });
        } else {
          return docRef.set({
            personalityType: quizResult.personalityType,
            resultCount: 1
          });
        }
      }).then(() => {
        console.log(`✅ Firestore saved to ${collectionName}: ${quizResult.personalityType}`);
      }).catch((error) => {
        console.error("❌ Firestore error:", error);
      });
    }

    // comment section code
    // const userCommentArea = document.getElementById('userInput');
    // const inappropriateWords = obscenity['badWords'];
    // const inappropriateEmojis = obscenity['badEmojis'];

    // This checks for the custom profanity (words & emojis) created in profanity.js
    // function containsCustomProfanity(text) {
    // 	const words = text.toLowerCase().split(/\s+/);
    // 	const chars = Array.from(text);
    // 	const foundWord = words.some(word => inappropriateWords[word] || inappropriateEmojis[word]);
    // 	const foundEmoji = chars.some(char => inappropriateEmojis[char]);
    // 	return foundEmoji || foundWord;
    // }

    // const response = await fetch('https://mpq-backend.onrender.com/submit-feedback')

    document.getElementById('feedback-form').addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent default form submission

      const loadingSpinner = document.querySelector('#feedback-form #loadingSpinner');
      const feedbackForm = document.getElementById('feedback-form');
      const feedbackPopup = document.getElementById('feedback-popup');
      // const question1 = document.querySelector('#feedback-form for=recommendSurvey');
      // const question2 = document.querySelector('#feedback-form for=recommendSurvey');

      // comment section code for later
      // const unCleanComment = userCommentArea.value.trim();
      // const cleanedComment = profanityCleaner.clean(unCleanComment);

      // if (unCleanComment === "") {
      // 	console.log("User didn't comment anything.");
      // }

      // const foundCustomProfanity = containsCustomProfanity(unCleanComment);
      // const foundLibraryProfanity = cleanedComment !== unCleanComment;

      // if (foundLibraryProfanity || foundCustomProfanity) {
      // 	console.warn('Profanity detected!!');
      // 	catchedBadInput = false;
      // } else {
      // 	console.log(cleanedComment);
      // }

      const feedbackData = {
        name: "anonymous",
        question1: document.querySelector('label[for="recommendSurvey"]').textContent,
        // shareHabits: event.target.shareHabits.value,
        answer1: event.target.recommendSurvey.value,
        question2: document.querySelector('label[for="resultsHelpful"]').textContent,
        // resultsAccurate: event.target.resultsAccurate.value,
        answer2: event.target.resultsHelpful.value,
        company: document.querySelector('input[name="company"]').value,
        // practicalSteps: event.target.practicalSteps.value,
        // timestamp: currentDate  // Add the current timestamp to the feedback data
      };

      try {
        Array.from(feedbackForm.children).forEach(child => {
          if (child.id !== "loadingSpinner") {
            child.style.display = "none";
          }
        })

        feedbackPopup.classList.add('load-added');
        loadingSpinner.classList.toggle('hidden');
        if (feedbackData.answer1 === '' || feedbackData.answer2 === '') {
          throw new Error("need to answer both questions!")
        }
        const response = await fetch('https://mpq-backend.onrender.com/submit-feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedbackData),
        });

        const result = await response.json();

        if (result.status === 'success') {
          Array.from(feedbackForm.children).forEach(child => {
            if (child.name === "company") {
              return;
            } else if (child.id !== "loadingSpinner") {
              child.style.display = "";
            }
          })
          feedbackPopup.classList.remove('load-added');
          loadingSpinner.classList.toggle('hidden');
          alert(result.message);
        } else {
          Array.from(feedbackForm.children).forEach(child => {
            if (child.name === "company") {
              return;
            } else if (child.id !== "loadingSpinner") {
              child.style.display = "";
            }
          })
          feedbackPopup.classList.remove('load-added');
          loadingSpinner.classList.toggle('hidden');
          alert(result.message);
        }
      } catch (error) {
        Array.from(feedbackForm.children).forEach(child => {
          if (child.name === "company") {
            return;
          } else if (child.id !== "loadingSpinner") {
            child.style.display = "";
          }
        })
        feedbackPopup.classList.remove('load-added');
        loadingSpinner.classList.toggle('hidden');
        alert(`Failed to submit feedback. ${error}`);
      }
    });

    document.getElementById('emailBtn').addEventListener('click', async (event) => {
      event.preventDefault();

      const emailInput = document.getElementById('email-input').value.trim();
      // console.log(`Email Input: ${emailInput}`);
      const userPersonalityType = personalityType || "saver";
      // Make sure the path and extension match your files exactly
      const fileName = `${userPersonalityType}.jpg`;

      const emailData = {
        input: emailInput,
        animalResultFile: fileName,
      };

      // emailData[]
      // const emailInput = document.getElementById('email-input').value.trim();

      if (validator.isEmail(emailInput)) {
        console.log(`Valid email: ${emailInput}`);
        try {
          const response = await fetch('http://localhost:5000/send-email', {
            // const response = await fetch('https://mpq-backend.onrender.com/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ emailData }),
          });

          if (response.ok) {
            alert('Email sent successfully!');
          } else {
            alert('Failed to send email.');
          }
        } catch (error) {
          console.error('Error sending email:', error);
          alert('Error sending email.');
        }
      } else {
        alert(`Invalid email!! : ${emailInput}`);
      }
    });

    // pushpa starts
    function showPersonalityDetails(personalityType) {
      const data = personalitiesData.descriptions[personalityType];
      if (!data) return;

      document.getElementById("descriptionText").textContent = data.description;
      injectList("advantagesList", data.advantages);
      injectList("disadvantagesList", data.disadvantages);
      injectList("motivatorsList", data.motivators);
      injectList("demotivatorsList", data.demotivators);

      const blueAdvantage = document.querySelector('.advantages.card.blue');
      const animalIconSymbol = document.querySelector('.animal_assets');

      // Create a resize observer
      const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
          const height = entry.target.getBoundingClientRect().height;
          animalIconSymbol.style.top = (height + 5) + 'px';
        }
      });

      if (blueAdvantage && animalIconSymbol) {
        observer.observe(blueAdvantage);
      }
      const resultImage = document.getElementById("polaroid-animal-image");
      const imageMap = {
        "saver": "/src/assets/animal_pngs/polaroid/past_squirrel.png",
        "lavish": "/src/assets/animal_pngs/polaroid/past_poodle.png",
        "investor": "/src/assets/animal_pngs/polaroid/past_owl.png",
        "hustler": "/src/assets/animal_pngs/polaroid/past_bee.png",
        "risk-taker": "/src/assets/animal_pngs/polaroid/past_rabbit.png",
        "defensive": "/src/assets/animal_pngs/polaroid/past_armadillo.png",
        "shopper": "/src/assets/animal_pngs/polaroid/past_octopus.png",
        "indifferent": "/src/assets/animal_pngs/polaroid/past_panda.png"
      };

      if (resultImage) {
        resultImage.src = imageMap[personalityType] || "assets/futuresqu.png";
        resultImage.alt = data.animal;
      }

      // Update large image in desc-container dynamically
      const futureAnimalImg = document.querySelector(".desc-container .topsection .image img");
      if (futureAnimalImg) {
        const capitalizedAnimal = data.animal.charAt(0).toUpperCase() + data.animal.slice(1); // e.g., "Squirrel"
        futureAnimalImg.src = `/src/assets/animal_pngs/futureAnimal_Profiles/Future_${capitalizedAnimal}.png`;
        futureAnimalImg.alt = `Future ${capitalizedAnimal}`;
      }

      // for the animal icons
      const personalityIconImg = document.getElementById("personality-icon");
      const iconMap = {
        "saver": "acorn.png",
        "lavish": "diamond.png",
        "investor": "feather.png",
        "hustler": "beehive.png",
        "risk-taker": "carrot.png",
        "defensive": "Piggy Bank.png",
        "shopper": "Seasell.png",
        "indifferent": "panda paw.png"
      };

      if (personalityIconImg && iconMap[personalityType]) {
        personalityIconImg.src = `/src/assets/animal_pngs/animal_assets/${iconMap[personalityType]}`;
        personalityIconImg.alt = data.animal;
      }
    }

    function injectList(id, items) {
      const ul = document.getElementById(id);
      if (!ul) return;
      ul.innerHTML = "";
      items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        ul.appendChild(li);
      });
    }
    // pushpa ends
  }
  // Gets collective points
  function getTotalPoints() {
    return Object.values(totalPoints).reduce((sum, points) => sum + points, 0);
  }

  document.getElementById('send-button').addEventListener('click', function () {
    // button that lets user email their results or download their results
    console.log("Send button clicked!");
    let sendResultsPopup = document.getElementById('resultSending-popup');
    const sendWindowOverlay = document.querySelector('.sendWindowOverlay');

    sendResultsPopup.classList.add('active');
    sendWindowOverlay.classList.add('visible');
    document.documentElement.style.overflow = 'hidden'; // html
    document.body.style.overflow = 'hidden'; // body
  });

  document.getElementById('feedback-button').addEventListener('click', function () {
    let feedbackPopup = document.getElementById('feedback-popup');
    const overlay = document.querySelector('.overlay');

    feedbackPopup.classList.add('active');
    overlay.classList.add('visible');
    document.documentElement.style.overflow = 'hidden'; // html
    document.body.style.overflow = 'hidden'; // body
  });

  document.addEventListener('click', function (event) {
    let feedbackPopup = document.getElementById('feedback-popup');
    const overlay = document.querySelector('.overlay');
    let nextStepsPopup = document.getElementById('next-steps-popup');
    const nextStepsOverlay = document.querySelector('.nextStepsOverlay');
    let sendResultsPopup = document.getElementById('resultSending-popup');
    const sendWindowOverlay = document.querySelector('.sendWindowOverlay');

    if (!feedbackPopup.contains(event.target) && event.target.id !== 'feedback-button') {
      feedbackPopup.classList.remove('active');
      overlay.classList.remove('visible');
      updateScrollLock();
      // document.documentElement.style.overflow = 'auto'; // html
      // document.body.style.overflow = 'auto'; // body
    }

    if (!nextStepsPopup.contains(event.target) && event.target.id !== 'next-steps-button') {
      nextStepsPopup.style.display = 'none';
      nextStepsOverlay.style.display = 'none';
      updateScrollLock();
      // document.documentElement.style.overflow = 'auto'; // html
      // document.body.style.overflow = 'auto'; // body
    }

    if (!sendResultsPopup.contains(event.target) && event.target.id !== 'send-button') {
      sendResultsPopup.classList.remove('active');
      sendWindowOverlay.classList.remove('visible');
      updateScrollLock();
      // document.documentElement.style.overflow = 'auto'; // html
      // document.body.style.overflow = 'auto'; // body
    }
  });

  document.getElementById('feedback-closeXButton').addEventListener('click', function () {
    let feedbackPopup = document.getElementById('feedback-popup');
    const overlay = document.querySelector('.overlay');

    feedbackPopup.classList.remove('active');
    overlay.classList.remove('visible');
    updateScrollLock();
    // document.documentElement.style.overflow = 'auto'; // html
    // document.body.style.overflow = 'auto'; // body
  });

  document.getElementById('send-CloseXButton').addEventListener('click', function () {
    let sendResultsPopup = document.getElementById('resultSending-popup');
    const sendWindowOverlay = document.querySelector('.sendWindowOverlay');

    sendResultsPopup.classList.remove('active');
    sendWindowOverlay.classList.remove('visible');
    updateScrollLock();
    // document.documentElement.style.overflow = 'auto'; // html
    // document.body.style.overflow = 'auto'; // body
  });

  // document.getElementById('userCommentBtn').addEventListener('click', function () {
  //   document.getElementById('userInput').style.display = 'block';
  //   document.getElementById('userCommentBtn').style.display = 'none';
  // });

  document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', () => {
      const selectedValue = select.value;
      if (selectedValue !== "") {
        select.style.backgroundColor = '#FEDB04';
      }
    });
  });

  // Restarts the quiz
  function restartQuiz() {
    currentQuestionIndex = 0;
    totalPoints = {
      "saver": 0,
      "lavish": 0,
      "investor": 0,
      "hustler": 0,
      "risk-taker": 0,
      "defensive": 0,
      "shopper": 0,
      "indifferent": 0
    };
    selectedAnswers = [];
    progressBar.style.width = '0%';
    progressContainer.style.display = 'block';
    // Puneeth - 'block' was overriding CSS flex layout, misaligning answer buttons after restart
    // document.getElementById('answers').style.display = 'block';
    document.getElementById('answers').style.display = 'flex';
    document.getElementById('question-container').style.display = 'block';
    document.getElementById('result-container').style.display = 'none';
    loadQuestion(currentQuestionIndex);
    // Puneeth - location.reload() was causing a flash to home screen on restart
    // location.reload();
    // now manually showing welcome screen instead of reloading the page
    quizContainer.style.display = 'none';
    welcomeScreen.style.display = 'flex';
    document.querySelectorAll('.answer-button').forEach(btn => btn.classList.remove('active'));
  }

  // Keyboard shortcut to instantly finish quiz
  let pressedKeys = {};
  document.addEventListener('keydown', (event) => {
    pressedKeys[event.key] = true;
    // Check for specific key combinations
    if (pressedKeys['s'] && pressedKeys['k']) {
      if (welcomeScreen.style.display !== 'none') {
        welcomeScreen.style.display = 'none';
        quizContainer.style.display = 'flex';
      }
      totalPoints = {
        "saver": 10,
        "lavish": 7,
        "investor": 5,
        "hustler": 4,
        "risk-taker": 3,
        "defensive": 2,
        "shopper": 1,
        "indifferent": 1
      };
      showResults();
    }
  });

  document.addEventListener('keyup', (event) => {
    delete pressedKeys[event.key];
  });
});
// Utility
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
