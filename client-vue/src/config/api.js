// Configuración de la API
export const API_CONFIG = {
  baseURL: 'https://localhost:7175/api',
  timeout: 30000,
  endpoints: {
    municipalities: '/municipalities',
    sectors: '/sectors',
    complaintTypes: '/complainttypes',
    status: '/status',
    complaints: '/complaints'
  }
}

// Mensajes de la aplicación
export const MESSAGES = {
  success: {
    created: 'Registro creado exitosamente',
    updated: 'Registro actualizado exitosamente',
    deleted: 'Registro eliminado exitosamente'
  },
  error: {
    network: 'Error de conexión. Verifique su internet.',
    server: 'Error del servidor. Intente más tarde.',
    notFound: 'Recurso no encontrado',
    validation: 'Por favor corrija los errores en el formulario',
    general: 'Ha ocurrido un error inesperado'
  },
  confirm: {
    delete: '¿Está seguro de eliminar este elemento?',
    unsavedChanges: 'Tiene cambios sin guardar. ¿Desea salir?'
  }
}