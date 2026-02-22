const CHARS = {
  upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower:   'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

function getCharset() {
  let charset = '';
  if (document.getElementById('uppercase').checked) charset += CHARS.upper;
  if (document.getElementById('lowercase').checked) charset += CHARS.lower;
  if (document.getElementById('numbers').checked)   charset += CHARS.numbers;
  if (document.getElementById('symbols').checked)   charset += CHARS.symbols;
  return charset || null;
}

function generate() {
  const charset = getCharset();
  if (!charset) {
    document.getElementById('password').placeholder = 'Select at least one character type';
    return;
  }

  const len = parseInt(document.getElementById('length').value, 10);
  const values = crypto.getRandomValues(new Uint32Array(len));
  const password = Array.from(values, v => charset[v % charset.length]).join('');

  document.getElementById('password').value = password;
  updateStrength(password);
}

function updateStrength(pwd) {
  let score = 0;
  if (pwd.length >= 20) score += 2;
  else if (pwd.length >= 12) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[a-z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 2;

  const fill  = document.getElementById('strength-fill');
  const label = document.getElementById('strength-label');

  fill.className = 'strength-fill';
  if (score <= 2) {
    fill.classList.add('weak');
    label.textContent = 'Weak';
  } else if (score <= 4) {
    fill.classList.add('medium');
    label.textContent = 'Medium';
  } else {
    fill.classList.add('strong');
    label.textContent = 'Strong';
  }
}

function copyPassword() {
  const pwd = document.getElementById('password').value;
  if (!pwd) return;

  // Clipboard API requires HTTPS or localhost; fallback for http
  if (navigator.clipboard && location.protocol !== 'http:') {
    navigator.clipboard.writeText(pwd).then(() => flashCopy());
  } else {
    // Fallback: textarea select
    const ta = document.createElement('textarea');
    ta.value = pwd;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    flashCopy();
  }
}

function flashCopy() {
  const btn = document.getElementById('copy');
  const orig = btn.textContent;
  btn.textContent = 'Copied!';
  setTimeout(() => { btn.textContent = orig; }, 1500);
}

// Prevent all checkboxes from being deselected simultaneously
function guardCheckboxes(changed) {
  const boxes = ['uppercase', 'lowercase', 'numbers', 'symbols'];
  const anyChecked = boxes.some(id => document.getElementById(id).checked);
  if (!anyChecked) {
    document.getElementById(changed).checked = true;
  }
}

document.getElementById('generate').addEventListener('click', generate);
document.getElementById('copy').addEventListener('click', copyPassword);

document.getElementById('length').addEventListener('input', function () {
  document.getElementById('length-display').textContent = this.value;
});

['uppercase', 'lowercase', 'numbers', 'symbols'].forEach(id => {
  document.getElementById(id).addEventListener('change', () => guardCheckboxes(id));
});

document.addEventListener('DOMContentLoaded', generate);
