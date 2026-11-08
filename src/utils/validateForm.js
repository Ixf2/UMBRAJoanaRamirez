export function validateForm(fields, values) {
  const errors = {}
  for (const field of fields) {
    const raw = values.get(field.name)
    const value = typeof raw === 'string' ? raw : ''
    if (field.required && !value.trim()) {
      errors[field.name] = field.type === 'checkbox' ? 'Debes marcar esta casilla para continuar.' : `Completa el campo «${field.label}».`
    } else if (value && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[field.name] = 'Escribe un correo válido, por ejemplo nombre@dominio.es.'
    } else if (value && field.minLength && value.trim().length < field.minLength) {
      errors[field.name] = `Introduce al menos ${field.minLength} caracteres.`
    } else if (value && field.maxLength && value.length > field.maxLength) {
      errors[field.name] = `Introduce como máximo ${field.maxLength} caracteres.`
    } else if (value && field.options && !field.options.includes(value)) {
      errors[field.name] = 'Selecciona una opción de la lista.'
    } else if (value && field.requireSpecial && !/[^\p{L}\p{N}\s]/u.test(value)) {
      errors[field.name] = 'Incluye al menos un carácter especial, como !, @, # o $.'
    } else if (value && field.type === 'number' && (!Number.isInteger(Number(value)) || Number(value) < field.min || Number(value) > field.max)) {
      errors[field.name] = `Introduce un número entero entre ${field.min} y ${field.max}.`
    } else if (field.matches && value !== values.get(field.matches)) {
      errors[field.name] = 'Las contraseñas deben coincidir.'
    }
  }
  return errors
}
