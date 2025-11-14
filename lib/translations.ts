// Houston, Texas Spanish dialect translations
// Influenced by Mexican Spanish with Texas regionalisms

export const translations = {
  en: {
    // Navigation
    discover: 'Discover',
    map: 'Map',
    grubRoulette: 'Grub Roulette',
    categories: 'Categories',
    blog: 'Blog',
    launch: 'Launch',
    advertise: 'Advertise',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    
    // Home page
    findBestRestaurants: 'Find the Best Restaurants in Katy, Texas',
    discoverLocal: 'Discover local favorites, hidden gems, and new dining experiences',
    searchPlaceholder: 'Search restaurants, cuisines, or dishes...',
    featuredRestaurants: 'Featured Restaurants',
    viewAll: 'View All',
    
    // Restaurant details
    about: 'About',
    contactHours: 'Contact & Hours',
    address: 'Address',
    phone: 'Phone',
    website: 'Website',
    getDirections: 'Get Directions',
    reviews: 'Reviews',
    writeReview: 'Write a Review',
    
    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    
    // Price levels
    budget: 'Budget',
    moderate: 'Moderate',
    upscale: 'Upscale',
    premium: 'Premium',
  },
  es: {
    // Navigation
    discover: 'Descubrir',
    map: 'Mapa',
    grubRoulette: 'Ruleta de Comida',
    categories: 'Categorías',
    blog: 'Blog',
    launch: 'Lanzamiento',
    advertise: 'Anunciar',
    signIn: 'Iniciar Sesión',
    signUp: 'Registrarse',
    
    // Home page
    findBestRestaurants: 'Encuentra los Mejores Restaurantes en Katy, Texas',
    discoverLocal: 'Descubre favoritos locales, joyas escondidas y nuevas experiencias culinarias',
    searchPlaceholder: 'Busca restaurantes, comidas, o platillos...',
    featuredRestaurants: 'Restaurantes Destacados',
    viewAll: 'Ver Todos',
    
    // Restaurant details
    about: 'Acerca de',
    contactHours: 'Contacto y Horario',
    address: 'Dirección',
    phone: 'Teléfono',
    website: 'Sitio Web',
    getDirections: 'Cómo Llegar',
    reviews: 'Reseñas',
    writeReview: 'Escribir Reseña',
    
    // Common
    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Borrar',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    
    // Price levels
    budget: 'Económico',
    moderate: 'Moderado',
    upscale: 'Elegante',
    premium: 'Premium',
  }
}

export function getTranslation(key: string): string {
  if (typeof window === 'undefined') return key
  
  const language = localStorage.getItem('ekaty_language') || 'en'
  const keys = key.split('.')
  let value: any = translations[language as 'en' | 'es']
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  return value || key
}

export function useTranslation() {
  const [language, setLanguage] = useState<'en' | 'es'>('en')
  
  useEffect(() => {
    const savedLang = localStorage.getItem('ekaty_language') || 'en'
    setLanguage(savedLang as 'en' | 'es')
    
    const handleLanguageChange = (e: CustomEvent) => {
      setLanguage(e.detail.language)
    }
    
    window.addEventListener('languageChange', handleLanguageChange as EventListener)
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener)
    }
  }, [])
  
  const t = (key: string) => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }
  
  return { t, language }
}

function useState<T>(initialValue: T): [T, (value: T) => void] {
  if (typeof window === 'undefined') {
    return [initialValue, () => {}]
  }
  
  const [state, setState] = (window as any).React?.useState?.(initialValue) || [initialValue, () => {}]
  return [state, setState]
}

function useEffect(effect: () => void | (() => void), deps?: any[]) {
  if (typeof window !== 'undefined' && (window as any).React?.useEffect) {
    (window as any).React.useEffect(effect, deps)
  }
}
