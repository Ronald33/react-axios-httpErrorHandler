# HttpErrorHandler

Plugin de manejo de errores HTTP automático para Axios.

---

## ¿Qué es?

`HttpErrorHandler` ejecuta automáticamente una función (el cual debes asignarle) cada vez que una petición HTTP falla. Compatible con cualquier librería de notificaciones: Sonner, react-toastify, o cualquier función propia.

---

## Archivos

```
httpErrorHandler/
└── HttpErrorHandler.jsx
└── index.js
```

---

## Instalación

### 1. Instancia de Axios `api.js`

El plugin necesita una instancia de Axios para registrar sus interceptores. Si aún no tienes una, este es el mínimo necesario:

```js
// api.js
import axios from "axios"

const api = axios.create({
    baseURL: "https://jsonplaceholder.typicode.com",
})

export default api
```

### 2. Registrar el plugin en `config.js`

```js
// config.js
import api from "./api"
import HttpErrorHandler from '@/lib/httpErrorHandler'

HttpErrorHandler.registerApi(api)
HttpErrorHandler.setTrigger((error) =>
{
    if(error.response?.status === 400)
    { 
        /* ... */
        return; 
    }

    console.log('Ocurrió un error', error)
})

```

### 3. Importar `config.js` en `main.jsx`

Debe importarse antes que cualquier otra cosa:

```jsx
// main.jsx
import "./config.js"   // siempre primero
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>
)
```

---

## Uso

Una vez instalado, la función se ejecuta automáticamente cuando cualquier petición HTTP falla. No requiere ninguna acción adicional.

Para probarlo con la API de ejemplo, fuerza un error apuntando a un endpoint inexistente:

```js
// Ejecuta el trigger automáticamente
api.get("/esta-ruta-no-existe")
```

### Deshabilitar el handler en una petición específica

El plugin lee la propiedad `_disableErrorHandler` del config de Axios. Para desactivarlo en una petición específica, pásala como `true`:

```js
api.get("/posts", { _disableErrorHandler: true })
api.post("/posts", body, { _disableErrorHandler: true })
```

Si no se pasa, el valor por defecto es `false` y el trigger se ejecuta.

---

## Ejemplos de uso con distintas librerías

La función recibe el objeto `error` de Axios, lo que permite tomar decisiones según el tipo de error antes de mostrar cualquier notificación.

### Sonner

```js
import { toast } from "sonner"

HttpErrorHandler.setTrigger((error) =>
{
    toast.error("An error occurred while processing your request.")
})
```

### react-toastify

```js
import { toast } from "react-toastify"

HttpErrorHandler.setTrigger((error) =>
{
    toast.error("An error occurred while processing your request.")
})
```

---

## Notas importantes

- El plugin es completamente autónomo: no depende de ninguna utilidad del proyecto.
- No renderiza nada en el DOM.
- Si no se llama a `setTrigger()`, el plugin no hace nada al ocurrir un error.

---

## Anexo — Integración con Redux Toolkit

Si tu proyecto usa Redux Toolkit, puedes controlar `_disableErrorHandler` desde tus thunks mediante un wrapper sobre `createAsyncThunk`:

```js
// createAppThunk.js
import { createAsyncThunk } from "@reduxjs/toolkit"

const createAppThunk = (type, serviceMethod) =>
{
    return createAsyncThunk(type, async (arg = {}, { rejectWithValue }) =>
    {
        const { config, ...rest } = arg

        const internalConfig =
        {
            _disableErrorHandler: config?.disableErrorHandler === true,  // false por defecto
        }

        try
        {
            return await serviceMethod({ ...rest, config: internalConfig })
        }
        catch(error)
        {
            return rejectWithValue(error)
        }
    })
}

export default createAppThunk
```

Con esto, puedes controlar el handler al despachar un thunk:

```js
// Ejecuta el trigger si la petición falla (comportamiento por defecto)
dispatch(fetchPosts())

// No ejecuta el trigger si la petición falla
dispatch(fetchPosts({ config: { disableErrorHandler: true } }))
```