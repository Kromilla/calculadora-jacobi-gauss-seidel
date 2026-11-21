# Enlaces y programa

Práctica Computacional 1. Solución de sistemas de ecuaciones lineales por los métodos de Jacobi y de Gauss-Seidel.

Universidad del Magdalena. Análisis Numérico (G3 - 2026-II). Profesor Marlon Hurtado.

Integrantes:

- Carlos Alfredo Ibañez Ortiz
- Adriana Carolina Olivares Vásquez
- Yineth Ávila Villalobos

Repositorio público:

`https://github.com/Kromilla/calculadora-jacobi-gauss-seidel`

Ese repositorio respondió al abrirlo. Es el enlace del código.

Sitio de producción en Vercel:

`https://calculadora-jacobi-gauss-seidel.vercel.app`

La dirección salió de la CLI de Vercel, con la sesión ya iniciada. `vercel project ls` lista el proyecto `calculadora-jacobi-gauss-seidel` y pone como Latest Production URL el enlace de arriba. El despliegue más reciente de ese proyecto estaba Ready y en entorno Production. Al abrir la dirección, el servidor respondió 200 y la página mostró la calculadora, con la Universidad del Magdalena, el profesor Marlon Hurtado y los tres integrantes.

Esa es la URL permanente. El enlace temporal `https://nimble-argon-wdnc8yv.tmp.now` no es la dirección de la entrega.

El programa es una página web: `index.html`, `css/estilos.css`, `js/solver.js` y `js/app.js`. Resuelve Ax = b. La grilla admite de 2 a 8 ecuaciones. Se puede elegir Jacobi, Gauss-Seidel o la comparación de ambos. Con la reordenación activa, permuta las ecuaciones para dejar en la diagonal el coeficiente de mayor valor absoluto de cada fila, cuando ese orden es posible. Jacobi arma el vector nuevo solo con la iteración anterior. Gauss-Seidel usa cada componente en cuanto la calcula. Cada componente nueva se redondea a las cifras pedidas, y el empate se aleja de cero.

# Instrucciones dadas a la IA

Los textos siguientes se copian como se escribieron. Se conservan las faltas de ortografía.

## Calculadora de Jacobi y Gauss-Seidel

> hola, necesitamos desarollar un proyecto de una calculadora, con las siguientes normas jacobi , gauss-seidel , haz la investigacion, de las reglas y aplicalas al proyecto Solución Sistemas de Ecuaciones Lineales-Parte 2.pptx Solución Sistemas de Ecuaciones Lineales-Parte 3.pptx

La IA debía tomar las reglas de esas dos presentaciones y aplicarlas en la calculadora.

## Prueba con el sistema escrito a mano

> ejecuta esta prueba para comfirmar que funciona

El mensaje iba con una foto. El sistema original es:

- 5 x1 − x2 + x3 = 3
- −2 x1 + 3 x2 + 5 x3 = −1
- x1 − 4 x2 + 2 x3 = 2

Reordenado a mano, para dejar en la diagonal el coeficiente de mayor valor absoluto:

- 5 x1 − x2 + x3 = 3
- x1 − 4 x2 + 2 x3 = 2
- −2 x1 + 3 x2 + 5 x3 = −1

## Encabezado, repositorio y despliegue

> necesito generar un documento, con todo esto, pero primero sube el proyecto a git, en repocitorio publico y desplegado en versel ademas agrega en el encabezado los integrandes - Carlos Alfredo Ibañez Ortiz - Adriana Carolina Olivares Vásquez - Yineth Ávila Villalobos universidad del magdalena, profesor marlon hurtado materia analisis numerico

De este pedido salen el encabezado del programa, el repositorio público, el despliegue en Vercel y el documento con las instrucciones.

## Normas de la parte 1

> agregale las normas D:\Users\WinterOS\Downloads\Solución Sistemas de Ecuaciones Lineales-Parte 1.pptx para calcular

El archivo citado es Solución Sistemas de Ecuaciones Lineales-Parte 1.pptx.

## Las tres normas

> aplica las nomas 1, 2 y la de infinito

## Elegir la norma y cerrar el informe

> que se puedan elejir en la calculadora y genera el informe final, con los nombres, el link y avidencias y lo de los proms necesarios

# Normas que se pueden elegir

En la calculadora hay un grupo llamado Norma de paro, con tres opciones:

- Norma 1: suma de los valores absolutos de la diferencia entre la iteración nueva y la anterior.
- Norma 2: raíz cuadrada de la suma de los cuadrados de esa diferencia.
- Norma infinito: el máximo de los valores absolutos.

La opción marcada al abrir la página, y la que vuelve a marcar el botón Ejemplo del curso, es la norma infinito. Es la del curso:

‖x^(k) − x^(k−1)‖∞ < tolerancia

En cada iteración el programa calcula las tres normas y las muestra en la tabla. La columna de la norma elegida queda resaltada. El proceso se detiene cuando esa norma, y solo esa, es menor que la tolerancia. Jacobi y Gauss-Seidel se conservan. El redondeo sigue siendo el que aleja el empate de cero. La reordenación de ecuaciones sigue activa en el ejemplo.

Si el redondeo está activo, cada norma se redondea a las cifras pedidas antes de compararla con la tolerancia. Así se conserva el criterio con el que están hechas las tablas del curso.

El método converge para cualquier x^(0) si A es estrictamente diagonal dominante, o si el radio espectral de la matriz de iteración cumple rho(T) < 1.

Tⱼ = −D⁻¹(L + U), con cⱼ = D⁻¹b.

TG = −(D + L)⁻¹U, con cG = (D + L)⁻¹b.

# Evidencia del ejemplo del curso

Estos valores están en `Instrucciones-IA.txt` y los reproduce `node _prueba.js` con la norma infinito, cuatro cifras y tolerancia 0.001. La prueba terminó en Jacobi con k = 26 y en Gauss-Seidel con k = 11, con los mismos vectores.

Sistema original:

- −x1 + 2 x2 − x3 = 4
- 2 x1 − x2 + 3 x3 = −3
- −5 x1 + 3 x2 + x3 = 0

Orden usado por el programa: ecuación 3, luego 1, luego 2.

- −5 x1 + 3 x2 + x3 = 0
- −x1 + 2 x2 − x3 = 4
- 2 x1 − x2 + 3 x3 = −3

x^(0) = (0, 0, 0).

| Método | Primera iteración | Paro | Aproximación | Error | rho(T) |
| --- | --- | --- | --- | --- | --- |
| Jacobi | (0, 2, −1) | k = 26 | (1.0002, 1.9997, −0.9997) | 0.0008 | 0.7461 |
| Gauss-Seidel | (0, 2, −0.3333) | k = 11 | (0.9997, 1.9998, −0.9999) | 0.0003 | 0.4472 |

La solución exacta es (1, 2, −1).

A no es estrictamente diagonal dominante. Los dos radios espectrales son menores que 1, así que ambos métodos convergen para cualquier x^(0). Gauss-Seidel llega en menos iteraciones.

En la primera iteración de Jacobi, la diferencia frente a (0, 0, 0) da las tres normas 3, 2.2361 y 2, ya redondeadas a cuatro cifras. La norma 2 es la raíz de 5. La de paro, con la opción por defecto, es 2.

Con el mismo ejemplo, la misma tolerancia y las mismas cuatro cifras, elegir otra norma cambia el momento de paro de Jacobi: la norma 1 lo detiene en k = 29 y la norma 2 en k = 27. Gauss-Seidel sigue en k = 11 con las tres. Esas cuentas salieron de `js/solver.js` en esta versión. Las aproximaciones de la tabla de arriba corresponden a la norma infinito.

# Evidencia del sistema escrito a mano

El mismo programa, con norma infinito, cuatro cifras, tolerancia 0.001 y x^(0) = (0, 0, 0), reprodujo el orden y las aproximaciones de `Instrucciones-IA.txt`.

Sistema original:

- 5 x1 − x2 + x3 = 3
- −2 x1 + 3 x2 + 5 x3 = −1
- x1 − 4 x2 + 2 x3 = 2

Orden obtenido: ecuación 1, luego 3, luego 2. Coincide con el reordenamiento de la foto.

- 5 x1 − x2 + x3 = 3
- x1 − 4 x2 + 2 x3 = 2
- −2 x1 + 3 x2 + 5 x3 = −1

Fórmulas de Jacobi:

- x1^(k+1) = (1/5) x2^(k) − (1/5) x3^(k) + 3/5
- x2^(k+1) = (1/4) x1^(k) + (1/2) x3^(k) − 1/2
- x3^(k+1) = (2/5) x1^(k) − (3/5) x2^(k) − 1/5

En Gauss-Seidel, x2 usa x1^(k+1), y x3 usa x1^(k+1) y x2^(k+1).

| Método | Paro | Aproximación | rho(T) |
| --- | --- | --- | --- |
| Jacobi | k = 15 | (0.5079, −0.2856, 0.1743) | 0.6054 |
| Gauss-Seidel | k = 8 | (0.5078, −0.2856, 0.1745) | 0.4 |

La solución exacta registrada en `Instrucciones-IA.txt` es (0.5079, −0.2857, 0.1746).

La fila 3 cumple |5| = |−2| + |3|, así que A no es estrictamente diagonal dominante. rho(TJ) = 0.6054 y rho(TG) = 0.4. Los dos son menores que 1.
