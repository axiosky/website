/* ============================================================
   REQUEST PILOT — SMART FORM VALIDATION
   ============================================================ */

// ── Blocked personal/free email domains ──────────────────────
const PERSONAL_DOMAINS = new Set([
  'gmail.com','yahoo.com','yahoo.co.uk','yahoo.in','yahoo.co.in',
  'hotmail.com','hotmail.co.uk','hotmail.in','outlook.com','live.com',
  'msn.com','icloud.com','me.com','mac.com','aol.com','protonmail.com',
  'proton.me','tutanota.com','zoho.com','yandex.com','yandex.ru',
  'mail.com','gmx.com','gmx.net','inbox.com','fastmail.com',
  'fastmail.fm','hey.com','pm.me','rocketmail.com','rediffmail.com',
  'ymail.com','bellsouth.net','comcast.net','verizon.net','sbcglobal.net',
  'att.net','cox.net','earthlink.net','optonline.net','163.com','126.com',
  'qq.com','sina.com','naver.com','daum.net','hanmail.net'
]);

// ── Valid countries (lowercase for comparison) ────────────────
const VALID_COUNTRIES = new Set([
  'afghanistan','albania','algeria','andorra','angola','antigua and barbuda',
  'argentina','armenia','australia','austria','azerbaijan','bahamas','bahrain',
  'bangladesh','barbados','belarus','belgium','belize','benin','bhutan',
  'bolivia','bosnia and herzegovina','botswana','brazil','brunei','bulgaria',
  'burkina faso','burundi','cabo verde','cambodia','cameroon','canada',
  'central african republic','chad','chile','china','colombia','comoros',
  'costa rica','croatia','cuba','cyprus','czechia','czech republic',
  'denmark','djibouti','dominica','dominican republic','ecuador','egypt',
  'el salvador','equatorial guinea','eritrea','estonia','eswatini','ethiopia',
  'fiji','finland','france','gabon','gambia','georgia','germany','ghana',
  'greece','grenada','guatemala','guinea','guinea-bissau','guyana','haiti',
  'honduras','hungary','iceland','india','indonesia','iran','iraq','ireland','italy','jamaica','japan','jordan','kazakhstan','kenya','kiribati',
  'kuwait','kyrgyzstan','laos','latvia','lebanon','lesotho','liberia','libya',
  'liechtenstein','lithuania','luxembourg','madagascar','malawi','malaysia',
  'maldives','mali','malta','marshall islands','mauritania','mauritius',
  'mexico','micronesia','moldova','monaco','mongolia','montenegro','morocco',
  'mozambique','myanmar','namibia','nauru','nepal','netherlands','new zealand',
  'nicaragua','niger','nigeria','north korea','north macedonia','norway',
  'oman','pakistan','palau','palestine','panama','papua new guinea','paraguay',
  'peru','philippines','poland','portugal','qatar','romania','russia','rwanda',
  'saint kitts and nevis','saint lucia','saint vincent and the grenadines',
  'samoa','san marino','sao tome and principe','saudi arabia','senegal',
  'serbia','seychelles','sierra leone','singapore','slovakia','slovenia',
  'solomon islands','somalia','south africa','south korea','south sudan',
  'spain','sri lanka','sudan','suriname','sweden','switzerland','syria',
  'taiwan','tajikistan','tanzania','thailand','timor-leste','togo','tonga',
  'trinidad and tobago','tunisia','turkey','turkmenistan','tuvalu','uganda',
  'ukraine','united arab emirates','uae','united kingdom','uk','england',
  'scotland','wales','northern ireland','united states','usa','us',
  'united states of america','america','uruguay','uzbekistan','vanuatu',
  'venezuela','vietnam','yemen','zambia','zimbabwe','hong kong','macau',
  'puerto rico','kosovo','republic of korea','republic of ireland',
  'democratic republic of the congo','dr congo','congo','ivory coast',
  "cote d'ivoire",'north korea','south korea','republic of china',
  'people\'s republic of china','great britain','britain'
]);

// ── Helpers ───────────────────────────────────────────────────

function showError(field, msg) {
  clearError(field);
  field.classList.add('input-error');
  const err = document.createElement('span');
  err.className = 'field-error';
  err.setAttribute('role', 'alert');
  err.textContent = msg;
  field.parentNode.appendChild(err);
}

function clearError(field) {
  field.classList.remove('input-error');
  const existing = field.parentNode.querySelector('.field-error');
  if (existing) existing.remove();
}

// Checks if a name/title looks like keyboard mashing:
// - must contain only valid name characters
// - no digit sequences
// - no run of 3+ identical letters (e.g. "aaa")
// - ratio of unique letters to total letters must be reasonable
// - no run of 4+ consecutive consonants (catches "hbfsdfh")
function isPlausibleName(val) {
  const v = val.trim();
  if (v.length < 2) return false;
  // Only letters (including accented), spaces, hyphens, apostrophes, dots
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ'\-. ]+$/.test(v)) return false;
  // No triple-repeat of same char
  if (/(.)\1{2,}/i.test(v)) return false;
  const letters = v.replace(/[^A-Za-z]/g, '').toLowerCase();
  if (letters.length < 2) return false;
  // Unique char ratio — mash strings have very few unique chars vs length
  const uniqueChars = new Set(letters).size;
  if (letters.length > 4 && uniqueChars / letters.length < 0.4) return false;
  // Consecutive consonants — real names rarely exceed 4 in a row
  const consonants = /[bcdfghjklmnpqrstvwxyz]{5,}/i;
  if (consonants.test(letters)) return false;
  return true;
}

// Job title: same mash check but slightly looser (allows numbers like "VP of L1 Support")
function isPlausibleTitle(val) {
  const v = val.trim();
  if (v.length < 2) return false;
  if (/(.)\1{3,}/i.test(v)) return false;
  const letters = v.replace(/[^A-Za-z]/g, '').toLowerCase();
  if (letters.length > 5) {
    const uniqueChars = new Set(letters).size;
    if (uniqueChars / letters.length < 0.35) return false;
    if (/[bcdfghjklmnpqrstvwxyz]{6,}/i.test(letters)) return false;
  }
  return true;
}

// Work email: valid format + no personal domains
function validateWorkEmail(val) {
  const v = val.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
    return 'Please enter a valid email address.';
  }
  const domain = v.split('@')[1];
  if (PERSONAL_DOMAINS.has(domain)) {
    return 'Please use your work email address (not Gmail, Yahoo, etc.).';
  }
  return null;
}

// Country: normalise and check against list
function isValidCountry(val) {
  const v = val.trim().toLowerCase().replace(/\s+/g, ' ');
  return VALID_COUNTRIES.has(v);
}

// Sector other: just basic mash check (free text but not gibberish)
function isPlausibleSector(val) {
  const v = val.trim();
  if (v.length < 2) return false;
  if (/(.)\1{3,}/i.test(v)) return false;
  const letters = v.replace(/[^A-Za-z]/g, '').toLowerCase();
  if (letters.length > 4) {
    if (new Set(letters).size / letters.length < 0.35) return false;
    if (/[bcdfghjklmnpqrstvwxyz]{6,}/i.test(letters)) return false;
  }
  return true;
}

// ── "Other" reveal logic ──────────────────────────────────────

function setupSelectReveal(selectId, wrapId, inputId) {
  const select = document.getElementById(selectId);
  const wrap   = document.getElementById(wrapId);
  const input  = document.getElementById(inputId);
  if (!select || !wrap || !input) return;

  function toggle() {
    const show = select.value === 'other';
    wrap.style.display = show ? 'block' : 'none';
    input.required = show;
    if (!show) { input.value = ''; clearError(input); }
  }
  select.addEventListener('change', toggle);
  toggle();
}

function setupCheckboxReveal(checkboxId, wrapId, inputId) {
  const cb    = document.getElementById(checkboxId);
  const wrap  = document.getElementById(wrapId);
  const input = document.getElementById(inputId);
  if (!cb || !wrap || !input) return;

  function toggle() {
    wrap.style.display = cb.checked ? 'block' : 'none';
    input.required = cb.checked;
    if (!cb.checked) { input.value = ''; clearError(input); }
  }
  cb.addEventListener('change', toggle);
  toggle();
}

// ── Live blur validation ──────────────────────────────────────

function attachLiveValidation() {

  // First name
  const firstName = document.getElementById('firstName');
  if (firstName) {
    firstName.addEventListener('blur', () => {
      if (!firstName.value.trim()) return;
      if (!isPlausibleName(firstName.value))
        showError(firstName, 'Please enter a valid first name.');
      else clearError(firstName);
    });
    firstName.addEventListener('input', () => {
      if (firstName.classList.contains('input-error') && isPlausibleName(firstName.value))
        clearError(firstName);
    });
  }

  // Last name
  const lastName = document.getElementById('lastName');
  if (lastName) {
    lastName.addEventListener('blur', () => {
      if (!lastName.value.trim()) return;
      if (!isPlausibleName(lastName.value))
        showError(lastName, 'Please enter a valid last name.');
      else clearError(lastName);
    });
    lastName.addEventListener('input', () => {
      if (lastName.classList.contains('input-error') && isPlausibleName(lastName.value))
        clearError(lastName);
    });
  }

  // Job title
  const jobTitle = document.getElementById('jobTitle');
  if (jobTitle) {
    jobTitle.addEventListener('blur', () => {
      if (!jobTitle.value.trim()) return;
      if (!isPlausibleTitle(jobTitle.value))
        showError(jobTitle, 'Please enter a valid job title.');
      else clearError(jobTitle);
    });
    jobTitle.addEventListener('input', () => {
      if (jobTitle.classList.contains('input-error') && isPlausibleTitle(jobTitle.value))
        clearError(jobTitle);
    });
  }

  // Work email
  const workEmail = document.getElementById('workEmail');
  if (workEmail) {
    workEmail.addEventListener('blur', () => {
      if (!workEmail.value.trim()) return;
      const err = validateWorkEmail(workEmail.value);
      if (err) showError(workEmail, err);
      else clearError(workEmail);
    });
    workEmail.addEventListener('input', () => {
      if (workEmail.classList.contains('input-error') && !validateWorkEmail(workEmail.value))
        clearError(workEmail);
    });
  }

  // Country other
  const countryOther = document.getElementById('countryOther');
  if (countryOther) {
    countryOther.addEventListener('blur', () => {
      if (!countryOther.value.trim()) return;
      if (!isValidCountry(countryOther.value))
        showError(countryOther, 'Please enter a recognised country name.');
      else clearError(countryOther);
    });
    countryOther.addEventListener('input', () => {
      if (countryOther.classList.contains('input-error') && isValidCountry(countryOther.value))
        clearError(countryOther);
    });
  }

  // Sector other
  const sectorOther = document.getElementById('sectorOther');
  if (sectorOther) {
    sectorOther.addEventListener('blur', () => {
      if (!sectorOther.value.trim()) return;
      if (!isPlausibleSector(sectorOther.value))
        showError(sectorOther, 'Please enter a valid sector or industry name.');
      else clearError(sectorOther);
    });
    sectorOther.addEventListener('input', () => {
      if (sectorOther.classList.contains('input-error') && isPlausibleSector(sectorOther.value))
        clearError(sectorOther);
    });
  }
}

// ── Submit validation ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // Wire up "Other" reveals
  setupSelectReveal('country', 'countryOtherWrap', 'countryOther');
  setupSelectReveal('sector',  'sectorOtherWrap',  'sectorOther');
  setupCheckboxReveal('help5', 'helpOtherWrap', 'helpOther');

  // Attach live feedback
  attachLiveValidation();

  // Submit handler
  document.getElementById('pilotForm').addEventListener('submit', function(e) {
    let hasError = false;

    // Helper to block submit and show error
    function fail(field, msg) {
      showError(field, msg);
      if (!hasError) { field.focus(); hasError = true; }
    }

    // First name
    const firstName = document.getElementById('firstName');
    if (!firstName.value.trim()) {
      fail(firstName, 'First name is required.'); 
    } else if (!isPlausibleName(firstName.value)) {
      fail(firstName, 'Please enter a valid first name.');
    }

    // Last name
    const lastName = document.getElementById('lastName');
    if (!lastName.value.trim()) {
      fail(lastName, 'Last name is required.');
    } else if (!isPlausibleName(lastName.value)) {
      fail(lastName, 'Please enter a valid last name.');
    }

    // Job title
    const jobTitle = document.getElementById('jobTitle');
    if (!jobTitle.value.trim()) {
      fail(jobTitle, 'Job title is required.');
    } else if (!isPlausibleTitle(jobTitle.value)) {
      fail(jobTitle, 'Please enter a valid job title.');
    }

    // Work email
    const workEmail = document.getElementById('workEmail');
    const emailErr = validateWorkEmail(workEmail.value);
    if (!workEmail.value.trim()) {
      fail(workEmail, 'Work email is required.');
    } else if (emailErr) {
      fail(workEmail, emailErr);
    }

    // Country other
    const country = document.getElementById('country');
    const countryOther = document.getElementById('countryOther');
    if (country.value === 'other') {
      if (!countryOther.value.trim()) {
        fail(countryOther, 'Please enter your country.');
      } else if (!isValidCountry(countryOther.value)) {
        fail(countryOther, 'Please enter a recognised country name.');
      }
    }

    // Sector other
    const sector = document.getElementById('sector');
    const sectorOther = document.getElementById('sectorOther');
    if (sector.value === 'other') {
      if (!sectorOther.value.trim()) {
        fail(sectorOther, 'Please specify your sector.');
      } else if (!isPlausibleSector(sectorOther.value)) {
        fail(sectorOther, 'Please enter a valid sector or industry name.');
      }
    }

    // At least one help checkbox
    const checkboxes = document.querySelectorAll('input[name="help"]:checked');
    if (checkboxes.length === 0) {
      const helpGroup = document.querySelector('.checkbox-group');
      // Show error near the group label
      const label = helpGroup.closest('.form-group').querySelector('label');
      let existing = helpGroup.querySelector('.field-error');
      if (!existing) {
        const err = document.createElement('span');
        err.className = 'field-error';
        err.setAttribute('role', 'alert');
        err.textContent = 'Please select at least one option.';
        helpGroup.insertAdjacentElement('beforebegin', err);
      }
      if (!hasError) { helpGroup.scrollIntoView({ behavior: 'smooth', block: 'center' }); hasError = true; }
    }

    // Help other text
    const help5 = document.getElementById('help5');
    const helpOther = document.getElementById('helpOther');
    if (help5 && help5.checked && helpOther && !helpOther.value.trim()) {
      fail(helpOther, 'Please describe what you need help with.');
    }

    // If there are errors, stop everything
    if (hasError) {
      e.preventDefault();
    } else {
      // THE FIX: Take control of the form submission
      e.preventDefault(); // Stop Netlify's clunky default routing
      
      const form = document.getElementById('pilotForm');
      const formData = new FormData(form);
      
      // Submit the data silently in the background
      fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(formData).toString()
      })
      .then(() => {
          // Success! Manually force the browser to the exact Thank You page
          window.location.href = "thank-you.html"; 
      })
      .catch((error) => {
          console.error('Submission failed:', error);
          alert('There was an issue submitting your request. Please try again.');
      });
    }
  });
});
