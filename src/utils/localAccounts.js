const accountsKey = 'umbra.accounts.v1'
const sessionKey = 'umbra.session.v1'
const iterations = 100000
const bytesToHex = bytes => Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
const normalizeEmail = email => email.trim().toLocaleLowerCase('es')

async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations, hash: 'SHA-256' }, key, 256)
  return bytesToHex(new Uint8Array(bits))
}

async function recoveryHash(code) {
  return bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code.trim().toUpperCase()))))
}

function accounts(storage) {
  const saved = JSON.parse(storage.getItem(accountsKey) || '[]')
  if (!Array.isArray(saved)) throw new Error('No se pueden leer las cuentas de este navegador.')
  return saved
}

export function readSession(storage = localStorage, temporary = sessionStorage) {
  const id = temporary.getItem(sessionKey) || storage.getItem(sessionKey)
  const account = accounts(storage).find(item => item.id === id)
  return account ? { id: account.id, name: account.name, email: account.email } : null
}

export async function registerAccount({ name, email, password }, storage = localStorage) {
  const list = accounts(storage)
  const normalizedEmail = normalizeEmail(email)
  if (list.some(account => account.email === normalizedEmail)) throw new Error('Ya existe una cuenta con este correo en este navegador.')
  const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)))
  const recoveryCode = bytesToHex(crypto.getRandomValues(new Uint8Array(16))).toUpperCase()
  const account = { id: crypto.randomUUID(), name: name.trim(), email: normalizedEmail, salt, passwordHash: await passwordHash(password, salt), recoveryHash: await recoveryHash(recoveryCode) }
  storage.setItem(accountsKey, JSON.stringify([...list, account]))
  return recoveryCode
}

export async function loginAccount({ email, password, remember }, storage = localStorage, temporary = sessionStorage) {
  const account = accounts(storage).find(item => item.email === normalizeEmail(email))
  if (!account || await passwordHash(password, account.salt) !== account.passwordHash) throw new Error('El correo o la contraseña no coinciden con una cuenta de este navegador.')
  const target = remember ? storage : temporary
  target.setItem(sessionKey, account.id)
  ;(remember ? temporary : storage).removeItem(sessionKey)
  return { id: account.id, name: account.name, email: account.email }
}

export function logoutAccount(storage = localStorage, temporary = sessionStorage) {
  storage.removeItem(sessionKey)
  temporary.removeItem(sessionKey)
}

export async function recoverAccount({ email, recoveryCode, password }, storage = localStorage, temporary = sessionStorage) {
  const list = accounts(storage)
  const account = list.find(item => item.email === normalizeEmail(email))
  if (!account || await recoveryHash(recoveryCode) !== account.recoveryHash) throw new Error('El correo o el código de recuperación no son correctos.')
  const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)))
  const updated = { ...account, salt, passwordHash: await passwordHash(password, salt) }
  storage.setItem(accountsKey, JSON.stringify(list.map(item => item.id === account.id ? updated : item)))
  if (storage.getItem(sessionKey) === account.id) storage.removeItem(sessionKey)
  if (temporary.getItem(sessionKey) === account.id) temporary.removeItem(sessionKey)
}
