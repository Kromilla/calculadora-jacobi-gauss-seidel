const fs = require("fs");
const vm = require("vm");
const contexto = {};
contexto.globalThis = contexto;
vm.createContext(contexto);
vm.runInContext(fs.readFileSync("js/solver.js", "utf8"), contexto);
const { resolver, autovalores, radioEspectral } = contexto.Metodos;

function casi(a, b, tol, msg) {
  if (Math.abs(a - b) > tol) {
    throw new Error(msg + " esperado " + b + " obtuvo " + a);
  }
}

const jacobi = [
  ["0.0000", "0.0000", "0.0000"],
  ["0.0000", "2.0000", "-1.0000"],
  ["1.0000", "1.5000", "-0.3333"],
  ["0.8333", "2.3334", "-1.1667"],
  ["1.1667", "1.8333", "-0.7777"],
  ["0.9444", "2.1945", "-1.1667"],
  ["1.0834", "1.8889", "-0.8981"],
  ["0.9537", "2.0927", "-1.0926"],
  ["1.0371", "1.9306", "-0.9382"],
  ["0.9707", "2.0495", "-1.0479"],
  ["1.0201", "1.9614", "-0.9640"],
  ["0.9840", "2.0281", "-1.0263"],
  ["1.0116", "1.9789", "-0.9800"],
  ["0.9913", "2.0158", "-1.0148"],
  ["1.0065", "1.9883", "-0.9889"],
  ["0.9952", "2.0088", "-1.0082"],
  ["1.0036", "1.9935", "-0.9939"],
  ["0.9973", "2.0049", "-1.0046"],
  ["1.0020", "1.9964", "-0.9966"],
  ["0.9985", "2.0027", "-1.0025"],
  ["1.0011", "1.9980", "-0.9981"],
  ["0.9992", "2.0015", "-1.0014"],
  ["1.0006", "1.9989", "-0.9990"],
  ["0.9995", "2.0008", "-1.0008"],
  ["1.0003", "1.9994", "-0.9994"],
  ["0.9998", "2.0005", "-1.0004"],
  ["1.0002", "1.9997", "-0.9997"],
];
const erroresJ = [
  null, "2.0000", "1.0000", "0.8334", "0.5001", "0.3890", "0.3056", "0.2038", "0.1621",
  "0.1189", "0.0881", "0.0667", "0.0492", "0.0369", "0.0275", "0.0205", "0.0153", "0.0114",
  "0.0085", "0.0063", "0.0047", "0.0035", "0.0026", "0.0019", "0.0014", "0.0011", "0.0008",
];
const seidel = [
  ["0.0000", "0.0000", "0.0000"],
  ["0.0000", "2.0000", "-0.3333"],
  ["1.1333", "2.4000", "-0.9555"],
  ["1.2489", "2.1467", "-1.1170"],
  ["1.0646", "1.9738", "-1.0518"],
  ["0.9739", "1.9611", "-0.9956"],
  ["0.9775", "1.9910", "-0.9880"],
  ["0.9970", "2.0045", "-0.9965"],
  ["1.0034", "2.0035", "-1.0011"],
  ["1.0019", "2.0004", "-1.0011"],
  ["1.0000", "1.9995", "-1.0002"],
  ["0.9997", "1.9998", "-0.9999"],
];
const erroresG = [
  null, "2.0000", "1.1333", "0.2533", "0.1843", "0.0907", "0.0299", "0.0195", "0.0064",
  "0.0031", "0.0019", "0.0003",
];

const base = {
  A: [
    ["-1", "2", "-1"],
    ["2", "-1", "3"],
    ["-5", "3", "1"],
  ],
  b: ["4", "-3", "0"],
  x0: ["0", "0", "0"],
  tolerancia: "1e-3",
  decimales: 4,
  maxIter: 100,
  reordenar: true,
  redondear: true,
};

function tabla(resultado) {
  return resultado.historial.map((fila) =>
    fila.x.map((valor) => contexto.Metodos.formatear(valor, 4, true))
  );
}
function errores(resultado) {
  return resultado.historial.map((fila) =>
    fila.error === null ? null : contexto.Metodos.formatear(fila.error, 4, true)
  );
}

const salida = resolver({ ...base, metodo: "ambos" });
if (salida.orden.join() !== "2,0,1") throw new Error("orden " + salida.orden);
if (salida.dominancia.estricta) throw new Error("no debe ser estricta");
const [j, g] = salida.resultados;
if (JSON.stringify(tabla(j)) !== JSON.stringify(jacobi)) {
  console.log(JSON.stringify(tabla(j), null, 2));
  throw new Error("tabla Jacobi");
}
if (JSON.stringify(errores(j)) !== JSON.stringify(erroresJ)) throw new Error("errores Jacobi");
if (JSON.stringify(tabla(g)) !== JSON.stringify(seidel)) {
  console.log(JSON.stringify(tabla(g)));
  throw new Error("tabla Seidel");
}
if (JSON.stringify(errores(g)) !== JSON.stringify(erroresG)) throw new Error("errores Seidel");
if (j.estado !== "converge" || g.estado !== "converge") throw new Error("estado");
casi(j.rho, 0.7461289913199889, 1e-8, "rhoJ");
casi(g.rho, 0.447213595499958, 1e-8, "rhoG");
const formulasJ = [
  "x₁^(k+1) = (3/5) x₂^(k) + (1/5) x₃^(k)",
  "x₂^(k+1) = (1/2) x₁^(k) + (1/2) x₃^(k) + 2",
  "x₃^(k+1) = − (2/3) x₁^(k) + (1/3) x₂^(k) − 1",
];
const formulasG = [
  "x₁^(k+1) = (3/5) x₂^(k) + (1/5) x₃^(k)",
  "x₂^(k+1) = (1/2) x₁^(k+1) + (1/2) x₃^(k) + 2",
  "x₃^(k+1) = − (2/3) x₁^(k+1) + (1/3) x₂^(k+1) − 1",
];
if (JSON.stringify(j.formulas) !== JSON.stringify(formulasJ)) {
  throw new Error("formulas Jacobi " + JSON.stringify(j.formulas));
}
if (JSON.stringify(g.formulas) !== JSON.stringify(formulasG)) {
  throw new Error("formulas Seidel " + JSON.stringify(g.formulas));
}
if (j.primera[2] !== "x₃^(1) = − (2/3) (0.0000) + (1/3) (0.0000) − 1 = -1.0000") {
  throw new Error("primera Jacobi " + j.primera[2]);
}
if (g.primera[2] !== "x₃^(1) = − (2/3) (0.0000) + (1/3) (2.0000) − 1 = -0.3333") {
  throw new Error("primera Seidel " + g.primera[2]);
}
if (j.historial.length !== 27 || g.historial.length !== 12) throw new Error("largo");

const rot = autovalores([
  [0, -2],
  [2, 0],
]);
const radios = rot.map((v) => Math.hypot(v.re, v.im)).sort();
casi(radios[0], 2, 1e-8, "rot0");
casi(radios[1], 2, 1e-8, "rot1");
casi(radioEspectral([[1, 0, 0], [0, -4, 0], [0, 0, 3]]), 4, 1e-8, "diag");

const sdd = resolver({
  A: [
    ["10", "-1", "2"],
    ["-1", "11", "-1"],
    ["2", "-1", "10"],
  ],
  b: ["6", "25", "-11"],
  x0: ["0", "0", "0"],
  tolerancia: "0.001",
  decimales: 4,
  maxIter: 50,
  reordenar: true,
  redondear: true,
  metodo: "seidel",
});
if (!sdd.dominancia.estricta) throw new Error("deberia ser SDD");
if (sdd.resultados[0].estado !== "converge") throw new Error("sdd no converge");

console.log("ok", "rhoJ", j.rho, "rhoG", g.rho, "kJ", j.historial.at(-1).k, "kG", g.historial.at(-1).k);
