import assert from 'node:assert/strict'
import test from 'node:test'
import { validateForm } from '../src/utils/validateForm.js'

function values(entries) {
  const data = new FormData()
  for (const [name, value] of Object.entries(entries)) data.set(name, value)
  return data
}

test('un nombre vacío o compuesto de espacios requiere una corrección', () => {
  const fields = [{ name: 'name', label: 'Nombre', required: true }]
  assert.ok(validateForm(fields, values({ name: '   ' })).name)
  assert.deepEqual(validateForm(fields, values({ name: 'Elara Valen' })), {})
})

test('el correo exige usuario, arroba y dominio', () => {
  const fields = [{ name: 'email', type: 'email', required: true }]
  for (const email of ['elara', 'elara@', '@umbra.es', 'elara@umbra', 'elara @umbra.es']) {
    assert.ok(validateForm(fields, values({ email })).email, email)
  }
  assert.deepEqual(validateForm(fields, values({ email: 'elara@umbra.es' })), {})
})

test('el registro exige longitud suficiente, un carácter especial y contraseñas iguales', () => {
  const fields = [
    { name: 'password', required: true, minLength: 8, requireSpecial: true },
    { name: 'confirmPassword', required: true, matches: 'password' },
  ]
  assert.ok(validateForm(fields, values({ password: 'corta!', confirmPassword: 'corta!' })).password)
  for (const password of ['prueba123', 'prueba 123', 'contraseña123']) {
    assert.ok(validateForm(fields, values({ password, confirmPassword: password })).password, password)
  }
  assert.ok(validateForm(fields, values({ password: 'prueba1!', confirmPassword: 'diferente' })).confirmPassword)
  for (const password of ['prueba1!', 'prueba1@', 'prueba1#', 'prueba1$']) {
    assert.deepEqual(validateForm(fields, values({ password, confirmPassword: password })), {})
  }
})

test('el nivel debe ser entero y estar entre 1 y 20', () => {
  const fields = [{ name: 'level', type: 'number', required: true, min: 1, max: 20 }]
  for (const level of ['', '0', '21', '2.5', 'letras']) assert.ok(validateForm(fields, values({ level })).level)
  for (const level of ['1', '8', '20']) assert.deepEqual(validateForm(fields, values({ level })), {})
})

test('una casilla obligatoria debe estar marcada', () => {
  const fields = [{ name: 'consent', type: 'checkbox', required: true }]
  assert.ok(validateForm(fields, values({})).consent)
  assert.deepEqual(validateForm(fields, values({ consent: 'on' })), {})
})
