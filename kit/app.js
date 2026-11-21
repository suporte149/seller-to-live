(() => {
  "use strict";

  const DEFAULTS = {
    margem: {
      preco: "129.90",
      custo: "48.00",
      marketplace: "18.0",
      frete: "16.50",
      imposto: "6.0",
      gateway: "1.5",
    },
    oferta: {
      produto: "Kit Organizador Térmico Modular 3 Peças",
      publico: "Profissionais que levam marmita e lanches para o trabalho ou faculdade",
      problema: "Evita vazamentos na bolsa e mantém refeições na temperatura ideal por horas sem bagunça",
      diferencial: "Vedação dupla antivazamento, forro térmico lavável em segundos e divisórias modulares",
      condicao: "R$ 129,90 à vista no Pix ou em até 3x sem juros no cartão",
    },
    liveBonus: "10% OFF no cupom LIVE10 + kit de etiquetas térmicas para pedidos feitos até o fim da live",
  };

  const brlFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const pctFormatter = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  function formatBRL(cents) {
    return brlFormatter.format(cents / 100);
  }

  function toCents(value) {
    const num = Number.parseFloat(String(value).replace(",", "."));
    if (!Number.isFinite(num) || num < 0) return 0;
    return Math.round(num * 100);
  }

  function toPercent(value) {
    const num = Number.parseFloat(String(value).replace(",", "."));
    if (!Number.isFinite(num) || num < 0) return 0;
    return Math.min(num, 100);
  }

  // --- Tabs ---
  const tabButtons = Array.from(document.querySelectorAll(".tab-btn"));
  const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));

  function activateTab(tabName) {
    tabButtons.forEach((btn) => {
      const isTarget = btn.dataset.tab === tabName;
      btn.classList.toggle("is-active", isTarget);
      btn.setAttribute("aria-selected", String(isTarget));
    });

    tabPanels.forEach((panel) => {
      const isTarget = panel.id === `panel-${tabName}`;
      panel.classList.toggle("is-active", isTarget);
      panel.hidden = !isTarget;
    });
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => activateTab(btn.dataset.tab));
  });

  // --- 1. Calculadora de Margem Real ---
  const calcInputs = {
    preco: document.getElementById("calc-preco"),
    custo: document.getElementById("calc-custo"),
    marketplace: document.getElementById("calc-marketplace"),
    frete: document.getElementById("calc-frete"),
    imposto: document.getElementById("calc-imposto"),
    gateway: document.getElementById("calc-gateway"),
  };

  const calcOutputs = {
    receita: document.getElementById("out-receita"),
    custos: document.getElementById("out-custos"),
    lucro: document.getElementById("out-lucro"),
    margem: document.getElementById("out-margem"),
    badge: document.getElementById("margem-badge"),
    bdCusto: document.getElementById("bd-custo"),
    bdFrete: document.getElementById("bd-frete"),
    bdMarketplace: document.getElementById("bd-marketplace"),
    bdImposto: document.getElementById("bd-imposto"),
    bdGateway: document.getElementById("bd-gateway"),
  };

  function updateMargem() {
    const precoCents = toCents(calcInputs.preco.value);
    const custoCents = toCents(calcInputs.custo.value);
    const freteCents = toCents(calcInputs.frete.value);

    const pctMarketplace = toPercent(calcInputs.marketplace.value);
    const pctImposto = toPercent(calcInputs.imposto.value);
    const pctGateway = toPercent(calcInputs.gateway.value);

    const marketplaceCents = Math.round(precoCents * (pctMarketplace / 100));
    const impostoCents = Math.round(precoCents * (pctImposto / 100));
    const gatewayCents = Math.round(precoCents * (pctGateway / 100));

    const totalCustosCents =
      custoCents + freteCents + marketplaceCents + impostoCents + gatewayCents;
    const lucroCents = precoCents - totalCustosCents;
    const margemPct = precoCents > 0 ? (lucroCents / precoCents) * 100 : 0;

    calcOutputs.receita.textContent = formatBRL(precoCents);
    calcOutputs.custos.textContent = formatBRL(totalCustosCents);
    calcOutputs.lucro.textContent = formatBRL(lucroCents);
    calcOutputs.margem.textContent = `${pctFormatter.format(margemPct)}%`;

    calcOutputs.bdCusto.textContent = formatBRL(custoCents);
    calcOutputs.bdFrete.textContent = formatBRL(freteCents);
    calcOutputs.bdMarketplace.textContent = formatBRL(marketplaceCents);
    calcOutputs.bdImposto.textContent = formatBRL(impostoCents);
    calcOutputs.bdGateway.textContent = formatBRL(gatewayCents);

    const badge = calcOutputs.badge;
    badge.classList.remove("status-healthy", "status-warning", "status-critical");

    if (precoCents === 0) {
      badge.textContent = "Informe o preço";
      badge.classList.add("status-warning");
    } else if (margemPct >= 20) {
      badge.textContent = "Saudável (≥ 20%)";
      badge.classList.add("status-healthy");
    } else if (margemPct >= 10) {
      badge.textContent = "Atenção (10%–19,9%)";
      badge.classList.add("status-warning");
    } else if (lucroCents < 0) {
      badge.textContent = "Prejuízo";
      badge.classList.add("status-critical");
    } else {
      badge.textContent = "Crítico (< 10%)";
      badge.classList.add("status-critical");
    }
  }

  Object.values(calcInputs).forEach((el) => {
    el.addEventListener("input", updateMargem);
  });

  // --- 2. Gerador de Oferta & Anúncio ---
  const ofertaInputs = {
    produto: document.getElementById("of-produto"),
    publico: document.getElementById("of-publico"),
    problema: document.getElementById("of-problema"),
    diferencial: document.getElementById("of-diferencial"),
    condicao: document.getElementById("of-condicao"),
  };

  const liveInputs = {
    produto: document.getElementById("lv-produto"),
    publico: document.getElementById("lv-publico"),
    problema: document.getElementById("lv-problema"),
    diferencial: document.getElementById("lv-diferencial"),
    condicao: document.getElementById("lv-condicao"),
    bonus: document.getElementById("lv-bonus"),
  };

  const outTitulos = document.getElementById("out-titulos");
  const outBullets = document.getElementById("out-bullets");
  const outDescricao = document.getElementById("out-descricao");
  const outObjecoes = document.getElementById("out-objecoes");
  const outRoteiro = document.getElementById("roteiro-output");

  function valOrFallback(el, fallback) {
    const trimmed = el.value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

  function buildOfertaData() {
    const produto = valOrFallback(ofertaInputs.produto, "Produto Principal");
    const publico = valOrFallback(ofertaInputs.publico, "quem busca praticidade no dia a dia");
    const problema = valOrFallback(ofertaInputs.problema, "reduz atritos e falhas no uso diário");
    const diferencial = valOrFallback(ofertaInputs.diferencial, "acabamento reforçado e fácil manutenção");
    const condicao = valOrFallback(ofertaInputs.condicao, "condição especial no Pix ou parcelado");

    const titulos = [
      `${produto} — ${diferencial.split(",")[0]}`,
      `${produto} para ${publico}`,
      `${produto}: solução prática que ${problema.charAt(0).toLowerCase() + problema.slice(1)}`,
    ];

    const bullets = [
      `Foco em quem precisa: desenvolvido para ${publico}.`,
      `Resolve o ponto crítico: ${problema}.`,
      `Diferencial construtivo: ${diferencial}.`,
      `Uso direto sem complicação: pronto para a rotina desde o primeiro dia.`,
      `Condição transparente: ${condicao}.`,
    ];

    const descricao = [
      `O QUE É:`,
      `${produto}, pensado para ${publico}.`,
      ``,
      `POR QUE ESCOLHER ESTE MODELO:`,
      `• Problema resolvido: ${problema}.`,
      `• Diferencial na prática: ${diferencial}.`,
      ``,
      `CONDIÇÃO COMERCIAL:`,
      `${condicao}.`,
      ``,
      `GARANTIA E SUPORTE:`,
      `Produto conferido antes do envio, com nota fiscal e suporte direto para dúvidas de uso.`,
    ].join("\n");

    const objecoes = [
      `1. "Será que funciona mesmo para a minha rotina?" — O projeto prioriza justamente ${problema.toLowerCase()}, com foco em ${publico.toLowerCase()}.`,
      `2. "E se der trabalho para limpar ou usar?" — Conta com ${diferencial.toLowerCase()}, reduzindo manutenção no dia a dia.`,
      `3. "Vale o investimento agora?" — Você leva por ${condicao}, com entrega rastreada e nota fiscal.`,
    ];

    return { titulos, bullets, descricao, objecoes };
  }

  function renderOferta() {
    const data = buildOfertaData();

    outTitulos.innerHTML = "";
    data.titulos.forEach((t) => {
      const li = document.createElement("li");
      li.textContent = t;
      outTitulos.appendChild(li);
    });

    outBullets.innerHTML = "";
    data.bullets.forEach((b) => {
      const li = document.createElement("li");
      li.textContent = b;
      outBullets.appendChild(li);
    });

    outDescricao.textContent = data.descricao;

    outObjecoes.innerHTML = "";
    data.objecoes.forEach((o) => {
      const li = document.createElement("li");
      li.textContent = o;
      outObjecoes.appendChild(li);
    });
  }

  // --- 3. Roteiro de Live Commerce (15 min) ---
  function buildRoteiroBlocks() {
    const produto = valOrFallback(liveInputs.produto, "nosso produto destaque");
    const publico = valOrFallback(liveInputs.publico, "você que acompanha a live");
    const problema = valOrFallback(liveInputs.problema, "imprevistos na rotina");
    const diferencial = valOrFallback(liveInputs.diferencial, "acabamento e praticidade reais");
    const condicao = valOrFallback(liveInputs.condicao, "valor promocional de catálogo");
    const bonus = valOrFallback(liveInputs.bonus, "condição exclusiva válida apenas durante esta transmissão");

    return [
      {
        time: "00:00 – 02:00",
        title: "Gancho e Retenção",
        body:
          `Abertura direta na câmera: "Se você faz parte do grupo de ${publico} e ainda sofre com ${problema.toLowerCase()}, fica nos próximos 15 minutos que eu vou mostrar ao vivo o ${produto}."\n` +
          `Interação rápida: peça para quem chegou comentar a cidade e clicar no coração para destravar a condição da live.`,
      },
      {
        time: "02:00 – 07:00",
        title: "Demonstração e Prova",
        body:
          `Mostre o ${produto} em uso real, sem cortes. Aproxime da câmera para evidenciar ${diferencial.toLowerCase()}.\n` +
          `Responda 2 dúvidas comuns do chat sobre tamanho, material ou durabilidade e reforce como ele resolve ${problema.toLowerCase()}.`,
      },
      {
        time: "07:00 – 12:00",
        title: "Oferta Relâmpago e Escassez Ética",
        body:
          `Apresente o valor base (${condicao}) e ative a condição da live: "${bonus}."\n` +
          `Fixe o link/sacolinha na tela e explique o critério real da oferta (estoque separado para a transmissão ou bônus válido até encerrar os 15 minutos).`,
      },
      {
        time: "12:00 – 15:00",
        title: "Fechamento e Última Chamada",
        body:
          `Recapitule em 30 segundos: produto (${produto}), diferencial (${diferencial}) e condição da live (${bonus}).\n` +
          `Avise os últimos 3 minutos, tire a última dúvida do chat e oriente o clique imediato no link antes de encerrar a transmissão.`,
      },
    ];
  }

  function renderRoteiro() {
    const blocks = buildRoteiroBlocks();
    outRoteiro.innerHTML = "";

    blocks.forEach((block) => {
      const card = document.createElement("article");
      card.className = "timeline-block";

      const time = document.createElement("span");
      time.className = "timeline-time";
      time.textContent = block.time;

      const title = document.createElement("h3");
      title.textContent = block.title;

      const body = document.createElement("p");
      body.textContent = block.body;

      card.append(time, title, body);
      outRoteiro.appendChild(card);
    });
  }

  // Sync Oferta -> Live inputs when edited in Oferta
  Object.keys(ofertaInputs).forEach((key) => {
    ofertaInputs[key].addEventListener("input", () => {
      liveInputs[key].value = ofertaInputs[key].value;
      renderOferta();
      renderRoteiro();
    });
  });

  // Live inputs update Roteiro directly
  Object.values(liveInputs).forEach((el) => {
    el.addEventListener("input", renderRoteiro);
  });

  // --- Clipboard helpers ---
  async function copyTextWithFeedback(button, text, defaultLabel, copiedLabel) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const temp = document.createElement("textarea");
      temp.value = text;
      temp.style.position = "fixed";
      temp.style.opacity = "0";
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
    }

    button.textContent = copiedLabel;
    button.classList.add("is-copied");
    window.setTimeout(() => {
      button.textContent = defaultLabel;
      button.classList.remove("is-copied");
    }, 2000);
  }

  const btnCopiarOferta = document.getElementById("btn-copiar-oferta");
  btnCopiarOferta.addEventListener("click", () => {
    const data = buildOfertaData();
    const fullText = [
      "TÍTULOS OTIMIZADOS:",
      ...data.titulos.map((t, idx) => `${idx + 1}. ${t}`),
      "",
      "BULLETS DE BENEFÍCIOS:",
      ...data.bullets.map((b) => `• ${b}`),
      "",
      "DESCRIÇÃO ESTRUTURADA:",
      data.descricao,
      "",
      "QUEBRAS DE OBJEÇÃO:",
      ...data.objecoes,
    ].join("\n");

    copyTextWithFeedback(btnCopiarOferta, fullText, "Copiar Tudo", "Copiado!");
  });

  const btnCopiarRoteiro = document.getElementById("btn-copiar-roteiro");
  btnCopiarRoteiro.addEventListener("click", () => {
    const blocks = buildRoteiroBlocks();
    const fullText = blocks
      .map((b) => `[${b.time}] ${b.title.toUpperCase()}\n${b.body}`)
      .join("\n\n");

    copyTextWithFeedback(btnCopiarRoteiro, fullText, "Copiar Roteiro", "Roteiro Copiado!");
  });

  // --- Reset Demo ---
  function applyDefaults() {
    Object.keys(DEFAULTS.margem).forEach((k) => {
      calcInputs[k].value = DEFAULTS.margem[k];
    });
    Object.keys(DEFAULTS.oferta).forEach((k) => {
      ofertaInputs[k].value = DEFAULTS.oferta[k];
      liveInputs[k].value = DEFAULTS.oferta[k];
    });
    liveInputs.bonus.value = DEFAULTS.liveBonus;

    updateMargem();
    renderOferta();
    renderRoteiro();
  }

  document.getElementById("btn-reset-demo").addEventListener("click", applyDefaults);

  // Initial render
  applyDefaults();
})();
