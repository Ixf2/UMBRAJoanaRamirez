export const menuItems = [
  { label: 'Inicio', path: '/inicio', icon: 'home' },
  { label: 'Biblioteca', path: '/biblioteca', icon: 'book' },
  { label: 'Crear personaje', path: '/crear-personaje' },
  { label: 'Inspiración', path: '/inspiracion', icon: 'sparkle' },
  { label: 'Perfil', path: '/perfil', icon: 'user' },
  { label: 'Ayuda', path: '/ayuda' },
  { label: 'Accesibilidad', path: '/accesibilidad' },
  { label: 'Iniciar sesión', path: '/login' },
]

export const mainTabs = [
  { label: 'Inicio', path: '/inicio', icon: 'home' },
  { label: 'Biblioteca', path: '/biblioteca', icon: 'book' },
  { label: 'Inspiración', path: '/inspiracion', icon: 'sparkle' },
  { label: 'Perfil', path: '/perfil', icon: 'user' },
]
export const pageTitles = {
  ...Object.fromEntries(menuItems.map(item => [item.path, item.label])),
  '/registro': 'Crear cuenta', '/recuperar': 'Recuperar acceso', '/privacidad': 'Privacidad y uso',
  '/accesibilidad/texto': 'Tamaño de texto', '/accesibilidad/contraste': 'Modo de contraste',
  '/accesibilidad/lectura': 'Lectores de pantalla', '/accesibilidad/teclado': 'Navegación por teclado',
  '/accesibilidad/apariencia': 'Personalización visual',
}
