/* Calculadora de Jacobi y Gauss-Seidel.
   Reglas del curso (sistemas lineales, partes 2 y 3):
   - Jacobi usa solo la iteración anterior.
   - Gauss-Seidel usa de inmediato cada componente nueva.
   - Paro: norma infinito entre dos iteraciones consecutivas.
   - Redondeo half away from zero en cada componente nueva.
   - Converge para cualquier x0 si A es estrictamente diagonal
     dominante o si el radio espectral de T es menor que 1.
   - Se reordenan ecuaciones para dejar en la diagonal el mayor
     valor absoluto de cada fila, cuando eso es posible. */
(function (root) {
  const ESCALA = 24;
  const UNO = 10n ** BigInt(ESCALA);

  function errorUsuario(mensaje) {
    const err = new Error(mensaje);
    err.usuario = true;
    return err;
  }

  function parsear(entrada) {
    let texto = String(entrada).trim().replace(/\s+/g, "").replace(",", ".");
    if (!texto) throw errorUsuario("Hay una casilla vacía.");
    let signo = 1n;
    if (texto[0] === "+") texto = texto.slice(1);
    else if (texto[0] === "-") {
      signo = -1n;
      texto = texto.slice(1);
    }
    const coincidencia = texto.match(/^(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i);
    if (!coincidencia || ((coincidencia[1] || "") === "" && (coincidencia[2] || "") === "")) {
      throw errorUsuario("No es un número válido: " + entrada);
    }
    const parteEntera = coincidencia[1] || "0";
    const parteDecimal = coincidencia[2] || "";
    const exponente = coincidencia[3] ? Number(coincidencia[3]) : 0;
    if (!Number.isInteger(exponente) || Math.abs(exponente) > 12) {
      throw errorUsuario("El exponente es demasiado grande: " + entrada);
    }
    const digitosCrudos = (parteEntera + parteDecimal).replace(/^0+/, "");
    if (!digitosCrudos) return 0n;
    const potencia = exponente - parteDecimal.length + ESCALA;
    if (potencia >= 0) {
      return signo * BigInt(digitosCrudos) * 10n ** BigInt(potencia);
    }
    const corte = -potencia;
    if (corte >= digitosCrudos.length) {
      const resto = BigInt(digitosCrudos);
      const base = 10n ** BigInt(corte);
      return resto * 2n >= base ? signo : 0n;
    }
    let valor = BigInt(digitosCrudos.slice(0, digitosCrudos.length - corte));
    if (digitosCrudos[digitosCrudos.length - corte] >= "5") valor += 1n;
    return signo * valor;
  }

  function negativo(a) {
    return -a;
  }

  function sumar(a, b) {
    return a + b;
  }

  function restar(a, b) {
    return a - b;
  }

  function multiplicar(a, b) {
    const producto = a * b;
    const negativoProducto = producto < 0n;
    const absoluto = negativoProducto ? -producto : producto;
    const cociente = absoluto / UNO;
    const residuo = absoluto % UNO;
    const ajustado = residuo * 2n >= UNO ? cociente + 1n : cociente;
    return negativoProducto ? -ajustado : ajustado;
  }

  function dividir(a, b) {
    if (b === 0n) throw errorUsuario("División entre cero.");
    const numerador = a * UNO;
    const signosDistintos = (numerador < 0n) !== (b < 0n);
    const absolutoNum = numerador < 0n ? -numerador : numerador;
    const absolutoDen = b < 0n ? -b : b;
    const cociente = absolutoNum / absolutoDen;
    const residuo = absolutoNum % absolutoDen;
    const ajustado = residuo * 2n >= absolutoDen ? cociente + 1n : cociente;
    return signosDistintos ? -ajustado : ajustado;
  }

  function absoluto(a) {
    return a < 0n ? -a : a;
  }

  function redondear(a, cifras) {
    if (cifras >= ESCALA) return a;
    const base = 10n ** BigInt(ESCALA - cifras);
    const esNegativo = a < 0n;
    const mag = esNegativo ? -a : a;
    const cociente = mag / base;
    const residuo = mag % base;
    const ajustado = residuo * 2n >= base ? cociente + 1n : cociente;
    const salida = ajustado * base;
    return esNegativo ? -salida : salida;
  }

  function aNumero(a) {
    const esNegativo = a < 0n;
    const mag = esNegativo ? -a : a;
    const texto = mag.toString().padStart(ESCALA + 1, "0");
    const corte = texto.length - ESCALA;
    const numero = Number(texto.slice(0, corte) + "." + texto.slice(corte, corte + 15));
    return esNegativo ? -numero : numero;
  }

  function formatear(a, cifras, fijo) {
    const valor = fijo ? redondear(a, cifras) : a;
    const esNegativo = valor < 0n;
    const mag = esNegativo ? -valor : valor;
    if (mag === 0n) {
      return cifras > 0 && fijo ? "0." + "0".repeat(cifras) : "0";
    }
    const texto = mag.toString().padStart(ESCALA + 1, "0");
    const corte = texto.length - ESCALA;
    const entera = texto.slice(0, corte).replace(/^0+/, "") || "0";
    let decimal = texto.slice(corte);
    if (fijo) {
      decimal = decimal.slice(0, cifras);
      return (esNegativo ? "-" : "") + entera + (cifras ? "." + decimal : "");
    }
    decimal = decimal.slice(0, cifras).replace(/0+$/, "");
    return (esNegativo ? "-" : "") + entera + (decimal ? "." + decimal : "");
  }

  function clonarMatriz(matriz) {
    return matriz.map((fila) => fila.slice());
  }

  function subindice(indice) {
    const marcas = "₀₁₂₃₄₅₆₇₈₉";
    return String(indice)
      .split("")
      .map((digito) => marcas[Number(digito)])
      .join("");
  }

  function permutaciones(n) {
    const resultado = [];
    const usado = Array(n).fill(false);
    const actual = [];
    function buscar() {
      if (actual.length === n) {
        resultado.push(actual.slice());
        return;
      }
      for (let i = 0; i < n; i += 1) {
        if (usado[i]) continue;
        usado[i] = true;
        actual.push(i);
        buscar();
        actual.pop();
        usado[i] = false;
      }
    }
    buscar();
    return resultado;
  }

  function margenDiagonal(matriz) {
    const n = matriz.length;
    let estricta = true;
    let peor = null;
    let sumaDiagonal = 0n;
    const filas = [];
    for (let i = 0; i < n; i += 1) {
      const diagonal = absoluto(matriz[i][i]);
      let fuera = 0n;
      for (let j = 0; j < n; j += 1) {
        if (j !== i) fuera += absoluto(matriz[i][j]);
      }
      const margen = diagonal - fuera;
      const cumple = diagonal > fuera;
      if (!cumple) estricta = false;
      if (peor === null || margen < peor) peor = margen;
      sumaDiagonal += diagonal;
      filas.push({ indice: i, diagonal, fuera, margen, cumple });
    }
    return { estricta, peor, sumaDiagonal, filas };
  }

  function reordenarEcuaciones(matriz, independiente) {
    const n = matriz.length;
    let mejor = null;
    permutaciones(n).forEach((orden) => {
      const candidata = orden.map((fila) => matriz[fila].slice());
      const calidad = margenDiagonal(candidata);
      const puntaje = [
        calidad.estricta ? 1 : 0,
        calidad.peor,
        calidad.sumaDiagonal,
      ];
      if (!mejor) {
        mejor = { orden, puntaje };
        return;
      }
      for (let k = 0; k < puntaje.length; k += 1) {
        if (puntaje[k] > mejor.puntaje[k]) {
          mejor = { orden, puntaje };
          return;
        }
        if (puntaje[k] < mejor.puntaje[k]) return;
      }
    });
    const cambio = mejor.orden.some((fila, indice) => fila !== indice);
    return {
      matriz: mejor.orden.map((fila) => matriz[fila].slice()),
      independiente: mejor.orden.map((fila) => independiente[fila]),
      orden: mejor.orden,
      cambio,
    };
  }

  function hesemberg(matriz) {
    const n = matriz.length;
    const h = matriz.map((fila) => fila.slice());
    for (let k = 0; k < n - 2; k += 1) {
      let norma = 0;
      for (let i = k + 1; i < n; i += 1) norma += h[i][k] * h[i][k];
      norma = Math.sqrt(norma);
      if (norma === 0) continue;
      const signo = h[k + 1][k] >= 0 ? 1 : -1;
      const vector = Array(n).fill(0);
      vector[k + 1] = h[k + 1][k] + signo * norma;
      for (let i = k + 2; i < n; i += 1) vector[i] = h[i][k];
      let producto = 0;
      for (let i = k + 1; i < n; i += 1) producto += vector[i] * vector[i];
      const beta = 2 / producto;
      for (let j = k; j < n; j += 1) {
        let punto = 0;
        for (let i = k + 1; i < n; i += 1) punto += vector[i] * h[i][j];
        const escala = beta * punto;
        for (let i = k + 1; i < n; i += 1) h[i][j] -= escala * vector[i];
      }
      for (let i = 0; i < n; i += 1) {
        let punto = 0;
        for (let j = k + 1; j < n; j += 1) punto += h[i][j] * vector[j];
        const escala = beta * punto;
        for (let j = k + 1; j < n; j += 1) h[i][j] -= escala * vector[j];
      }
    }
    return h;
  }

  function autovalores2x2(a, b, c, d) {
    const traza = a + d;
    const discriminante = (traza * traza) / 4 - (a * d - b * c);
    if (discriminante >= 0) {
      const raiz = Math.sqrt(discriminante);
      return [
        { re: traza / 2 + raiz, im: 0 },
        { re: traza / 2 - raiz, im: 0 },
      ];
    }
    const raiz = Math.sqrt(-discriminante);
    return [
      { re: traza / 2, im: raiz },
      { re: traza / 2, im: -raiz },
    ];
  }

  function pasoQR(h, m, desplazamiento) {
    for (let i = 0; i < m; i += 1) h[i][i] -= desplazamiento;
    const cosenos = [];
    const senos = [];
    for (let k = 0; k < m - 1; k += 1) {
      const a = h[k][k];
      const b = h[k + 1][k];
      const hipotenusa = Math.hypot(a, b) || 1;
      const c = a / hipotenusa;
      const s = b / hipotenusa;
      cosenos.push(c);
      senos.push(s);
      for (let j = k; j < m; j += 1) {
        const t1 = h[k][j];
        const t2 = h[k + 1][j];
        h[k][j] = c * t1 + s * t2;
        h[k + 1][j] = -s * t1 + c * t2;
      }
    }
    for (let k = 0; k < m - 1; k += 1) {
      const c = cosenos[k];
      const s = senos[k];
      for (let i = 0; i < m; i += 1) {
        const t1 = h[i][k];
        const t2 = h[i][k + 1];
        h[i][k] = c * t1 + s * t2;
        h[i][k + 1] = -s * t1 + c * t2;
      }
    }
    for (let i = 0; i < m; i += 1) h[i][i] += desplazamiento;
  }

  function autovalores(matriz) {
    const n = matriz.length;
    if (n === 0) return [];
    if (n === 1) return [{ re: matriz[0][0], im: 0 }];
    const h = hesemberg(matriz);
    const encontrados = [];
    let m = n;
    let guardia = 0;
    const limite = 50 * n * n + 20;
    while (m > 0 && guardia < limite) {
      guardia += 1;
      for (let i = 1; i < m; i += 1) {
        const escala = Math.abs(h[i][i]) + Math.abs(h[i - 1][i - 1]);
        if (Math.abs(h[i][i - 1]) <= 1e-12 * (escala + 1)) h[i][i - 1] = 0;
      }
      while (m > 1 && h[m - 1][m - 2] === 0) {
        encontrados.push({ re: h[m - 1][m - 1], im: 0 });
        m -= 1;
      }
      if (m === 1) {
        encontrados.push({ re: h[0][0], im: 0 });
        break;
      }
      if (m >= 2 && (m === 2 || h[m - 2][m - 3] === 0)) {
        const bloque = autovalores2x2(
          h[m - 2][m - 2],
          h[m - 2][m - 1],
          h[m - 1][m - 2],
          h[m - 1][m - 1]
        );
        encontrados.push(bloque[0], bloque[1]);
        m -= 2;
        continue;
      }
      const a = h[m - 2][m - 2];
      const b = h[m - 2][m - 1];
      const c = h[m - 1][m - 2];
      const d = h[m - 1][m - 1];
      const par = autovalores2x2(a, b, c, d);
      const cerca = Math.abs(par[0].re - d) < Math.abs(par[1].re - d) ? par[0].re : par[1].re;
      pasoQR(h, m, cerca);
    }
    return encontrados;
  }

  function radioEspectral(matriz) {
    return autovalores(matriz).reduce((maximo, valor) => {
      return Math.max(maximo, Math.hypot(valor.re, valor.im));
    }, 0);
  }

  function resolverTriangularInferior(triangular, ladoDerecho) {
    const n = ladoDerecho.length;
    const solucion = Array(n);
    for (let i = 0; i < n; i += 1) {
      let suma = ladoDerecho[i];
      for (let j = 0; j < i; j += 1) suma = restar(suma, multiplicar(triangular[i][j], solucion[j]));
      solucion[i] = dividir(suma, triangular[i][i]);
    }
    return solucion;
  }

  function matricesIteracion(matriz, independiente, metodo) {
    const n = matriz.length;
    const ceros = () => Array.from({ length: n }, () => Array(n).fill(0n));
    if (metodo === "jacobi") {
      const t = ceros();
      const c = Array(n);
      for (let i = 0; i < n; i += 1) {
        if (matriz[i][i] === 0n) {
          throw errorUsuario(
            "No se puede despejar x" + (i + 1) + " porque el coeficiente de la diagonal es cero."
          );
        }
        c[i] = dividir(independiente[i], matriz[i][i]);
        for (let j = 0; j < n; j += 1) {
          if (i !== j) t[i][j] = negativo(dividir(matriz[i][j], matriz[i][i]));
        }
      }
      return { t, c };
    }
    const inferior = matriz.map((fila, i) =>
      fila.map((valor, j) => (j <= i ? valor : 0n))
    );
    const superior = matriz.map((fila, i) =>
      fila.map((valor, j) => (j > i ? valor : 0n))
    );
    for (let i = 0; i < n; i += 1) {
      if (inferior[i][i] === 0n) {
        throw errorUsuario(
          "No se puede despejar x" + (i + 1) + " porque el coeficiente de la diagonal es cero."
        );
      }
    }
    const t = ceros();
    for (let j = 0; j < n; j += 1) {
      const columna = superior.map((fila) => negativo(fila[j]));
      const solucion = resolverTriangularInferior(inferior, columna);
      for (let i = 0; i < n; i += 1) t[i][j] = solucion[i];
    }
    const c = resolverTriangularInferior(inferior, independiente.slice());
    return { t, c };
  }

  function mcd(a, b) {
    let x = absoluto(a);
    let y = absoluto(b);
    while (y !== 0n) {
      const resto = x % y;
      x = y;
      y = resto;
    }
    return x === 0n ? 1n : x;
  }

  function razon(numerador, denominador) {
    if (denominador === 0n) throw errorUsuario("División entre cero.");
    if (numerador === 0n) return { negativo: false, cuerpo: "0", cero: true };
    const negativoRazon = (numerador < 0n) !== (denominador < 0n);
    let n = absoluto(numerador);
    let d = absoluto(denominador);
    const comun = mcd(n, d);
    n /= comun;
    d /= comun;
    const cuerpo =
      d <= 1000n && n <= 1000000n
        ? d === 1n
          ? n.toString()
          : n.toString() + "/" + d.toString()
        : formatear(dividir(absoluto(numerador), absoluto(denominador)), 6, false);
    return { negativo: negativoRazon, cuerpo, cero: false };
  }

  function unirTerminos(terminos) {
    const vivos = terminos.filter((termino) => !termino.cero);
    if (!vivos.length) return "0";
    return vivos
      .map((termino, indice) => {
        const signo = termino.negativo ? "− " : indice === 0 ? "" : "+ ";
        let cuerpo = termino.cuerpo;
        if (termino.variable) {
          cuerpo = cuerpo === "1" ? termino.variable : "(" + cuerpo + ") " + termino.variable;
        }
        return signo + cuerpo;
      })
      .join(" ");
  }

  function formulasDe(matriz, independiente, metodo) {
    const n = matriz.length;
    return matriz.map((fila, i) => {
      const terminos = [];
      for (let j = 0; j < n; j += 1) {
        if (j === i || fila[j] === 0n) continue;
        const momento = metodo === "seidel" && j < i ? "k+1" : "k";
        const coeficiente = razon(negativo(fila[j]), fila[i]);
        coeficiente.variable = "x" + subindice(j + 1) + "^(" + momento + ")";
        terminos.push(coeficiente);
      }
      terminos.push(razon(independiente[i], fila[i]));
      return "x" + subindice(i + 1) + "^(k+1) = " + unirTerminos(terminos);
    });
  }

  function sustituirPrimera(matriz, independiente, x0, metodo, cifras, redondearPaso) {
    const n = matriz.length;
    const x = x0.slice();
    const lineas = [];
    for (let i = 0; i < n; i += 1) {
      let suma = independiente[i];
      const terminos = [];
      for (let j = 0; j < n; j += 1) {
        if (j === i || matriz[i][j] === 0n) continue;
        suma = restar(suma, multiplicar(matriz[i][j], x[j]));
        const coeficiente = razon(negativo(matriz[i][j]), matriz[i][i]);
        coeficiente.variable = "(" + formatear(x[j], cifras, redondearPaso) + ")";
        terminos.push(coeficiente);
      }
      terminos.push(razon(independiente[i], matriz[i][i]));
      let nuevo = dividir(suma, matriz[i][i]);
      if (redondearPaso) nuevo = redondear(nuevo, cifras);
      lineas.push(
        "x" +
          subindice(i + 1) +
          "^(1) = " +
          unirTerminos(terminos) +
          " = " +
          formatear(nuevo, cifras, redondearPaso)
      );
      if (metodo === "seidel") x[i] = nuevo;
    }
    return lineas;
  }

  function iterar(matriz, independiente, inicial, opciones, metodo) {
    const n = matriz.length;
    const cifras = opciones.decimales;
    const tope = absoluto(opciones.tolerancia);
    let x = inicial.slice();
    if (opciones.redondear) x = x.map((valor) => redondear(valor, cifras));
    const historial = [
      {
        k: 0,
        x: x.slice(),
        error: null,
      },
    ];
    let estado = "maximo";
    const limiteMagnitud = parsear("1e8");
    for (let k = 1; k <= opciones.maxIter; k += 1) {
      const anterior = x.slice();
      const siguiente = metodo === "jacobi" ? Array(n) : x.slice();
      let explota = false;
      for (let i = 0; i < n; i += 1) {
        let suma = independiente[i];
        for (let j = 0; j < n; j += 1) {
          if (j === i) continue;
          const base = metodo === "jacobi" ? anterior : siguiente;
          suma = restar(suma, multiplicar(matriz[i][j], base[j]));
        }
        let nuevo = dividir(suma, matriz[i][i]);
        if (opciones.redondear) nuevo = redondear(nuevo, cifras);
        if (absoluto(nuevo) > limiteMagnitud) explota = true;
        siguiente[i] = nuevo;
      }
      let error = 0n;
      for (let i = 0; i < n; i += 1) {
        const delta = absoluto(restar(siguiente[i], anterior[i]));
        if (delta > error) error = delta;
      }
      if (opciones.redondear) error = redondear(error, cifras);
      x = siguiente;
      historial.push({ k, x: x.slice(), error });
      if (explota) {
        estado = "diverge";
        break;
      }
      if (error < tope) {
        estado = "converge";
        break;
      }
    }
    return { historial, estado };
  }

  function residuo(matriz, independiente, x) {
    let norma = 0n;
    const vector = matriz.map((fila, i) => {
      let suma = independiente[i];
      for (let j = 0; j < fila.length; j += 1) suma = restar(suma, multiplicar(fila[j], x[j]));
      if (absoluto(suma) > norma) norma = absoluto(suma);
      return suma;
    });
    return { vector, norma };
  }

  function prepararSistema(entrada) {
    const n = entrada.A.length;
    if (n < 2 || n > 8) throw errorUsuario("El sistema debe tener entre 2 y 8 ecuaciones.");
    const matriz = entrada.A.map((fila) => {
      if (fila.length !== n) throw errorUsuario("La matriz A debe ser cuadrada.");
      return fila.map(parsear);
    });
    if (entrada.b.length !== n || entrada.x0.length !== n) {
      throw errorUsuario("b y x⁰ deben tener una componente por ecuación.");
    }
    const independiente = entrada.b.map(parsear);
    const inicial = entrada.x0.map((valor) => (String(valor).trim() === "" ? 0n : parsear(valor)));
    const decimales = Number(entrada.decimales);
    const maxIter = Number(entrada.maxIter);
    if (!Number.isInteger(decimales) || decimales < 0 || decimales > 10) {
      throw errorUsuario("Las cifras decimales deben ser un entero entre 0 y 10.");
    }
    if (!Number.isInteger(maxIter) || maxIter < 1 || maxIter > 500) {
      throw errorUsuario("El máximo de iteraciones debe estar entre 1 y 500.");
    }
    const tolerancia = parsear(entrada.tolerancia);
    if (tolerancia <= 0n) throw errorUsuario("La tolerancia debe ser mayor que cero.");
    let ordenado = {
      matriz: clonarMatriz(matriz),
      independiente: independiente.slice(),
      orden: matriz.map((_, indice) => indice),
      cambio: false,
    };
    if (entrada.reordenar) {
      ordenado = reordenarEcuaciones(matriz, independiente);
    }
    return {
      original: { matriz, independiente, inicial },
      ordenado,
      opciones: {
        decimales,
        maxIter,
        tolerancia,
        redondear: Boolean(entrada.redondear),
      },
    };
  }

  function analizar(preparado, metodo) {
    const { matriz, independiente } = preparado.ordenado;
    const { t, c } = matricesIteracion(matriz, independiente, metodo);
    const numerica = t.map((fila) => fila.map(aNumero));
    const valores = autovalores(numerica);
    const rhoValido =
      valores.length === matriz.length &&
      valores.every((valor) => Number.isFinite(valor.re) && Number.isFinite(valor.im));
    const rho = rhoValido
      ? valores.reduce((maximo, valor) => Math.max(maximo, Math.hypot(valor.re, valor.im)), 0)
      : null;
    const dominancia = margenDiagonal(matriz);
    const corrida = iterar(matriz, independiente, preparado.original.inicial, preparado.opciones, metodo);
    const ultimo = corrida.historial[corrida.historial.length - 1];
    const comprobacion = residuo(matriz, independiente, ultimo.x);
    return {
      metodo,
      t,
      c,
      autovalores: valores,
      rho,
      dominancia,
      historial: corrida.historial,
      estado: corrida.estado,
      formulas: formulasDe(matriz, independiente, metodo),
      primera: sustituirPrimera(
        matriz,
        independiente,
        corrida.historial[0].x,
        metodo,
        preparado.opciones.decimales,
        preparado.opciones.redondear
      ),
      residuo: comprobacion,
      solucion: ultimo.x,
    };
  }

  function resolver(entrada) {
    const preparado = prepararSistema(entrada);
    const metodos = entrada.metodo === "ambos" ? ["jacobi", "seidel"] : [entrada.metodo];
    if (!metodos.every((metodo) => metodo === "jacobi" || metodo === "seidel")) {
      throw errorUsuario("Elija Jacobi, Gauss-Seidel o la comparación.");
    }
    const dominancia = margenDiagonal(preparado.ordenado.matriz);
    return {
      orden: preparado.ordenado.orden,
      cambio: preparado.ordenado.cambio,
      matriz: preparado.ordenado.matriz,
      independiente: preparado.ordenado.independiente,
      inicial: preparado.opciones.redondear
        ? preparado.original.inicial.map((valor) => redondear(valor, preparado.opciones.decimales))
        : preparado.original.inicial,
      opciones: preparado.opciones,
      dominancia,
      advertenciaRedondeo:
        preparado.opciones.redondear &&
        10n ** BigInt(ESCALA - preparado.opciones.decimales) > absoluto(preparado.opciones.tolerancia),
      resultados: metodos.map((metodo) => analizar(preparado, metodo)),
    };
  }

  root.Metodos = {
    resolver,
    formatear,
    parsear,
    aNumero,
    radioEspectral,
    autovalores,
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
