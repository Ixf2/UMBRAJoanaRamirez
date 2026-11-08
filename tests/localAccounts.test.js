import assert from 'node:assert/strict'
import test from 'node:test'
import { loginAccount, logoutAccount, readSession, recoverAccount, registerAccount } from '../src/utils/localAccounts.js'

function memoryStorage() {
  const data = new Map()
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) }
}

test('registro, verificación de contraseña, sesiones temporales y Recordarme', async () => {
  const storage = memoryStorage()
  const temporary = memoryStorage()
  const data = { name: 'Elara', email: 'Elara@Umbra.es', password: 'Historia1!' }
  const code = await registerAccount(data, storage)
  assert.equal(code.length, 32)
  const serialized = storage.getItem('umbra.accounts.v1')
  assert.ok(!serialized.includes(data.password))
  assert.ok(!serialized.includes(code))
  await assert.rejects(registerAccount({ ...data, email: 'elara@umbra.es' }, storage), /Ya existe/)
  await assert.rejects(loginAccount({ ...data, password: 'incorrecta' }, storage, temporary), /no coinciden/)
  const user = await loginAccount(data, storage, temporary)
  assert.equal(user.name, 'Elara')
  assert.deepEqual(readSession(storage, temporary), user)
  assert.equal(readSession(storage, memoryStorage()), null)
  await loginAccount({ ...data, remember: true }, storage, temporary)
  assert.deepEqual(readSession(storage, memoryStorage()), user)
  assert.equal(temporary.getItem('umbra.session.v1'), null)
  await loginAccount({ ...data, remember: false }, storage, temporary)
  assert.equal(storage.getItem('umbra.session.v1'), null)
  logoutAccount(storage, temporary)
  assert.equal(readSession(storage, temporary), null)
})

test('recuperación requiere el código y cambia la contraseña conservando la identidad', async () => {
  const storage = memoryStorage()
  const temporary = memoryStorage()
  const data = { name: 'Kael', email: 'kael@umbra.es', password: 'Antigua1!' }
  const code = await registerAccount(data, storage)
  const original = await loginAccount({ ...data, remember: true }, storage, temporary)
  await assert.rejects(recoverAccount({ ...data, recoveryCode: 'incorrecto' }, storage, temporary), /no son correctos/)
  const changed = { ...data, password: 'OtraClave2!' }
  await recoverAccount({ ...changed, recoveryCode: code.toLowerCase() }, storage, temporary)
  assert.equal(readSession(storage, temporary), null)
  await assert.rejects(loginAccount(data, storage, temporary))
  assert.equal((await loginAccount(changed, storage, temporary)).id, original.id)
})
