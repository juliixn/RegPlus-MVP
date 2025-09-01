# RegPlus: Aplicación de Seguridad y Gestión de Condominios

Esta es una aplicación Next.js construida con Firebase Studio, diseñada para gestionar la seguridad y las operaciones diarias de un condominio.

## Configuración del Proyecto

Para que la aplicación funcione correctamente, es crucial configurar las credenciales de Firebase tanto para el desarrollo local como para el despliegiegue en producción.

### 1. Configuración para Desarrollo Local

Para el desarrollo en tu máquina local, la aplicación utiliza un archivo `.env` para cargar las credenciales de Firebase.

**Pasos:**

1.  **Crea el archivo `.env`:** Si no existe, renombra o copia el archivo `.env.example` a `.env`.
2.  **Obtén las credenciales del cliente de Firebase:**
    *   Ve a tu [Consola de Firebase](https://console.firebase.google.com/).
    *   Selecciona tu proyecto (`acceso-seguro-3cs42`).
    *   Haz clic en el ícono de engranaje (⚙️) y ve a **"Configuración del proyecto"**.
    *   En la pestaña "General", en la sección "Tus apps", selecciona tu aplicación web.
    *   Copia los valores del objeto `firebaseConfig` y pégalos en las variables `NEXT_PUBLIC_FIREBASE_*` correspondientes en tu archivo `.env`.
3.  **Obtén las credenciales del SDK de Administrador:**
    *   En la "Configuración del proyecto", ve a la pestaña **"Cuentas de servicio"**.
    *   Haz clic en **"Generar nueva clave privada"**. Se descargará un archivo JSON.
    *   Abre el archivo JSON, copia **todo su contenido** y pégalo dentro de las comillas simples de la variable `FIREBASE_SERVICE_ACCOUNT_KEY` en tu archivo `.env`.

### 2. Configuración para Producción (Firebase App Hosting)

Cuando despliegas tu aplicación, el archivo `.env` no se utiliza. Debes almacenar tus credenciales de forma segura usando **Secret Manager**.

**Requisitos:**
*   Tener [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) instalado.
*   Haber iniciado sesión en gcloud (`gcloud auth login`).
*   Tener seleccionado tu proyecto de Firebase (`gcloud config set project acceso-seguro-3cs42`).

**Pasos:**

1.  **Guarda la Clave de la Cuenta de Servicio (Admin SDK):**
    *   Usa el contenido del archivo JSON que descargaste en el paso anterior.
    *   Ejecuta el siguiente comando en tu terminal, reemplazando el contenido entre comillas con el JSON de tu cuenta de servicio:
    ```bash
    gcloud secrets versions add FIREBASE_SERVICE_ACCOUNT_KEY --data-file=/path/to/your/serviceAccountKey.json
    ```
    *   Otorga permisos a tu backend de App Hosting para que pueda acceder al secreto:
    ```bash
    gcloud secrets add-iam-policy-binding FIREBASE_SERVICE_ACCOUNT_KEY \
      --member="serviceAccount:$(gcloud projects describe acceso-seguro-3cs42 --format='value(projectNumber)')-compute@developer.gserviceaccount.com" \
      --role="roles/secretmanager.secretAccessor"
    ```

2.  **Guarda las Credenciales del Cliente:**
    *   Repite el proceso para cada una de las variables del cliente. Por ejemplo, para la API Key:
    ```bash
    gcloud secrets versions add NEXT_PUBLIC_FIREBASE_API_KEY --data-file=<(echo -n "TU_API_KEY_AQUI")

    gcloud secrets add-iam-policy-binding NEXT_PUBLIC_FIREBASE_API_KEY \
      --member="serviceAccount:$(gcloud projects describe acceso-seguro-3cs42 --format='value(projectNumber)')-compute@developer.gserviceaccount.com" \
      --role="roles/secretmanager.secretAccessor"
    ```
    *   **Importante:** Haz esto para TODAS las variables que están en `.env.example`.

Una vez completados estos pasos, tu aplicación estará lista para desplegarse y se conectará de forma segura a Firebase.
