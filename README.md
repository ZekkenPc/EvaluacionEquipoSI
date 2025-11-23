# 🗳️ Implementación Criptográfica para Sistema de Elecciones

## Reporte Técnico – Seguridad de Información

Este documento describe la arquitectura, tecnologías y flujo criptográfico implementado para garantizar **confidencialidad**, **integridad**, **autenticación** y **no repudio** en un sistema de votación.

---

## 1. Arquitectura General

El sistema aplica una estrategia de **Defensa en Profundidad**, utilizando herramientas criptográficas modernas de Node.js (**crypto**, **bcryptjs**) para asegurar:

* **Autenticación** del usuario
* **Protección de datos en reposo**
* **Seguridad de la comunicación**
* Garantía de **integridad** y **autoría del voto**

---

## 2. Pilares Criptográficos Implementados

| Pilar | Tecnología / Algoritmo | Archivos Clave | Propósito |
| :--- | :--- | :--- | :--- |
| **1. Login Seguro** (Autenticación) | `bcrypt` | `auth.js` | Hash seguro de contraseñas con salt. |
| **2. Datos en Reposo** (Confidencialidad) | `AES-256-GCM` | `symmetric.js`, `db.js` | Cifrado completo del voto. |
| **3. Autenticidad y No Repudio** | `RSA-2048` + `SHA-256` | `signature.js`, `votes.js` | Firma digital para integridad y autoría. |
| **4. Defensa en Profundidad** (Comunicación Híbrida) | `AES-256-GCM` + `RSA-OAEP` | `hybrid.js`, `hybridSymmetric.js` | Cifrado híbrido: AES + RSA. |

---

## 3. Gestión de Llaves (AES y RSA)

### A. Llave Maestra AES

* Generada con: `crypto.randomBytes(32)`
* Usada para cifrar votos.
* Recomendación: almacenar en un **KMS** (Key Management Service) para producción.

### B. Vector de Inicialización (IV)

* Generado con: `crypto.randomBytes(12)`
* Diferente en cada operación.
* Se guarda junto al **ciphertext** (texto cifrado).

---

## 4. Flujo de Cifrado Híbrido (`hybrid.js`)

### Fase 1: Cliente – Cifrado

1.  Generación de **llave de sesión** ($\text{k}_s$).
2.  Cifrado con **AES-256-GCM**.
3.  Cifrado de $\text{k}_s$ con **RSA-OAEP**.
4.  Envío del paquete: `encryptedKey`, `ciphertext`, `iv`, `authTag`.

### Fase 2: Servidor – Descifrado

1.  Descifrado de `encryptedKey` con **RSA**.
2.  Descifrado del `ciphertext` con **AES**.
3.  Recuperación de los datos originales.
