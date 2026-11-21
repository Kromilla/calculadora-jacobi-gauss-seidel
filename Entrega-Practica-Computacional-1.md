# Práctica Computacional 1

Universidad del Magdalena

Análisis Numérico, grupo G3, periodo 2026-II

Profesor: Marlon Hurtado

Solución de sistemas de ecuaciones lineales. Calculadora de los métodos de Jacobi y de Gauss-Seidel.

Integrantes:

- Carlos Alfredo Ibañez Ortiz
- Adriana Carolina Olivares Vásquez
- Yineth Ávila Villalobos

Entrega: viernes 20 de noviembre de 2026, 20:00.

# Qué se entrega y cómo abrir el programa

La práctica pide el programa y un documento con las instrucciones dadas a la IA para obtenerlo. Este PDF es ese documento. El programa es una calculadora en HTML, CSS y JavaScript. Resuelve Ax = b.

Archivos:

- `index.html`, página principal.
- `css/estilos.css`, presentación.
- `js/solver.js`, métodos numéricos.
- `js/app.js`, lectura de la grilla y presentación de los resultados.
- `Instrucciones-IA.txt`, el mismo recuento en texto plano.

Repositorio público:

`https://github.com/Kromilla/calculadora-jacobi-gauss-seidel`

Sitio en Vercel, despliegue permanente de producción:

`https://calculadora-jacobi-gauss-seidel.vercel.app`

Esa dirección abre la calculadora. Es el alias permanente de producción. También responde `https://calculadora-jacobi-gauss-seidel-kromillas-projects.vercel.app`.

Para usarla en línea, abra el primer enlace en un navegador.

Para abrirla en el computador, descargue el repositorio y abra `index.html`. Las carpetas `css` y `js` tienen que quedar junto a ese archivo.

Al abrir `index.html`, la grilla ya trae el ejemplo del curso, de tres ecuaciones. El método marcado es Gauss-Seidel. La norma de paro marcada es la norma infinito. También se pueden marcar la norma 1 y la norma 2. La tolerancia es 0.001, las cifras decimales son 4 y el máximo de iteraciones es 100. Están activas la reordenación de ecuaciones y el redondeo de cada componente nueva. El botón Ejemplo del curso vuelve a cargar ese sistema. Calcular ejecuta el método elegido. Se puede pasar a Jacobi o a la comparación de ambos. El tamaño admite de 2 a 8 ecuaciones.

El encabezado de la página muestra la Universidad del Magdalena, Análisis numérico, el profesor Marlon Hurtado y los tres integrantes.

# Instrucciones dadas a la IA

Quedan copiadas como se escribieron en la conversación.

## Instrucción 1

> hola, necesitamos desarollar un proyecto de una calculadora, con las siguientes normas jacobi , gauss-seidel , haz la investigacion, de las reglas y aplicalas al proyecto Solución Sistemas de Ecuaciones Lineales-Parte 2.pptx Solución Sistemas de Ecuaciones Lineales-Parte 3.pptx

La IA debía investigar las reglas de Jacobi y de Gauss-Seidel en esas dos presentaciones y aplicarlas en la calculadora.

## Instrucción 2

> ejecuta esta prueba para comfirmar que funciona

Se adjuntó una foto. A la izquierda está el sistema original y a la derecha el mismo sistema reordenado a mano, para dejar en la diagonal el coeficiente de mayor valor absoluto.

Sistema original:

- 5 x1 − x2 + x3 = 3
- −2 x1 + 3 x2 + 5 x3 = −1
- x1 − 4 x2 + 2 x3 = 2

Orden escrito a mano:

- 5 x1 − x2 + x3 = 3
- x1 − 4 x2 + 2 x3 = 2
- −2 x1 + 3 x2 + 5 x3 = −1

## Instrucción 3

> necesito generar un documento, con todo esto, pero primero sube el proyecto a git, en repocitorio publico y desplegado en versel ademas agrega en el encabezado los integrandes - Carlos Alfredo Ibañez Ortiz - Adriana Carolina Olivares Vásquez - Yineth Ávila Villalobos universidad del magdalena, profesor marlon hurtado materia analisis numerico

De esta instrucción salen el encabezado del programa, el repositorio público de Git y el despliegue en Vercel.

## Instrucción 4

> agregale las normas D:\Users\WinterOS\Downloads\Solución Sistemas de Ecuaciones Lineales-Parte 1.pptx para calcular

En el programa quedó, a partir de esta instrucción, el cálculo de las normas vectoriales de la Parte 1. En cada iteración `js/solver.js` calcula la norma 1, la norma 2 y la norma infinito de la diferencia entre dos aproximaciones. La página deja marcada la norma infinito, que es el criterio de paro por defecto y el de los ejemplos del curso. `Instrucciones-IA.txt` no trae un apartado propio de la Parte 1. Este PDF no agrega otros métodos ni otros resultados numéricos que no estén en ese archivo o en el código.

# Reglas aplicadas

Las reglas siguientes están en `Instrucciones-IA.txt` y en la calculadora (`js/solver.js`, `js/app.js` e `index.html`). Provienen de la Parte 3, métodos iterativos, y de la Parte 2, Gauss-Seidel.

## Jacobi

De cada ecuación se despeja la incógnita de la diagonal. La componente nueva x_i^(k+1) usa solo valores de la iteración anterior x^(k). El programa arma el vector nuevo completo con el vector anterior.

Forma matricial: x^(k+1) = T_J x^(k) + c_J, con T_J = −D^(−1)(L + U) y c_J = D^(−1) b. Se escribe A = L + D + U.

## Gauss-Seidel

Es una variante de Jacobi. La componente recién calculada se usa de inmediato en las ecuaciones siguientes.

- x1^(k+1) usa x^(k).
- x2^(k+1) usa x1^(k+1) y el resto de x^(k).
- x3^(k+1) usa x1^(k+1), x2^(k+1) y el resto de x^(k).

Forma matricial: x^(k+1) = T_G x^(k) + c_G, con T_G = −(D + L)^(−1) U y c_G = (D + L)^(−1) b.

## Reglas comunes

- Se parte de una aproximación inicial x^(0). En los ejemplos, x^(0) = (0, 0, 0).
- Antes de iterar, si la reordenación está activa, el programa permuta las ecuaciones para que el coeficiente de mayor valor absoluto de cada fila quede en la diagonal, cuando ese orden es posible.
- Cada componente nueva se redondea a las cifras pedidas. En los ejemplos del curso, cuatro cifras. El empate se aleja de cero.
- En cada iteración se calculan tres normas de la diferencia entre la aproximación nueva y la anterior. La norma 1 es la suma de los valores absolutos. La norma 2 es la raíz de la suma de los cuadrados. La norma infinito es el mayor valor absoluto.
- El proceso se detiene cuando la norma elegida es menor que la tolerancia. La norma marcada al abrir, y la de los ejemplos del curso, es la infinito: ||x^(k) − x^(k−1)||_inf < tolerancia. En los ejemplos, la tolerancia es 10^(−3), escrita en el programa como 0.001.
- El método converge para cualquier x^(0) si se cumple alguna de estas condiciones: A es estrictamente diagonal dominante, esto es, |a_ii| mayor que la suma de |a_ij| con j distinto de i en cada fila; o el radio espectral de la matriz de iteración cumple rho(T) < 1.
- Puede haber convergencia aunque A no sea estrictamente diagonal dominante. La condición decisiva es rho(T) < 1.

La grilla acepta de 2 a 8 ecuaciones. Se puede elegir Jacobi, Gauss-Seidel o la comparación de ambos. El redondeo se aplica a cada componente nueva y al error mostrado. La tabla de iteraciones muestra k, las componentes y las tres normas de la diferencia. La columna de la norma elegida queda marcada. El programa informa si A es estrictamente diagonal dominante, calcula rho(T) y concluye si la convergencia queda garantizada para cualquier aproximación inicial. También muestra las fórmulas despejadas, la primera iteración, T y c.

# Resultados del ejemplo del curso

Estos valores están tomados de la comprobación registrada en `Instrucciones-IA.txt`. Coinciden con las tablas de las presentaciones. Las cifras usan el punto decimal del programa.

Sistema original:

- −x1 + 2 x2 − x3 = 4
- 2 x1 − x2 + 3 x3 = −3
- −5 x1 + 3 x2 + x3 = 0

Orden usado: ecuación 3, luego 1, luego 2.

- −5 x1 + 3 x2 + x3 = 0
- −x1 + 2 x2 − x3 = 4
- 2 x1 − x2 + 3 x3 = −3

Condiciones: x^(0) = (0, 0, 0), cuatro cifras, tolerancia 0.001.

| Método | Primera iteración | Paro | Aproximación | Error | rho(T) |
| --- | --- | --- | --- | --- | --- |
| Jacobi | (0, 2, −1) | k = 26 | (1.0002, 1.9997, −0.9997) | 0.0008 | 0.7461 |
| Gauss-Seidel | (0, 2, −0.3333) | k = 11 | (0.9997, 1.9998, −0.9999) | 0.0003 | 0.4472 |

La solución exacta es (1, 2, −1). A no es estrictamente diagonal dominante. Los dos radios espectrales son menores que 1, así que ambos métodos convergen para cualquier x^(0). Gauss-Seidel llega en menos iteraciones.

# Resultados del sistema escrito a mano

Sistema original:

- 5 x1 − x2 + x3 = 3
- −2 x1 + 3 x2 + 5 x3 = −1
- x1 − 4 x2 + 2 x3 = 2

Orden obtenido por el programa: ecuación 1, luego 3, luego 2. Coincide con el reordenamiento de la foto.

- 5 x1 − x2 + x3 = 3
- x1 − 4 x2 + 2 x3 = 2
- −2 x1 + 3 x2 + 5 x3 = −1

Fórmulas de Jacobi:

- x1^(k+1) = (1/5) x2^(k) − (1/5) x3^(k) + 3/5
- x2^(k+1) = (1/4) x1^(k) + (1/2) x3^(k) − 1/2
- x3^(k+1) = (2/5) x1^(k) − (3/5) x2^(k) − 1/5

En Gauss-Seidel, x2 usa x1^(k+1) y x3 usa x1^(k+1) y x2^(k+1).

Con x^(0) = (0, 0, 0), cuatro cifras y tolerancia 0.001:

| Método | Paro | Aproximación | rho(T) |
| --- | --- | --- | --- |
| Jacobi | k = 15 | (0.5079, −0.2856, 0.1743) | 0.6054 |
| Gauss-Seidel | k = 8 | (0.5078, −0.2856, 0.1745) | 0.4 |

La solución exacta es (0.5079, −0.2857, 0.1746). La fila 3 cumple |5| = |−2| + |3|, así que A no es estrictamente diagonal dominante. rho(T_J) = 0.6054 y rho(T_G) = 0.4. Los dos son menores que 1.

# Material para adjuntar

- `index.html`, junto con las carpetas `css` y `js`.
- Este PDF, con las instrucciones dadas a la IA.
- `Instrucciones-IA.txt`, por si la plataforma pide el texto suelto.
- Enlace del sitio: `https://calculadora-jacobi-gauss-seidel.vercel.app`
- Repositorio: `https://github.com/Kromilla/calculadora-jacobi-gauss-seidel`
