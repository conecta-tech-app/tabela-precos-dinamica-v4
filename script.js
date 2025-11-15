// --- CONSTANTES E DADOS ---
const BASE_PLAN = {
    base_monthly: 1300,
    base_cnpj: 1,
    base_sku: 10000,
    base_users: 2,
    setup_cost: 15600,
    add_user: 50,
    add_cnpj: 100,
    add_sku: 250 // por 10.000 SKUs
};

// --- ELEMENTOS DO DOM ---
const elements = {};

function cacheDOMElements() {
    // Inputs do Plano
    elements.inputCnpj = document.getElementById('input-cnpj');
    elements.inputSku = document.getElementById('input-sku');
    elements.inputUsers = document.getElementById('input-users');

    // Outputs do Plano
    elements.totalMonthlyCost = document.getElementById('total-monthly-cost');
    elements.totalSetupCost = document.getElementById('total-setup-cost');
    elements.totalAnnualCost = document.getElementById('total-annual-cost');

    // Inputs de ROI - Excesso
    elements.inputStockValue = document.getElementById('input-stock-value');
    elements.inputExcessPercentage = document.getElementById('input-excess-percentage');
    elements.isTotalStockCheckbox = document.getElementById('is-total-stock-checkbox');

    // Outputs de ROI - Excesso
    elements.excessStockValue = document.getElementById('excess-stock-value');
    elements.reduction20Value = document.getElementById('reduction-20-value');
    elements.reduction30Value = document.getElementById('reduction-30-value');

    // Inputs de ROI - Ruptura
    elements.inputMonthlySales = document.getElementById('input-monthly-sales');
    elements.inputRupturePercentage = document.getElementById('input-rupture-percentage');
    elements.inputRuptureReduction = document.getElementById('input-rupture-reduction');
    elements.inputFiliais = document.getElementById('input-filiais');

    // Outputs de ROI - Ruptura
    elements.ruptureLossValue = document.getElementById('rupture-loss-value');
    elements.ruptureRecoveryValue = document.getElementById('rupture-recovery-value');

    // Outputs de ROI - Resumo
    elements.excessSavings = document.getElementById('excess-savings');
    elements.ruptureSavings = document.getElementById('rupture-savings');
    elements.totalSavings = document.getElementById('total-savings');
    elements.roiFinalPercentage = document.getElementById('roi-final-percentage');
    elements.savingsBar = document.getElementById('savings-bar');
    elements.costBar = document.getElementById('cost-bar');
    elements.savingsBarLabel = document.getElementById('savings-bar-label');
    elements.costBarLabel = document.getElementById('cost-bar-label');
}

// --- FUNÇÕES DE UTILIDADE ---
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    }).format(value);
}

// --- LÓGICA DE CÁLCULO ---
function calculatePlanCost() {
    const totalCnpj = parseInt(elements.inputCnpj.value) || 0;
    const totalSku = parseInt(elements.inputSku.value) || 0;
    const totalUsers = parseInt(elements.inputUsers.value) || 0;

    let monthlyCost = BASE_PLAN.base_monthly;
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

    monthlyCost += additionalCost;
    const totalSetup = BASE_PLAN.setup_cost;
    const totalAnnual = totalSetup + (monthlyCost * 12);

    elements.totalMonthlyCost.textContent = formatCurrency(monthlyCost);
    elements.totalSetupCost.textContent = formatCurrency(totalSetup);
    elements.totalAnnualCost.textContent = formatCurrency(totalAnnual);

    return { totalAnnual };
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
    const totalSavings = averageExcessReduction + ruptureRecovery;
    const savings = totalSavings - totalAnnual;
    const roiPercentage = totalAnnual > 0 ? (savings / totalAnnual) * 100 : 0;

    // Atualizar DOM
    elements.excessStockValue.textContent = formatCurrency(excessStockValue);
    elements.reduction20Value.textContent = formatCurrency(reduction20);
    elements.reduction30Value.textContent = formatCurrency(reduction30);
    elements.ruptureLossValue.textContent = formatCurrency(ruptureAnnualLoss);
    elements.ruptureRecoveryValue.textContent = formatCurrency(ruptureRecovery);
    elements.excessSavings.textContent = formatCurrency(averageExcessReduction);
    elements.ruptureSavings.textContent = formatCurrency(ruptureRecovery);
    elements.totalSavings.textContent = formatCurrency(totalSavings);
    elements.roiFinalPercentage.textContent = roiPercentage.toFixed(2) + '%';
    elements.roiFinalPercentage.style.color = savings >= 0 ? '#28a745' : '#dc3545';

    // Atualizar Barra
    const totalBarValue = totalSavings + totalAnnual;
    const savingsBarPercentage = totalBarValue > 0 ? (totalSavings / totalBarValue) * 100 : 0;
    const costBarPercentage = totalBarValue > 0 ? (totalAnnual / totalBarValue) * 100 : 0;

    elements.savingsBar.style.width = `${savingsBarPercentage}%`;
    elements.costBar.style.width = `${costBarPercentage}%`;
    elements.savingsBarLabel.textContent = `Economia: ${formatCurrency(totalSavings)}`;
    elements.costBarLabel.textContent = `Custo Kenit: ${formatCurrency(totalAnnual)}`;
}

// --- INICIALIZAÇÃO ---
function init() {
    cacheDOMElements();
    
    const allInputs = document.querySelectorAll('input');
    allInputs.forEach(input => {
        input.addEventListener('input', calculateROI);
        input.addEventListener('change', calculateROI);
    });

    calculateROI(); // Cálculo inicial
}

document.addEventListener('DOMContentLoaded', init);
