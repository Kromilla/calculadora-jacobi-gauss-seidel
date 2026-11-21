# PRÁCTICA COMPUTACIONAL 1

**Universidad del Magdalena**

**Análisis Numérico (G3 - 2026-II)**

**Profesor:** Marlon Hurtado

**Fecha:** 20 de noviembre de 2026

## Integrantes

- Carlos Alfredo Ibañez Ortiz
- Adriana Carolina Olivares Vásquez
- Yineth Ávila Villalobos

## Programa

Calculadora web de sistemas Ax=b por Jacobi y Gauss-Seidel.

| Dato | Valor |
| --- | --- |
| Repositorio | https://github.com/Kromilla/calculadora-jacobi-gauss-seidel |
| Sitio | https://calculadora-jacobi-gauss-seidel.vercel.app |
| Archivos | index.html, css/estilos.css, js/solver.js, js/app.js |

## Qué hace

El programa resuelve Ax=b. Reordena las ecuaciones para dejar en la diagonal el mayor valor absoluto. Jacobi usa solo la iteración anterior. Gauss-Seidel usa cada componente nueva de inmediato. El redondeo se hace a las cifras pedidas, y el empate se resuelve alejándose de cero.

Paro por defecto: la norma infinito de la diferencia entre iteraciones es menor que la tolerancia. También se calculan la norma 1 y la norma 2.

Converge para cualquier x0 si A es estrictamente diagonal dominante o si rho(T)<1.

T_J = -D^{-1}(L+U)

T_G = -(D+L)^{-1}U

## Evidencia 1. Ejemplo del curso

Sistema original:

- -x1 + 2x2 - x3 = 4
- 2x1 - x2 + 3x3 = -3
- -5x1 + 3x2 + x3 = 0

Orden: 3, 1, 2.

Condiciones: x0 = (0, 0, 0), 4 cifras, tolerancia 0.001, norma infinito.

| Método | Primera iteración | k | Aproximación | Error | rho |
| --- | --- | --- | --- | --- | --- |
| Jacobi | (0, 2, -1) | 26 | (1.0002, 1.9997, -0.9997) | 0.0008 | 0.7461 |
| Gauss-Seidel | (0, 2, -0.3333) | 11 | (0.9997, 1.9998, -0.9999) | 0.0003 | 0.4472 |

Solución exacta: (1, 2, -1).

A no es estrictamente diagonal dominante. Ambos rho<1.

## Evidencia 2. Sistema manuscrito

Sistema original:

- 5x1 - x2 + x3 = 3
- -2x1 + 3x2 + 5x3 = -1
- x1 - 4x2 + 2x3 = 2

Orden obtenido: 1, 3, 2, igual a la foto.

| Método | k | Aproximación | rho |
| --- | --- | --- | --- |
| Jacobi | 15 | (0.5079, -0.2856, 0.1743) | 0.6054 |
| Gauss-Seidel | 8 | (0.5078, -0.2856, 0.1745) | 0.4 |

Solución exacta aproximada: (0.5079, -0.2857, 0.1746).

## Prompts dados a la IA

Los textos siguientes se copian tal como se dieron a la IA.

### 1

hola, necesitamos desarollar un proyecto de una calculadora, con las siguientes normas jacobi , gauss-seidel , haz la investigacion, de las reglas y aplicalas al proyecto Solución Sistemas de Ecuaciones Lineales-Parte 2.pptx Solución Sistemas de Ecuaciones Lineales-Parte 3.pptx

### 2

ejecuta esta prueba para comfirmar que funciona. Sistema de la foto: 5x1 - x2 + x3 = 3; -2x1 + 3x2 + 5x3 = -1; x1 - 4x2 + 2x3 = 2. Reordenado a mano: 5x1 - x2 + x3 = 3; x1 - 4x2 + 2x3 = 2; -2x1 + 3x2 + 5x3 = -1.

### 3

necesito generar un documento, con todo esto, pero primero sube el proyecto a git, en repositorio publico y desplegado en versel ademas agrega en el encabezado los integrantes Carlos Alfredo Ibañez Ortiz, Adriana Carolina Olivares Vásquez, Yineth Ávila Villalobos, universidad del magdalena, profesor marlon hurtado, materia analisis numerico.

### 4

agregale las normas de Solución Sistemas de Ecuaciones Lineales-Parte 1.pptx para calcular.

### 5

aplica las nomas 1, 2 y la de infinito.

### 6

que se puedan elegir en la calculadora y genera el informe final, con los nombres, el link y evidencias y lo de los prompts necesarios.
