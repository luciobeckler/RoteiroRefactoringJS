const { readFileSync } = require('fs');

// ----- Função utilitária -----

function getPeca(pecas, apresentacao) {
  return pecas[apresentacao.id];
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  }).format(valor / 100);
}

// ----- Classe de Cálculo -----

class ServicoCalculoFatura {
  calcularCredito(pecas, apre) {
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    if (getPeca(pecas, apre).tipo === "comedia")
      creditos += Math.floor(apre.audiencia / 5);
    return creditos;
  }

  calcularTotalCreditos(pecas, apresentacoes) {
    let totalCreditos = 0;
    for (let apre of apresentacoes) {
      totalCreditos += this.calcularCredito(pecas, apre);
    }
    return totalCreditos;
  }

  calcularTotalApresentacao(pecas, apre) {
    let total = 0;
    switch (getPeca(pecas, apre).tipo) {
      case "tragedia":
        total = 40000;
        if (apre.audiencia > 30) {
          total += 1000 * (apre.audiencia - 30);
        }
        break;
      case "comedia":
        total = 30000;
        if (apre.audiencia > 20) {
          total += 10000 + 500 * (apre.audiencia - 20);
        }
        total += 300 * apre.audiencia;
        break;
      default:
        throw new Error(`Peça desconhecida: ${getPeca(pecas, apre).tipo}`);
    }
    return total;
  }

  calcularTotalFatura(pecas, apresentacoes) {
    let total = 0;
    for (let apre of apresentacoes) {
      total += this.calcularTotalApresentacao(pecas, apre);
    }
    return total;
  }
}

// ----- Geração de Fatura Texto -----

function gerarFaturaStr(fatura, pecas, calc) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;
  for (let apre of fatura.apresentacoes) {
    faturaStr += `  ${getPeca(pecas, apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos)\n`;
  }
  faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(pecas, fatura.apresentacoes))}\n`;
  faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(pecas, fatura.apresentacoes)} \n`;
  return faturaStr;
}

// ----- Geração de Fatura HTML (comentada) -----

/*
function gerarFaturaHTML(fatura, pecas) {
  let html = `<html>\n`;
  html += `<p> Fatura ${fatura.cliente} </p>\n`;
  html += `<ul>\n`;
  for (let apre of fatura.apresentacoes) {
    html += `<li>  ${getPeca(pecas, apre).nome}: ${formatarMoeda(calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos) </li>\n`;
  }
  html += `</ul>\n`;
  html += `<p> Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura.apresentacoes))} </p>\n`;
  html += `<p> Créditos acumulados: ${calcularTotalCreditos(pecas, fatura.apresentacoes)} </p>\n`;
  html += `</html>`;
  return html;
}
*/

// ----- Execução Principal -----

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));

const calc = new ServicoCalculoFatura();
const faturaStr = gerarFaturaStr(faturas, pecas, calc);
console.log(faturaStr);

// const faturaHTML = gerarFaturaHTML(faturas, pecas);
// console.log(faturaHTML);
