// --- CONSTANTES E DADOS ---
const BASE_PLAN = {
    base_monthly_no_modules: 1084.00, // Valor base sem módulos
    module_compras_cost: 216.00, // Custo do módulo Compras (1300 - 1084)
    module_additional_cost: 216.80, // Custo dos módulos Cotação e Reposição (20% de 1084)

    base_cnpj: 1,
    base_sku: 10000,
    base_users: 2,
    setup_cost: 15600,
    add_user: 50,
    add_cnpj: 450, // Custo adicional por CNPJ
    add_sku: 250 // Custo adicional por 10.000 SKUs
};

const EXPERIMENTATION_MULTIPLIER = 0.3; // +30% para experimentacao de 3 meses

const NEW_ERP_INTEGRATION_COST = 15600; // Custo de nova integracao ERP

// --- ELEMENTOS DO DOM ---
const elements = {};

function cacheDOMElements() {
    // Inputs do Plano
    elements.inputCnpj = document.getElementById("input-cnpj");
    elements.inputSku = document.getElementById("input-sku");
    elements.inputUsers = document.getElementById("input-users");

    // Outputs do Plano
    elements.totalMonthlyCost = document.getElementById("total-monthly-cost");
    elements.totalAnnualCost = document.getElementById("total-annual-cost");

    // Elementos de Modulos
    elements.moduloCompras = document.getElementById("modulo-compras");
    elements.moduloReposicao = document.getElementById("modulo-reposicao");
    elements.moduloCotacao = document.getElementById("modulo-cotacao");
    
    // Elemento de Nova Integracao ERP
    elements.novaIntegracaoCheckbox = document.getElementById("nova-integracao-checkbox");
    
    // Elemento de Experimentacao
    elements.experimentacaoCheckbox = document.getElementById("experimentacao-checkbox");
    
    // Elemento de Pagamento a Vista
    elements.avistaCheckbox = document.getElementById("avista-checkbox");

    // Inputs de ROI - Excesso
    elements.inputStockValue = document.getElementById("input-stock-value");
    elements.inputExcessPercentage = document.getElementById("input-excess-percentage");
    elements.isTotalStockCheckbox = document.getElementById("is-total-stock-checkbox");

    // Outputs de ROI - Excesso
    elements.excessStockValue = document.getElementById("excess-stock-value");
    elements.reduction20Value = document.getElementById("reduction-20-value");
    elements.reduction30Value = document.getElementById("reduction-30-value");

    // Inputs de ROI - Ruptura
    elements.inputMonthlySales = document.getElementById("input-monthly-sales");
    elements.inputRupturePercentage = document.getElementById("input-rupture-percentage");
    elements.inputRuptureReduction = document.getElementById("input-rupture-reduction");
    elements.inputFiliais = document.getElementById("input-filiais");

    // Outputs de ROI - Ruptura
    elements.ruptureLossValue = document.getElementById("rupture-loss-value");
    elements.ruptureRecoveryValue = document.getElementById("rupture-recovery-value");

    // Outputs de ROI - Resumo
    elements.excessSavings = document.getElementById("excess-savings");
    elements.ruptureSavings = document.getElementById("rupture-savings");
    elements.totalSavings = document.getElementById("total-savings");
    elements.roiFinalPercentage = document.getElementById("roi-final-percentage");
    elements.savingsBar = document.getElementById("savings-bar");
    elements.costBar = document.getElementById("cost-bar");
    elements.savingsBarLabel = document.getElementById("savings-bar-label");
    elements.costBarLabel = document.getElementById("cost-bar-label");
}

// --- FUNÇÕES DE UTILIDADE ---
function formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2
    }).format(value);
}

// --- LÓGICA DE CÁLCULO ---
function calculatePlanCost() {
    const totalCnpj = parseFloat(elements.inputCnpj.value) || 0;
    const totalSku = parseFloat(elements.inputSku.value) || 0;
    const totalUsers = parseFloat(elements.inputUsers.value) || 0;

    let additionalCost = 0;

    if (totalCnpj > BASE_PLAN.base_cnpj) {
        additionalCost += (totalCnpj - BASE_PLAN.base_cnpj) * BASE_PLAN.add_cnpj;
    }
    if (totalSku > BASE_PLAN.base_sku) {
        const skuBlocks = Math.ceil((totalSku - BASE_PLAN.base_sku) / 10000);
        additionalCost += skuBlocks * BASE_PLAN.add_sku;
    }
    if (totalUsers > BASE_PLAN.base_users) {
        additionalCost += (totalUsers - BASE_PLAN.base_users) * BASE_PLAN.add_user;
    }

    // Custo mensal base (sem adicionais)
    let finalMonthlyCost = BASE_PLAN.base_monthly_no_modules;
    
    // Adicionar custo do modulo Compras (sempre selecionado por padrão)
    if (elements.moduloCompras && elements.moduloCompras.checked) {
        finalMonthlyCost += BASE_PLAN.module_compras_cost;
    }
    
    // Adicionar custo do modulo Cotacao
    if (elements.moduloCotacao && elements.moduloCotacao.checked) {
        finalMonthlyCost += BASE_PLAN.module_additional_cost;
    }
    
    // Adicionar custo do modulo Reposicao (se CNPJ > 1)
    if (elements.moduloReposicao && elements.moduloReposicao.checked && totalCnpj > 1) {
        finalMonthlyCost += BASE_PLAN.module_additional_cost;
    }
    
    // Adicionar custo dos adicionais (CNPJ, SKU, Usuário)
    finalMonthlyCost += additionalCost;
    
    // Aplicar multiplicador de experimentacao se marcado
    let experimentationMultiplier = 1.0;
    if (elements.experimentacaoCheckbox && elements.experimentacaoCheckbox.checked) {
        experimentationMultiplier = 1.0 + EXPERIMENTATION_MULTIPLIER;
    }
    
    // Aplicar o multiplicador de experimentacao ao custo final
    finalMonthlyCost *= experimentationMultiplier;
    
    // Custo anual base (sem desconto)
    let totalAnnual = finalMonthlyCost * 12;
    
    // Se Experimentacao estiver marcado, o custo total é trimestral (3 meses)
    if (elements.experimentacaoCheckbox && elements.experimentacaoCheckbox.checked) {
        totalAnnual = finalMonthlyCost * 3;
    }
    
    // Se Pagamento a Vista estiver marcado, o desconto de 20% é aplicado ao custo anual (12 meses)
    if (elements.avistaCheckbox && elements.avistaCheckbox.checked && !elements.experimentacaoCheckbox.checked) {
        totalAnnual = finalMonthlyCost * 12 * 0.80; // 20% de desconto
    }
    
    // Adicionar custo de nova integracao ERP se marcado
    if (elements.novaIntegracaoCheckbox && elements.novaIntegracaoCheckbox.checked) {
        totalAnnual += NEW_ERP_INTEGRATION_COST;
    }
    
    // O desconto de 20% para pagamento à vista já foi aplicado acima, se aplicável.
    let finalAnnualCost = totalAnnual;

    elements.totalMonthlyCost.textContent = formatCurrency(finalMonthlyCost);
    elements.totalAnnualCost.textContent = formatCurrency(finalAnnualCost);
    
    // Atualiza o rótulo do Custo Total Anual/Trimestral
    const annualLabel = document.querySelector("#total-annual-cost").previousElementSibling;
    if (elements.experimentacaoCheckbox && elements.experimentacaoCheckbox.checked) {
        annualLabel.textContent = "Custo Total Trimestral";
    } else {
        annualLabel.textContent = "Custo Total Anual";
    }

    return { totalAnnual: finalAnnualCost, monthlyCost: finalMonthlyCost };
}

function calculateROI() {
    const stockValue = parseFloat(elements.inputStockValue.value) || 0;
    const excessPercentage = parseFloat(elements.inputExcessPercentage.value) / 100 || 0.60;
    const monthlySales = parseFloat(elements.inputMonthlySales.value) || 0;
    const rupturePercentage = parseFloat(elements.inputRupturePercentage.value) / 100 || 0.10;
    const ruptureReductionPercentage = parseFloat(elements.inputRuptureReduction.value) / 100 || 0.50;

    let excessStockValue = 0;
    if (stockValue > 0) {
        excessStockValue = elements.isTotalStockCheckbox.checked ? stockValue * excessPercentage : stockValue;
    }

    const reduction20 = excessStockValue * 0.20;
    const reduction30 = excessStockValue * 0.30;
    const averageExcessReduction = excessStockValue * 0.25;

    let ruptureAnnualLoss = 0;
    let ruptureRecovery = 0;
    if (monthlySales > 0) {
        ruptureAnnualLoss = (monthlySales * rupturePercentage) * 12;
        ruptureRecovery = ruptureAnnualLoss * ruptureReductionPercentage;
    }

    const { totalAnnual } = calculatePlanCost();
    let finalAnnualCost = totalAnnual;

    const totalSavings = averageExcessReduction + ruptureRecovery;
    const savings = totalSavings - finalAnnualCost;
    const roiPercentage = finalAnnualCost > 0 ? (savings / finalAnnualCost) * 100 : 0;

    // Atualizar DOM
    elements.excessStockValue.textContent = formatCurrency(excessStockValue);
    elements.reduction20Value.textContent = formatCurrency(reduction20);
    elements.reduction30Value.textContent = formatCurrency(reduction30);
    elements.ruptureLossValue.textContent = formatCurrency(ruptureAnnualLoss);
    elements.ruptureRecoveryValue.textContent = formatCurrency(ruptureRecovery);
    elements.excessSavings.textContent = formatCurrency(averageExcessReduction);
    elements.ruptureSavings.textContent = formatCurrency(ruptureRecovery);
    elements.totalSavings.textContent = formatCurrency(totalSavings);
    elements.roiFinalPercentage.textContent = roiPercentage.toFixed(2) + "%";
    elements.roiFinalPercentage.style.color = savings >= 0 ? "#28a745" : "#dc3545";

    // Atualizar Barra
    const totalBarValue = totalSavings + totalAnnual;
    const savingsBarPercentage = totalBarValue > 0 ? (totalSavings / totalBarValue) * 100 : 0;
    const costBarPercentage = totalBarValue > 0 ? (totalAnnual / totalBarValue) * 100 : 0;

    elements.savingsBar.style.width = `${savingsBarPercentage}%`;
    elements.costBar.style.width = `${costBarPercentage}%`;
    elements.savingsBarLabel.textContent = `Economia: ${formatCurrency(totalSavings)}`;
    elements.costBarLabel.textContent = `Custo Kenit: ${formatCurrency(finalAnnualCost)}`;
}

// --- INICIALIZAÇÃO ---
function init() {
    cacheDOMElements();
    
    const allInputs = document.querySelectorAll("input");
    allInputs.forEach(input => {
        input.addEventListener("input", calculateROI);
        input.addEventListener("change", calculateROI);
    });

    // Adiciona os eventos de mudanca aos checkboxes de modulos
    // O módulo Compras deve estar sempre marcado e desabilitado
    if (elements.moduloCompras) {
        elements.moduloCompras.checked = true;
        elements.moduloCompras.disabled = true;
        elements.moduloCompras.addEventListener("change", calculateROI);
    }
    if (elements.moduloReposicao) {
        elements.moduloReposicao.addEventListener("change", calculateROI);
    }
    if (elements.moduloCotacao) {
        elements.moduloCotacao.addEventListener("change", calculateROI);
    }
    
    // Adiciona o evento de mudanca ao checkbox de nova integracao
    if (elements.novaIntegracaoCheckbox) {
        elements.novaIntegracaoCheckbox.addEventListener("change", calculateROI);
    }
    
    // Adiciona o evento de mudanca ao checkbox de experimentacao
    if (elements.experimentacaoCheckbox) {
        elements.experimentacaoCheckbox.addEventListener("change", calculateROI);
    }
    
    // Adiciona o evento de mudanca ao checkbox de pagamento a vista
    if (elements.avistaCheckbox) {
        elements.avistaCheckbox.addEventListener("change", calculateROI);
    }

    calculateROI(); // Calculo inicial
}

document.addEventListener("DOMContentLoaded", init);
