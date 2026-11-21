/* Calculadora de Jacobi y Gauss-Seidel.
   Reglas del curso (sistemas lineales, partes 2 y 3):
   - Jacobi usa solo la iteración anterior.
   - Gauss-Seidel usa de inmediato cada componente nueva.
   - En cada iteración se calculan las normas 1, 2 e infinito
     de la diferencia entre dos iteraciones consecutivas.
   - El paro usa la norma elegida. Por defecto, la norma infinito:
     ||x^(k) - x^(k-1)||_inf < tolerancia.
   - Redondeo half away from zero en cada componente nueva
     y en las tres normas, cuando el redondeo está activo.
   - Converge para cualquier x0 si A es estrictamente diagonal
     dominante o si el radio espectral de T es menor que 1.
   - Se reordenan ecuaciones para dejar en la diagonal el mayor
     valor absoluto de cada fila, cuando eso es posible.
   Parte 1, además de esas normas vectoriales: normas matriciales
   1, infinito, Frobenius y espectral; número de condición;
   diagonal dominante estricta o no; definida positiva por Sylvester. */
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

  function raizEntera(valor) {
    if (valor <= 0n) return 0n;
    let x = valor;
    let y = (x + 1n) / 2n;
    while (y < x) {
      x = y;
      y = (x + valor / x) / 2n;
    }
    const resto = valor - x * x;
    if (resto * 4n >= x * 4n + 1n) return x + 1n;
    return x;
  }

  function normasDiferencia(siguiente, anterior) {
    let suma = 0n;
    let sumaCuadrados = 0n;
    let infinito = 0n;
    for (let i = 0; i < siguiente.length; i += 1) {
      const delta = absoluto(restar(siguiente[i], anterior[i]));
      suma += delta;
      sumaCuadrados += multiplicar(delta, delta);
      if (delta > infinito) infinito = delta;
    }
    return { n1: suma, n2: raizEntera(sumaCuadrados * UNO), inf: infinito };
  }

  function normaElegida(entrada) {
    if (entrada.norma === undefined || entrada.norma === null || String(entrada.norma).trim() === "") {
      return "inf";
    }
    const texto = String(entrada.norma).trim().toLowerCase();
    if (texto === "1" || texto === "n1") return "1";
    if (texto === "2" || texto === "n2") return "2";
    if (texto === "inf" || texto === "infinito" || texto === "∞") return "inf";
    throw errorUsuario("Elija la norma 1, la norma 2 o la norma infinito.");
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

  function recortar(valor, cifras) {
    const texto = formatear(valor, cifras, true);
    if (!texto.includes(".")) return texto;
    const limpio = texto.replace(/0+$/, "").replace(/\.$/, "");
    return limpio === "-0" ? "0" : limpio;
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
      const relacion = diagonal > fuera ? "mayor" : diagonal === fuera ? "igual" : "menor";
      const cumple = relacion === "mayor";
      if (!cumple) estricta = false;
      if (peor === null || margen < peor) peor = margen;
      sumaDiagonal += diagonal;
      filas.push({ indice: i, diagonal, fuera, margen, cumple, relacion });
    }
    let tipo = "estricta";
    if (filas.some((fila) => fila.relacion === "menor")) tipo = "no";
    else if (filas.some((fila) => fila.relacion === "igual")) tipo = "dominante";
    return { estricta, peor, sumaDiagonal, filas, tipo };
  }

  function describirDominancia(matriz) {
    const info = margenDiagonal(matriz);
    info.filas.forEach((fila, i) => {
      const partes = [];
      for (let j = 0; j < matriz.length; j += 1) {
        if (j !== i) partes.push("|" + recortar(matriz[i][j], 8) + "|");
      }
      const simbolo = fila.relacion === "mayor" ? ">" : fila.relacion === "igual" ? "≥" : "≯";
      fila.texto =
        "Fila " +
        (i + 1) +
        ": |" +
        recortar(matriz[i][i], 8) +
        "| " +
        simbolo +
        " " +
        (partes.join(" + ") || "0") +
        " = " +
        recortar(fila.fuera, 8);
    });
    info.frase =
      info.tipo === "estricta"
        ? "Por tanto, es estrictamente diagonal dominante."
        : info.tipo === "dominante"
          ? "Por tanto, es diagonal dominante. Hay igualdad en alguna fila, así que no es estrictamente diagonal dominante."
          : "Por tanto, no es diagonal dominante.";
    return info;
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
        normas: null,
        paro: null,
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
      const crudas = normasDiferencia(siguiente, anterior);
      const normas = {
        n1: opciones.redondear ? redondear(crudas.n1, cifras) : crudas.n1,
        n2: opciones.redondear ? redondear(crudas.n2, cifras) : crudas.n2,
        inf: opciones.redondear ? redondear(crudas.inf, cifras) : crudas.inf,
      };
      const error = normas.inf;
      const paro = opciones.norma === "1" ? normas.n1 : opciones.norma === "2" ? normas.n2 : normas.inf;
      x = siguiente;
      historial.push({ k, x: x.slice(), error, normas, paro });
      if (explota) {
        estado = "diverge";
        break;
      }
      if (paro < tope) {
        estado = "converge";
        break;
      }
    }
    return { historial, estado };
  }

  function raiz(valor) {
    if (valor <= 0n) return 0n;
    return raizEntera(valor * UNO);
  }

  function radicalDeSuma(sumaCuadrados) {
    if (sumaCuadrados % UNO !== 0n) return null;
    const entero = sumaCuadrados / UNO;
    if (entero > 1000000n) return null;
    let x = entero;
    if (x > 1n) {
      let y = (x + 1n) / 2n;
      while (y < x) {
        x = y;
        y = (x + entero / x) / 2n;
      }
    }
    if (x * x === entero) return null;
    return "√" + entero.toString();
  }

  function limpiarAutovalor(valor) {
    let re = valor.re;
    let im = valor.im;
    if (!Number.isFinite(re) || !Number.isFinite(im)) return valor;
    if (Math.abs(im) <= 1e-8 * (Math.abs(re) + 1)) im = 0;
    if (Math.abs(re - Math.round(re)) <= 1e-8) re = Math.round(re);
    return { re, im };
  }

  function limpiarReal(numero) {
    if (!Number.isFinite(numero)) return numero;
    const redondo = Math.round(numero);
    if (Math.abs(numero - redondo) <= 1e-8) return redondo;
    return numero;
  }

  function desdeNumero(numero) {
    if (!Number.isFinite(numero)) return null;
    const magnitud = Math.abs(numero);
    if (magnitud === 0) return 0n;
    if (magnitud > 1e12) return null;
    try {
      const valor = parsear(magnitud.toPrecision(15));
      return numero < 0 ? -valor : valor;
    } catch (error) {
      return null;
    }
  }

  function rhoDe(valores) {
    if (!valores.length) return null;
    return valores.reduce((maximo, valor) => Math.max(maximo, Math.hypot(valor.re, valor.im)), 0);
  }

  function textoLambda(valor) {
    if (valor.im === 0) {
      const fijo = desdeNumero(valor.re);
      return fijo === null ? String(valor.re) : recortar(fijo, 8);
    }
    const real = desdeNumero(valor.re);
    const imag = desdeNumero(Math.abs(valor.im));
    const signo = valor.im < 0 ? " − " : " + ";
    return (real === null ? String(valor.re) : recortar(real, 8)) + signo + (imag === null ? String(Math.abs(valor.im)) : recortar(imag, 8)) + "i";
  }

  function transpuesta(matriz) {
    return matriz[0].map((_, columna) => matriz.map((fila) => fila[columna]));
  }

  function productoMatrices(izquierda, derecha) {
    return izquierda.map((fila) =>
      derecha[0].map((_, columna) => {
        let suma = 0n;
        for (let k = 0; k < derecha.length; k += 1) suma = sumar(suma, multiplicar(fila[k], derecha[k][columna]));
        return suma;
      })
    );
  }

  function esSimetrica(matriz) {
    for (let i = 0; i < matriz.length; i += 1) {
      for (let j = 0; j < i; j += 1) {
        if (matriz[i][j] !== matriz[j][i]) return false;
      }
    }
    return true;
  }

  function racional(numerador, denominador) {
    if (denominador === 0n) throw errorUsuario("División entre cero.");
    let n = numerador;
    let d = denominador;
    if (d < 0n) {
      n = -n;
      d = -d;
    }
    const comun = mcd(n, d);
    return { n: n / comun, d: d / comun };
  }

  function rSuma(a, b) {
    return racional(a.n * b.d + b.n * a.d, a.d * b.d);
  }

  function rResta(a, b) {
    return racional(a.n * b.d - b.n * a.d, a.d * b.d);
  }

  function rMul(a, b) {
    return racional(a.n * b.n, a.d * b.d);
  }

  function rDiv(a, b) {
    if (b.n === 0n) throw errorUsuario("División entre cero.");
    return racional(a.n * b.d, a.d * b.n);
  }

  function aRacional(valor) {
    return racional(valor, UNO);
  }

  function racionalAFijo(fraccion) {
    if (fraccion.n === 0n) return 0n;
    const num = fraccion.n * UNO;
    const negativo = (num < 0n) !== (fraccion.d < 0n);
    const mag = absoluto(num);
    const den = absoluto(fraccion.d);
    const cociente = mag / den;
    const residuo = mag % den;
    const ajustado = residuo * 2n >= den ? cociente + 1n : cociente;
    return negativo ? -ajustado : ajustado;
  }

  function determinanteMatriz(matriz) {
    const n = matriz.length;
    if (n === 1) return matriz[0][0];
    const a = matriz.map((fila) => fila.map(aRacional));
    let det = racional(1n, 1n);
    for (let k = 0; k < n; k += 1) {
      let pivote = k;
      if (a[k][k].n === 0n) {
        for (let i = k + 1; i < n; i += 1) {
          if (a[i][k].n !== 0n) {
            pivote = i;
            break;
          }
        }
      }
      if (a[pivote][k].n === 0n) return 0n;
      if (pivote !== k) {
        const temporal = a[k];
        a[k] = a[pivote];
        a[pivote] = temporal;
        det = rMul(det, racional(-1n, 1n));
      }
      det = rMul(det, a[k][k]);
      for (let i = k + 1; i < n; i += 1) {
        const factor = rDiv(a[i][k], a[k][k]);
        for (let j = k; j < n; j += 1) a[i][j] = rResta(a[i][j], rMul(factor, a[k][j]));
      }
    }
    return racionalAFijo(det);
  }

  function invertirMatriz(matriz) {
    const n = matriz.length;
    const a = matriz.map((fila, i) => {
      const extendida = fila.map(aRacional);
      for (let j = 0; j < n; j += 1) extendida.push(i === j ? racional(1n, 1n) : racional(0n, 1n));
      return extendida;
    });
    for (let k = 0; k < n; k += 1) {
      let pivote = k;
      if (a[k][k].n === 0n) {
        for (let i = k + 1; i < n; i += 1) {
          if (a[i][k].n !== 0n) {
            pivote = i;
            break;
          }
        }
      }
      if (a[pivote][k].n === 0n) return null;
      if (pivote !== k) {
        const temporal = a[k];
        a[k] = a[pivote];
        a[pivote] = temporal;
      }
      const divisor = a[k][k];
      for (let j = k; j < 2 * n; j += 1) a[k][j] = rDiv(a[k][j], divisor);
      for (let i = 0; i < n; i += 1) {
        if (i === k || a[i][k].n === 0n) continue;
        const factor = a[i][k];
        for (let j = k; j < 2 * n; j += 1) a[i][j] = rResta(a[i][j], rMul(factor, a[k][j]));
      }
    }
    return a.map((fila) => fila.slice(n).map(racionalAFijo));
  }

  function principal(matriz, k) {
    return matriz.slice(0, k).map((fila) => fila.slice(0, k));
  }

  function formaCuadratica(matriz, vector) {
    let total = 0n;
    for (let i = 0; i < matriz.length; i += 1) {
      let producto = 0n;
      for (let j = 0; j < matriz.length; j += 1) producto = sumar(producto, multiplicar(matriz[i][j], vector[j]));
      total = sumar(total, multiplicar(vector[i], producto));
    }
    return total;
  }

  function calcularNormas(matriz, cifras) {
    const n = matriz.length;
    const txt = (valor) => recortar(valor, cifras);
    const columnas = [];
    let norma1 = null;
    for (let j = 0; j < n; j += 1) {
      let suma = 0n;
      const partes = [];
      for (let i = 0; i < n; i += 1) {
        suma += absoluto(matriz[i][j]);
        partes.push("|" + txt(matriz[i][j]) + "|");
      }
      if (norma1 === null || suma > norma1) norma1 = suma;
      columnas.push({
        indice: j,
        suma,
        texto: "Columna " + (j + 1) + ": " + partes.join(" + ") + " = " + txt(suma),
      });
    }
    const filas = [];
    let normaInf = null;
    for (let i = 0; i < n; i += 1) {
      let suma = 0n;
      const partes = [];
      for (let j = 0; j < n; j += 1) {
        suma += absoluto(matriz[i][j]);
        partes.push("|" + txt(matriz[i][j]) + "|");
      }
      if (normaInf === null || suma > normaInf) normaInf = suma;
      filas.push({
        indice: i,
        suma,
        texto: "Fila " + (i + 1) + ": " + partes.join(" + ") + " = " + txt(suma),
      });
    }
    const cuadrados = [];
    let sumaCuadrados = 0n;
    for (let i = 0; i < n; i += 1) {
      for (let j = 0; j < n; j += 1) {
        const cuadrado = multiplicar(matriz[i][j], matriz[i][j]);
        cuadrados.push(cuadrado);
        sumaCuadrados += cuadrado;
      }
    }
    const normaF = raiz(sumaCuadrados);
    const radicalF = radicalDeSuma(sumaCuadrados);
    const simetrica = esSimetrica(matriz);
    const ata = productoMatrices(transpuesta(matriz), matriz);
    const autovaloresATA = autovalores(ata.map((fila) => fila.map(aNumero))).map(limpiarAutovalor);
    const autovaloresA = autovalores(matriz.map((fila) => fila.map(aNumero))).map(limpiarAutovalor);
    const rhoATA = autovaloresATA.length === n ? limpiarReal(rhoDe(autovaloresATA)) : null;
    const rhoA = autovaloresA.length === n ? limpiarReal(rhoDe(autovaloresA)) : null;
    let norma2 = rhoATA === null ? null : desdeNumero(Math.sqrt(rhoATA));
    if (simetrica && rhoA !== null) {
      const porRadio = desdeNumero(rhoA);
      if (porRadio !== null && (norma2 === null || absoluto(porRadio - norma2) <= UNO / 1000n)) norma2 = porRadio;
    }
    const pasos = [
      ...columnas.map((columna) => columna.texto),
      "‖A‖₁ = max{" + columnas.map((columna) => txt(columna.suma)).join(", ") + "} = " + txt(norma1),
      ...filas.map((fila) => fila.texto),
      "‖A‖∞ = max{" + filas.map((fila) => txt(fila.suma)).join(", ") + "} = " + txt(normaInf),
      "‖A‖F = √(" +
        cuadrados.map((cuadrado) => txt(cuadrado)).join(" + ") +
        ") = " +
        (radicalF || txt(normaF)),
    ];
    if (simetrica) pasos.push("A es simétrica, así que Aᵀ = A.");
    else pasos.push("‖A‖₂ = √ρ(AᵀA).");
    if (autovaloresATA.length === n) {
      pasos.push("Autovalores de AᵀA: " + autovaloresATA.map(textoLambda).join(", ") + ".");
      pasos.push("ρ(AᵀA) = max{|λᵢ|} = " + (rhoATA === null ? "—" : txt(desdeNumero(rhoATA))));
    }
    if (norma2 !== null) pasos.push("‖A‖₂ = " + txt(norma2) + ".");
    if (simetrica && rhoA !== null) pasos.push("Como A es simétrica, ‖A‖₂ = ρ(A) = " + txt(desdeNumero(rhoA)) + ".");
    const desigualdades = [];
    [
      ["₁", norma1],
      ["∞", normaInf],
      ["F", normaF],
      ["₂", norma2],
    ].forEach(([simbolo, norma]) => {
      if (rhoA === null || norma === null) return;
      const cabe = aNumero(norma) + 1e-6 >= rhoA;
      desigualdades.push(
        "ρ(A) = " +
          txt(desdeNumero(rhoA)) +
          (cabe ? " ≤ " : " comparado con ") +
          "‖A‖" +
          simbolo +
          " = " +
          txt(norma)
      );
    });
    return {
      norma1,
      normaInf,
      normaF,
      radicalF,
      norma2,
      simetrica,
      ata,
      autovaloresATA,
      autovaloresA,
      rhoATA,
      rhoA,
      pasos,
      desigualdades,
    };
  }

  function fraseKappa(titulo, normaA, normaInv, kappa, cifras) {
    const visibleA = redondear(normaA, cifras);
    const visibleInv = redondear(normaInv, cifras);
    const visibleKappa = multiplicar(visibleA, visibleInv);
    const valor = aNumero(kappa);
    let lectura = "criterio";
    let cierre = "";
    if (valor <= 2) {
      lectura = "bien";
      cierre = " Este valor está cerca de 1: la matriz está bien condicionada.";
    } else if (valor >= 1000) {
      lectura = "mal";
      cierre = " Este valor cumple κ ≫ 1: la matriz está mal condicionada.";
    }
    return {
      titulo,
      normaA,
      normaInv,
      kappa,
      lectura,
      frase:
        titulo +
        " = " +
        recortar(visibleA, cifras) +
        " × " +
        recortar(visibleInv, cifras) +
        " = " +
        recortar(visibleKappa, cifras) +
        ". Una matriz está bien condicionada si κ está cerca de 1 y mal condicionada si κ ≫ 1." +
        cierre,
    };
  }

  function analizarDefinida(matriz, vector, cifras, normas) {
    const simetrica = normas.simetrica;
    const txt = (valor) => recortar(valor, cifras);
    if (!simetrica) {
      return {
        lectura: "no-simetrica",
        frase: "La presentación define la matriz definida positiva para una matriz simétrica. Esta matriz no es simétrica.",
        menores: [],
        pares: [],
        diagonal: "",
        mayor: "",
        forma: "",
        autovalores: "",
      };
    }
    const menores = [];
    for (let k = 1; k <= matriz.length; k += 1) {
      const valor = determinanteMatriz(principal(matriz, k));
      const texto =
        "Δ" +
        subindice(k) +
        " = " +
        txt(valor) +
        (valor > 0n ? " > 0." : valor === 0n ? " = 0." : " < 0.");
      menores.push({ k, valor, texto });
    }
    const pares = [];
    for (let i = 0; i < matriz.length; i += 1) {
      for (let j = i + 1; j < matriz.length; j += 1) {
        const cumple = matriz[i][j] * matriz[i][j] < matriz[i][i] * matriz[j][j];
        const marca = "a" + subindice(i + 1) + subindice(j + 1);
        const di = "a" + subindice(i + 1) + subindice(i + 1);
        const dj = "a" + subindice(j + 1) + subindice(j + 1);
        pares.push(
          marca +
            "² = " +
            txt(multiplicar(matriz[i][j], matriz[i][j])) +
            " y " +
            di +
            "·" +
            dj +
            " = " +
            txt(multiplicar(matriz[i][i], matriz[j][j])) +
            ". " +
            (cumple ? "Se cumple " : "No se cumple ") +
            marca +
            "² < " +
            di +
            "·" +
            dj +
            "."
        );
      }
    }
    const negativas = [];
    for (let i = 0; i < matriz.length; i += 1) {
      if (matriz[i][i] <= 0n) {
        negativas.push("a" + subindice(i + 1) + subindice(i + 1) + " = " + txt(matriz[i][i]) + " ≤ 0.");
      }
    }
    const diagonal = negativas.length
      ? negativas.join(" ") + " En una matriz definida positiva la diagonal es positiva."
      : "Todos los elementos de la diagonal son positivos.";
    let mayorValor = matriz[0][0];
    for (let i = 0; i < matriz.length; i += 1) {
      for (let j = 0; j < matriz.length; j += 1) {
        if (matriz[i][j] > mayorValor) mayorValor = matriz[i][j];
      }
    }
    const enDiagonal = matriz.some((fila, i) => fila[i] === mayorValor);
    const mayor =
      "El mayor elemento es " +
      txt(mayorValor) +
      (enDiagonal ? " y está en la diagonal principal." : " y queda fuera de la diagonal principal.");
    const nulo = vector.every((componente) => componente === 0n);
    let forma = "x⁰ es el vector cero. La definición usa vectores distintos de cero.";
    let contraejemplo = false;
    if (!nulo) {
      const valor = formaCuadratica(matriz, vector);
      const componentes = "(" + vector.map((componente) => txt(componente)).join(", ") + ")";
      if (valor > 0n) {
        forma =
          "Para x⁰ = " +
          componentes +
          ", xᵀAx = " +
          txt(valor) +
          " > 0. La definición pide que esto ocurra para todo vector distinto de cero.";
      } else {
        contraejemplo = true;
        forma =
          "Para x⁰ = " +
          componentes +
          ", xᵀAx = " +
          txt(valor) +
          (valor === 0n ? " = 0." : " < 0.") +
          " Por la definición, la matriz no es definida positiva.";
      }
    }
    const autovalores =
      normas.autovaloresA.length === matriz.length
        ? "Autovalores de A: " +
          normas.autovaloresA.map(textoLambda).join(", ") +
          ". Si la matriz es definida positiva, el teorema dice que todos son positivos."
        : "";
    let lectura = "no";
    let frase =
      "Hay un menor principal que no es positivo. Por el criterio de Sylvester, la matriz no es definida positiva.";
    if (contraejemplo) {
      frase = "La forma cuadrática no es positiva para el vector ingresado. Por la definición, la matriz no es definida positiva.";
    } else if (menores.every((menor) => menor.valor > 0n)) {
      lectura = "si";
      frase = "Todos los menores principales son positivos. Por el criterio de Sylvester, la matriz es definida positiva.";
    }
    return { lectura, frase, menores, pares, diagonal, mayor, forma, autovalores };
  }

  function analizarNormas(matriz, vectores, cifras) {
    const digitos = Number.isInteger(cifras) ? cifras : 8;
    const txt = (valor) => recortar(valor, digitos);
    const descritos = vectores.map((dato) => {
      const absolutos = dato.vector.map(absoluto);
      const norma1 = absolutos.reduce((suma, valor) => suma + valor, 0n);
      const cuadrados = dato.vector.map((valor) => multiplicar(valor, valor));
      const sumaCuadrados = cuadrados.reduce((suma, valor) => suma + valor, 0n);
      const norma2 = raiz(sumaCuadrados);
      const radical2 = radicalDeSuma(sumaCuadrados);
      const normaInf = absolutos.reduce((maximo, valor) => (valor > maximo ? valor : maximo), 0n);
      return {
        nombre: dato.nombre,
        norma1,
        norma2,
        normaInf,
        radical2,
        pasos: [
          "‖" + dato.nombre + "‖₁ = " + absolutos.map(txt).join(" + ") + " = " + txt(norma1),
          "‖" +
            dato.nombre +
            "‖₂ = √(" +
            cuadrados.map(txt).join(" + ") +
            ") = " +
            (radical2 || txt(norma2)),
          "‖" + dato.nombre + "‖∞ = max{" + absolutos.map(txt).join(", ") + "} = " + txt(normaInf),
        ],
      };
    });
    const normas = calcularNormas(matriz, digitos);
    const determinante = determinanteMatriz(matriz);
    const inversa = determinante === 0n ? null : invertirMatriz(matriz);
    const singular = inversa === null;
    let kappas = [];
    let fraseSingular = "";
    if (singular) {
      fraseSingular = "det(A) = 0. El número de condición se define cuando A es no singular.";
    } else {
      const deInversa = calcularNormas(inversa, digitos);
      const pares = [
        ["inf", "κ∞(A) = ‖A‖∞ ‖A⁻¹‖∞", normas.normaInf, deInversa.normaInf],
        ["1", "κ₁(A) = ‖A‖₁ ‖A⁻¹‖₁", normas.norma1, deInversa.norma1],
        ["F", "κF(A) = ‖A‖F ‖A⁻¹‖F", normas.normaF, deInversa.normaF],
        ["2", "κ₂(A) = ‖A‖₂ ‖A⁻¹‖₂", normas.norma2, deInversa.norma2],
      ];
      kappas = pares
        .filter((par) => par[2] !== null && par[3] !== null)
        .map((par) => fraseKappa(par[1], par[2], par[3], multiplicar(par[2], par[3]), digitos));
      kappas.forEach((kappa) => {
        kappa.clave = pares.find((par) => par[1] === kappa.titulo)[0];
      });
    }
    const vectorX = (vectores.find((dato) => dato.nombre === "x⁰") || vectores[0]).vector;
    return {
      vectores: descritos,
      ...normas,
      determinante,
      inversa,
      singular,
      kappas,
      fraseSingular,
      dominancia: describirDominancia(matriz),
      definida: analizarDefinida(matriz, vectorX, digitos, normas),
    };
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
        norma: normaElegida(entrada),
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
    const dominancia = describirDominancia(matriz);
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
    if (entrada.metodo === "normas") {
      const matriz = preparado.original.matriz;
      const propiedades = analizarNormas(
        matriz,
        [
          { nombre: "x⁰", vector: preparado.original.inicial },
          { nombre: "b", vector: preparado.original.independiente },
        ],
        preparado.opciones.decimales
      );
      return {
        modo: "normas",
        orden: matriz.map((_, indice) => indice),
        cambio: false,
        matriz,
        independiente: preparado.original.independiente,
        inicial: preparado.original.inicial,
        opciones: preparado.opciones,
        dominancia: propiedades.dominancia,
        propiedades,
        resultados: [],
      };
    }
    const metodos = entrada.metodo === "ambos" ? ["jacobi", "seidel"] : [entrada.metodo];
    if (!metodos.every((metodo) => metodo === "jacobi" || metodo === "seidel")) {
      throw errorUsuario("Elija normas, Jacobi, Gauss-Seidel o la comparación.");
    }
    const inicial = preparado.opciones.redondear
      ? preparado.original.inicial.map((valor) => redondear(valor, preparado.opciones.decimales))
      : preparado.original.inicial;
    const propiedades = analizarNormas(
      preparado.ordenado.matriz,
      [
        { nombre: "x⁰", vector: inicial },
        { nombre: "b", vector: preparado.ordenado.independiente },
      ],
      preparado.opciones.decimales
    );
    return {
      modo: "iterativo",
      orden: preparado.ordenado.orden,
      cambio: preparado.ordenado.cambio,
      matriz: preparado.ordenado.matriz,
      independiente: preparado.ordenado.independiente,
      inicial,
      opciones: preparado.opciones,
      dominancia: propiedades.dominancia,
      propiedades,
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
