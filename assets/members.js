// Members-only directory: fetches the encrypted member list and decrypts it in the
// browser with the members passphrase (PBKDF2-SHA256 -> AES-256-GCM). Nothing readable
// is published without the passphrase.
(function () {
  const form = document.getElementById('unlock');
  const input = document.getElementById('passphrase');
  const err = document.getElementById('unlock-error');
  const lock = document.getElementById('lock');
  const out = document.getElementById('members-out');
  const KEY = 'amps-members-pass';

  async function decrypt(pass) {
    const res = await fetch('members.enc.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('unavailable');
    const box = await res.json();
    const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: b64(box.salt), iterations: box.iterations, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(box.iv) }, key, b64(box.data));
    return new TextDecoder().decode(plain);
  }

  async function unlock(pass, remember) {
    try {
      out.innerHTML = await decrypt(pass);
      lock.hidden = true;
      out.hidden = false;
      if (remember) try { sessionStorage.setItem(KEY, pass); } catch (e) {}
      window.AMPS.wireFilter(out);
    } catch (e) {
      try { sessionStorage.removeItem(KEY); } catch (e2) {}
      err.textContent = e.message === 'unavailable'
        ? 'The members directory has not been published yet.'
        : 'That passphrase is not correct.';
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    err.textContent = '';
    unlock(input.value, true);
  });

  let saved = null;
  try { saved = sessionStorage.getItem(KEY); } catch (e) {}
  if (saved) unlock(saved, false);
})();
