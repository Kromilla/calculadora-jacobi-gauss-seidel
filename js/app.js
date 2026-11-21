(function () {
  const grilla = document.getElementById("grilla");
  const resultado = document.getElementById("resultado");
  const tamano = document.getElementById("tamano");
  const ejemploCurso = {
    A: [
      ["-1", "2", "-1"],
      ["2", "-1", "3"],
      ["-5", "3", "1"],
    ],
    b: ["4", "-3", "0"],
    x0: ["0", "0", "0"],
  };
  let notaCargada = "";

  function nodo(tag, clase, texto) {
    const el = document.createElement(tag);
    if (clase) el.className = clase;
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  function metodoActivo() {
    return document.querySelector('input[name="metodo"]:checked').value;
  }

  function normaActiva() {
    const elegido = document.querySelector('input[name="norma"]:checked');
    return elegido ? elegido.value : "inf";
  }

  function claveNorma(norma) {
    if (norma === "1") return "n1";
    if (norma === "2") return "n2";
    return "inf";
  }

  function simboloNorma(norma) {
    if (norma === "1") return "₁";
    if (norma === "2") return "₂";
    return "∞";
  }

  function nombreNorma(norma) {
    if (norma === "1") return "norma 1";
    if (norma === "2") return "norma 2";
    return "norma infinito";
  }

  function leerMatriz() {
    const n = Number(tamano.value);
    const A = [];
    const b = [];
    const x0 = [];
    for (let i = 0; i < n; i += 1) {
      const fila = [];
      for (let j = 0; j < n; j += 1) fila.push(grilla.querySelector(`[data-a="${i}-${j}"]`).value);
      A.push(fila);
      b.push(grilla.querySelector(`[data-b="${i}"]`).value);
      x0.push(grilla.querySelector(`[data-x="${i}"]`).value);
    }
    return { A, b, x0 };
  }

  function construirGrilla(datos) {
    const n = Number(tamano.value);
    const tabla = nodo("table", "matriz-entrada");
    const cabeza = nodo("thead");
    const filaCabeza = nodo("tr");
    filaCabeza.append(nodo("th", "", ""));
    for (let j = 0; j < n; j += 1) filaCabeza.append(nodo("th", "", "x" + (j + 1)));
    filaCabeza.append(nodo("th", "", "b"));
    filaCabeza.append(nodo("th", "", "x⁰"));
    cabeza.append(filaCabeza);
    tabla.append(cabeza);
    const cuerpo = nodo("tbody");
    for (let i = 0; i < n; i += 1) {
      const fila = nodo("tr");
      fila.append(nodo("th", "", "ec. " + (i + 1)));
      for (let j = 0; j < n; j += 1) {
        const celda = nodo("td");
        const entrada = nodo("input");
        entrada.dataset.a = i + "-" + j;
        entrada.setAttribute("aria-label", "coeficiente a" + (i + 1) + (j + 1));
        entrada.value = datos && datos.A[i] && datos.A[i][j] !== undefined ? datos.A[i][j] : "";
        entrada.inputMode = "decimal";
        celda.append(entrada);
        fila.append(celda);
      }
      const celdaB = nodo("td", "corte");
      const entradaB = nodo("input");
      entradaB.dataset.b = String(i);
      entradaB.setAttribute("aria-label", "término independiente " + (i + 1));
      entradaB.value = datos && datos.b[i] !== undefined ? datos.b[i] : "";
      entradaB.inputMode = "decimal";
      celdaB.append(entradaB);
      fila.append(celdaB);
      const celdaX = nodo("td");
      const entradaX = nodo("input");
      entradaX.dataset.x = String(i);
      entradaX.setAttribute("aria-label", "valor inicial x" + (i + 1));
      entradaX.value = datos && datos.x0[i] !== undefined ? datos.x0[i] : "0";
      entradaX.inputMode = "decimal";
      celdaX.append(entradaX);
      fila.append(celdaX);
      cuerpo.append(fila);
    }
    tabla.append(cuerpo);
    grilla.replaceChildren(tabla);
  }

  function fmt(valor, cifras, fijo) {
    return Metodos.formatear(valor, cifras, fijo);
  }

  function fmtFlex(valor, cifras) {
    const texto = fmt(valor, cifras, true);
    if (!texto.includes(".")) return texto;
    const limpio = texto.replace(/0+$/, "").replace(/\.$/, "");
    return limpio === "-0" ? "0" : limpio;
  }

  function lineaNorma(simbolo, valor, radical, cifras) {
    if (valor === null || valor === undefined) return simbolo + " no se pudo calcular.";
    const numero = fmtFlex(valor, cifras);
    if (radical && radical !== numero) return simbolo + " = " + radical + " = " + numero;
    return simbolo + " = " + numero;
  }

  function sincronizarMetodo() {
  }

  function tituloMetodo(metodo) {
    return metodo === "jacobi" ? "Método de Jacobi" : "Método de Gauss-Seidel";
  }

  function matrizHtml(matriz, cifras) {
    const tabla = nodo("table", "mini matriz-salida");
    matriz.forEach((fila) => {
      const tr = nodo("tr");
      fila.forEach((valor) => tr.append(nodo("td", "", fmt(valor, cifras, false))));
      tabla.append(tr);
    });
    return tabla;
  }

  function vectorHtml(vector, cifras) {
    return matrizHtml(vector.map((valor) => [valor]), cifras);
  }

  function textoAutovalor(valor) {
    const re = valor.re;
    const im = valor.im;
    const base = Math.max(Math.abs(re), Math.abs(im), 1);
    if (Math.abs(im) <= base * 1e-8) return re.toFixed(6).replace(/\.?0+$/, "") || "0";
    const real = Math.abs(re) <= base * 1e-8 ? "" : re.toFixed(6).replace(/\.?0+$/, "");
    const imag = Math.abs(im).toFixed(6).replace(/\.?0+$/, "");
    const signo = im < 0 ? " − " : " + ";
    return (real || "0") + signo + imag + "i";
  }

  function bloqueEstado(analisis, norma) {
    const caja = nodo("div", "estado");
    const ultimo = analisis.historial[analisis.historial.length - 1];
    if (analisis.estado === "converge") {
      caja.textContent =
        "Se alcanzó ‖x⁽" +
        ultimo.k +
        "⁾ − x⁽" +
        (ultimo.k - 1) +
        "⁾‖" +
        simboloNorma(norma) +
        " < tolerancia en la iteración " +
        ultimo.k +
        ". La norma de paro es la " +
        nombreNorma(norma) +
        ".";
      return caja;
    }
    caja.classList.add("falla");
    caja.textContent =
      analisis.estado === "diverge"
        ? "Las componentes crecieron sin control y el proceso se detuvo."
        : "Se llegó al máximo de iteraciones sin cumplir la tolerancia.";
    return caja;
  }

  function bloqueConvergencia(analisis) {
    const seccion = nodo("div");
    seccion.append(nodo("h3", "", "Convergencia"));
    const lista = nodo("ul", "filas");
    const dom = analisis.dominancia;
    lista.append(nodo("li", "", dom.frase || (dom.estricta ? "Es estrictamente diagonal dominante." : "No es estrictamente diagonal dominante.")));
    dom.filas.forEach((fila) => {
      if (fila.texto) {
        lista.append(nodo("li", "", fila.texto));
        return;
      }
      const diag = fmt(fila.diagonal, 6, false);
      const fuera = fmt(fila.fuera, 6, false);
      lista.append(
        nodo(
          "li",
          "",
          "Fila " + (fila.indice + 1) + ": |" + diag + "| " + (fila.cumple ? "> " : "no supera a ") + fuera + "."
        )
      );
    });
    if (analisis.rho === null) {
      lista.append(nodo("li", "", "No se pudo calcular el radio espectral."));
    } else {
      lista.append(
        nodo(
          "li",
          "",
          "ρ(T) = " + analisis.rho.toFixed(6) + (analisis.rho < 1 ? " < 1." : " ≥ 1.")
        )
      );
      lista.append(
        nodo(
          "li",
          "",
          "Autovalores: " + analisis.autovalores.map(textoAutovalor).join(", ") + "."
        )
      );
    }
    seccion.append(lista);
    const conclusion = nodo("p", "estado");
    const rhoBien = analisis.rho !== null && analisis.rho < 1;
    if (dom.estricta && rhoBien) {
      conclusion.textContent =
        "Se cumplen las dos condiciones del curso. El método converge para cualquier aproximación inicial.";
    } else if (dom.estricta) {
      conclusion.textContent =
        "A es estrictamente diagonal dominante, así que el método converge para cualquier aproximación inicial.";
    } else if (rhoBien) {
      conclusion.classList.add("aviso");
      conclusion.textContent =
        dom.tipo === "dominante"
          ? "A es diagonal dominante, con igualdad en alguna fila. Como ρ(T) < 1, el método converge para cualquier aproximación inicial."
          : "A no es estrictamente diagonal dominante. Como ρ(T) < 1, el método igual converge para cualquier aproximación inicial.";
    } else {
      conclusion.classList.add("falla");
      conclusion.textContent =
        "No se garantiza la convergencia para cualquier x⁰. La tabla igual muestra esta aproximación inicial.";
    }
    seccion.append(conclusion);
    return seccion;
  }

  function tablaIteraciones(analisis, cifras, tolerancia, norma) {
    const envoltorio = nodo("div", "contenedor-tabla");
    const tabla = nodo("table", "tabla-num");
    const cabeza = nodo("thead");
    const filaCabeza = nodo("tr");
    const clave = claveNorma(norma);
    const columnas = [
      { clave: "k", texto: "k" },
      ...analisis.solucion.map((_, i) => ({ clave: "x", texto: "x" + (i + 1) })),
      { clave: "n1", texto: "‖Δx‖₁" },
      { clave: "n2", texto: "‖Δx‖₂" },
      { clave: "inf", texto: "‖Δx‖∞" },
    ];
    columnas.forEach((columna) => {
      const th = nodo("th", columna.clave === clave ? "elegida" : "", columna.texto);
      filaCabeza.append(th);
    });
    cabeza.append(filaCabeza);
    tabla.append(cabeza);
    const cuerpo = nodo("tbody");
    analisis.historial.forEach((paso, indice) => {
      const fila = nodo("tr");
      if (indice === analisis.historial.length - 1 && analisis.estado === "converge") {
        fila.className = "fila-final";
      }
      fila.append(nodo("td", "", String(paso.k)));
      paso.x.forEach((valor) => fila.append(nodo("td", "", fmt(valor, cifras, true))));
      ["n1", "n2", "inf"].forEach((cual) => {
        if (!paso.normas) {
          fila.append(nodo("td", cual === clave ? "elegida" : "", "—"));
          return;
        }
        const celda = nodo("td", cual === clave ? "elegida" : "", fmt(paso.normas[cual], cifras, true));
        if (cual === clave && paso.normas[cual] < tolerancia) celda.classList.add("cumple");
        fila.append(celda);
      });
      cuerpo.append(fila);
    });
    tabla.append(cuerpo);
    envoltorio.append(tabla);
    return envoltorio;
  }

  function grafica(series) {
    const puntos = series.flatMap((serie) => serie.puntos);
    if (puntos.length < 2) return null;
    const ancho = 680;
    const alto = 210;
    const margen = { izq: 52, der: 12, arr: 16, aba: 28 };
    const positivos = puntos.map((punto) => punto.error).filter((error) => error > 0);
    const piso = Math.max(Math.min(...positivos, 1), 1e-12);
    const techo = Math.max(...positivos, piso * 10);
    const yLog = (error) => Math.log10(Math.max(error, piso));
    const y0 = yLog(piso);
    const y1 = yLog(techo);
    const kMin = Math.min(...puntos.map((punto) => punto.k));
    const kMax = Math.max(...puntos.map((punto) => punto.k));
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 " + ancho + " " + alto);
    svg.setAttribute("class", "grafica");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Error de cada iteración en escala logarítmica");
    function xDe(k) {
      if (kMax === kMin) return margen.izq;
      return margen.izq + ((k - kMin) / (kMax - kMin)) * (ancho - margen.izq - margen.der);
    }
    function yDe(error) {
      return margen.arr + (1 - (yLog(error) - y0) / (y1 - y0 || 1)) * (alto - margen.arr - margen.aba);
    }
    const eje = document.createElementNS("http://www.w3.org/2000/svg", "path");
    eje.setAttribute(
      "d",
      "M" + margen.izq + " " + margen.arr + " V" + (alto - margen.aba) + " H" + (ancho - margen.der)
    );
    eje.setAttribute("fill", "none");
    eje.setAttribute("stroke", "#c9bfae");
    svg.append(eje);
    [piso, techo].forEach((error, indice) => {
      const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
      texto.setAttribute("x", "4");
      texto.setAttribute("y", String(yDe(error) + 4));
      texto.setAttribute("fill", "#5c6570");
      texto.setAttribute("font-size", "11");
      texto.textContent = error.toExponential(0);
      if (indice === 1 || Math.abs(Math.log10(techo) - Math.log10(piso)) > 0.2) svg.append(texto);
    });
    series.forEach((serie) => {
      const camino = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      camino.setAttribute(
        "points",
        serie.puntos.map((punto) => xDe(punto.k) + "," + yDe(punto.error)).join(" ")
      );
      camino.setAttribute("fill", "none");
      camino.setAttribute("stroke", serie.color);
      camino.setAttribute("stroke-width", "2.4");
      camino.setAttribute("stroke-linejoin", "round");
      svg.append(camino);
    });
    return svg;
  }

  function bloqueMetodo(analisis, salida) {
    const cifras = salida.opciones.decimales;
    const norma = salida.opciones.norma || "inf";
    const bloque = nodo("article", "bloque");
    const cabeza = nodo("div", "bloque-cabeza");
    cabeza.append(nodo("h2", "", tituloMetodo(analisis.metodo)));
    cabeza.append(
      nodo(
        "span",
        "etiqueta " + analisis.metodo,
        analisis.metodo === "jacobi" ? "usa la iteración anterior" : "usa lo recién calculado"
      )
    );
    bloque.append(cabeza);
    bloque.append(bloqueEstado(analisis, norma));
    const solucion = nodo("p");
    solucion.append(nodo("strong", "", "Aproximación: "));
    solucion.append(
      document.createTextNode(
        "( " + analisis.solucion.map((valor) => fmt(valor, cifras, true)).join(", ") + " )"
      )
    );
    bloque.append(solucion);
    bloque.append(
      nodo(
        "p",
        "texto-corto",
        "Comprobación ‖Ax − b‖∞ = " +
          fmt(analisis.residuo.norma, cifras, true) +
          ". El paro no usa el residuo. Usa la " +
          nombreNorma(norma) +
          " de la diferencia entre iteraciones."
      )
    );

    const columnas = nodo("div", "dos");
    const formulas = nodo("div");
    formulas.append(nodo("h3", "", "Fórmulas de iteración"));
    const lista = nodo("ol", "formulas");
    analisis.formulas.forEach((formula) => lista.append(nodo("li", "", formula)));
    formulas.append(lista);
    const pasos = nodo("div");
    pasos.append(nodo("h3", "", "Primera iteración"));
    const listaPasos = nodo("ul", "pasos");
    analisis.primera.forEach((linea) => listaPasos.append(nodo("li", "", linea)));
    pasos.append(listaPasos);
    columnas.append(formulas, pasos);
    bloque.append(columnas);

    bloque.append(bloqueConvergencia(analisis));
    const matrices = nodo("div", "dos");
    const cajaT = nodo("div");
    cajaT.append(
      nodo(
        "h3",
        "",
        analisis.metodo === "jacobi"
          ? "Tⱼ = −D⁻¹(L + U)"
          : "T_G = −(D + L)⁻¹U"
      )
    );
    cajaT.append(matrizHtml(analisis.t, 6));
    const cajaC = nodo("div");
    cajaC.append(nodo("h3", "", analisis.metodo === "jacobi" ? "cⱼ = D⁻¹b" : "c_G = (D + L)⁻¹b"));
    cajaC.append(vectorHtml(analisis.c, 6));
    matrices.append(cajaT, cajaC);
    bloque.append(matrices);

    bloque.append(nodo("h3", "", "Iteraciones"));
    bloque.append(
      nodo(
        "p",
        "texto-corto",
        "En cada fila están las tres normas de la diferencia con la iteración anterior. La columna resaltada es la " +
          nombreNorma(norma) +
          ", y el proceso se detiene cuando esa norma baja de la tolerancia."
      )
    );
    bloque.append(tablaIteraciones(analisis, cifras, salida.opciones.tolerancia, norma));
    return bloque;
  }

  function claseLectura(lectura) {
    if (lectura === "si" || lectura === "bien") return "estado";
    if (lectura === "mal" || lectura === "no") return "estado aviso";
    return "";
  }

  function pintar(salida) {
    resultado.replaceChildren();
    if (salida.advertenciaRedondeo) {
      const aviso = nodo(
        "p",
        "estado aviso",
        "La tolerancia es más fina que el redondeo. El error solo puede bajar de una unidad en la última cifra, o llegar a cero."
      );
      resultado.append(aviso);
    }

    const sistema = nodo("article", "bloque");
    sistema.append(nodo("h2", "", "Sistema usado"));
    let ordenTexto;
    if (!document.getElementById("reordenar").checked) {
      ordenTexto = "La reordenación está apagada. El cálculo usa las ecuaciones en el orden escrito.";
    } else if (salida.cambio) {
      ordenTexto =
        "Las ecuaciones se reordenaron para llevar a la diagonal el coeficiente de mayor valor absoluto. Orden: ecuación " +
        salida.orden.map((indice) => indice + 1).join(", ") +
        ".";
    } else {
      ordenTexto = "No hizo falta cambiar el orden: la diagonal ya concentra los mayores coeficientes.";
    }
    sistema.append(nodo("p", "", ordenTexto));
    const vista = nodo("div", "rejilla-datos");
    const ladoA = nodo("div");
    ladoA.append(nodo("h3", "", "Matriz A ordenada"));
    ladoA.append(matrizHtml(salida.matriz, 8));
    const ladoB = nodo("div");
    ladoB.append(nodo("h3", "", "Vector b"));
    ladoB.append(vectorHtml(salida.independiente, 8));
    vista.append(ladoA, ladoB);
    sistema.append(vista);
    resultado.append(sistema);

    if (salida.resultados.length === 2) {
      const comparacion = nodo("article", "bloque");
      comparacion.append(nodo("h2", "", "Comparación"));
      const cajas = nodo("div", "comparacion");
      salida.resultados.forEach((analisis) => {
        const pastilla = nodo("div", "pastilla");
        pastilla.append(nodo("span", "", tituloMetodo(analisis.metodo)));
        const ultima = analisis.historial[analisis.historial.length - 1];
        pastilla.append(nodo("strong", "", analisis.estado === "converge" ? ultima.k + " iteraciones" : "sin tolerancia"));
        cajas.append(pastilla);
      });
      comparacion.append(cajas);
      const jacobi = salida.resultados[0];
      const seidel = salida.resultados[1];
      if (jacobi.estado === "converge" && seidel.estado === "converge") {
        comparacion.append(
          nodo(
            "p",
            "",
            "Gauss-Seidel llegó en " +
              seidel.historial.at(-1).k +
              " iteraciones y Jacobi en " +
              jacobi.historial.at(-1).k +
              ". Gauss-Seidel reutiliza cada componente nueva y, en este sistema, llega antes."
          )
        );
      }
      const series = [
        {
          color: "#0f4f4c",
          puntos: jacobi.historial.filter((paso) => paso.paro !== null).map((paso) => ({
            k: paso.k,
            error: Metodos.aNumero(paso.paro),
          })),
        },
        {
          color: "#8a4632",
          puntos: seidel.historial.filter((paso) => paso.paro !== null).map((paso) => ({
            k: paso.k,
            error: Metodos.aNumero(paso.paro),
          })),
        },
      ];
      const dibujo = grafica(series);
      if (dibujo) {
        const leyenda = nodo("div", "leyenda");
        const a = nodo("span", "", "Jacobi");
        const b = nodo("span", "", "Gauss-Seidel");
        a.prepend(nodo("i", "punto"));
        b.prepend(nodo("i", "punto"));
        a.querySelector(".punto").style.background = "#0f4f4c";
        b.querySelector(".punto").style.background = "#8a4632";
        leyenda.append(a, b);
        comparacion.append(nodo("h3", "", "Norma de paro por iteración"));
        comparacion.append(leyenda);
        comparacion.append(dibujo);
      }
      resultado.append(comparacion);
    } else {
      const analisis = salida.resultados[0];
      const dibujo = grafica([
        {
          color: analisis.metodo === "jacobi" ? "#0f4f4c" : "#8a4632",
          puntos: analisis.historial
            .filter((paso) => paso.paro !== null)
            .map((paso) => ({ k: paso.k, error: Metodos.aNumero(paso.paro) })),
        },
      ]);
      if (dibujo) {
        const bloque = nodo("article", "bloque");
        bloque.append(nodo("h2", "", "Caída de la norma de paro"));
        bloque.append(dibujo);
        resultado.append(bloque);
      }
    }

    salida.resultados.forEach((analisis) => resultado.append(bloqueMetodo(analisis, salida)));
  }

  function mostrarError(mensaje) {
    resultado.replaceChildren(nodo("p", "estado falla", mensaje));
  }

  function calcular() {
    try {
      const datos = leerMatriz();
      const salida = Metodos.resolver({
        ...datos,
        metodo: metodoActivo(),
        tolerancia: document.getElementById("tolerancia").value,
        decimales: Number(document.getElementById("decimales").value),
        maxIter: Number(document.getElementById("maximo").value),
        reordenar: document.getElementById("reordenar").checked,
        redondear: document.getElementById("redondear").checked,
        norma: normaActiva(),
      });
      pintar(salida);
    } catch (error) {
      mostrarError(error.usuario ? error.message : "No se pudo completar el cálculo.");
      if (!error.usuario) console.error(error);
    }
  }

  document.getElementById("panel").addEventListener("submit", (evento) => {
    evento.preventDefault();
    notaCargada = "";
    calcular();
  });

  document.querySelectorAll('input[name="metodo"]').forEach((entrada) => {
    entrada.addEventListener("change", sincronizarMetodo);
  });

  tamano.addEventListener("change", () => {
    let n = Number(tamano.value);
    if (!Number.isInteger(n) || n < 2) n = 2;
    if (n > 8) n = 8;
    // Leer la grilla ANTES de cambiar tamano, usando el tamaño real actual
    let previo = null;
    if (grilla.querySelector("input")) {
      const oldSize = grilla.querySelectorAll("tbody tr").length;
      tamano.value = String(oldSize);
      previo = leerMatriz();
    }
    tamano.value = String(n);
    construirGrilla(previo);
  });

  document.getElementById("ejemplo").addEventListener("click", () => {
    tamano.value = "3";
    construirGrilla(ejemploCurso);
    document.getElementById("tolerancia").value = "0.001";
    document.getElementById("decimales").value = "4";
    document.getElementById("maximo").value = "100";
    document.getElementById("reordenar").checked = true;
    document.getElementById("redondear").checked = true;
    document.querySelector('input[name="metodo"][value="ambos"]').checked = true;
    document.querySelector('input[name="norma"][value="inf"]').checked = true;
    notaCargada = "";
    sincronizarMetodo();
    calcular();
  });


  document.getElementById("limpiar").addEventListener("click", () => {
    tamano.value = "3";
    construirGrilla({
      A: [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ],
      b: ["", "", ""],
      x0: ["0", "0", "0"],
    });
    notaCargada = "";
    resultado.replaceChildren(nodo("p", "vacio", "Escriba el sistema, cargue el ejemplo iterativo o un ejemplo de la Parte 1."));
  });

  construirGrilla(ejemploCurso);
  calcular();
})();
