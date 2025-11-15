// --- CONSTANTES E DADOS ---

// Valores do Plano Único
const BASE_PLAN = {
    base_monthly: 1300,
    base_cnpj: 1,
    base_sku: 10000,
    base_users: 2,
    setup_cost: 15600,
    
    // Valores Adicionais
    add_user: 50,
    add_cnpj: 100,
    add_sku: 250 // por 10.000 SKUs
};

// --- FUNÇÕES DE UTILIDADE ---

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency', 
        currency: 'BRL',
        minimumFractionDigits: 2
    }).format(value);
}

// --- LÓGICA DE CÁLCULO DO PLANO ---

function calculatePlanCost() {
    // 1. Obter valores de entrada do usuário
    const totalCnpj = parseInt(document.getElementById('input-cnpj').value) || 0;
    const totalSku = parseInt(document.getElementById('input-sku').value) || 0;
    const totalUsers = parseInt(document.getElementById('input-users').value) || 0;

    let monthlyCost = BASE_PLAN.base_monthly;
    let additionalCost = 0;

    // CNPJ Adicional
    const cnpjDiff = totalCnpj - BASE_PLAN.base_cnpj;
    if (cnpjDiff > 0) {
        additionalCost += cnpjDiff * BASE_PLAN.add_cnpj;
    }

    // SKU Adicional (a cada 10.000)
    const skuDiff = totalSku - BASE_PLAN.base_sku;
    if (skuDiff > 0) {
        const skuBlocks = Math.ceil(skuDiff / 10000);
        additionalCost += skuBlocks * BASE_PLAN.add_sku;
    }

    // Usuário Adicional
    const userDiff = totalUsers - BASE_PLAN.base_users;
    if (userDiff > 0) {
        additionalCost += userDiff * BASE_PLAN.add_user;
    }

    monthlyCost += additionalCost;
    const totalSetup = BASE_PLAN.setup_cost;
    const totalAnnual = totalSetup + (monthlyCost * 12);

    // 2. Atualizar resultados na tela
    document.getElementById('total-monthly-cost').textContent = formatCurrency(monthlyCost);
    document.getElementById('total-setup-cost').textContent = formatCurrency(totalSetup);
    document.getElementById('total-annual-cost').textContent = formatCurrency(totalAnnual);

    // Retorna os custos para o cálculo do ROI
    return { monthlyCost, totalSetup, totalAnnual };
}

// --- LÓGICA DE CÁLCULO DO ROI ---

function calculateROI() {
    const stockValueInput = document.getElementById('input-stock-value');
    const excessPercentageInput = document.getElementById('input-excess-percentage');
    const isTotalStockCheckbox = document.getElementById('is-total-stock-checkbox');
    const monthlySalesInput = document.getElementById('input-monthly-sales');
    const rupturePercentageInput = document.getElementById('input-rupture-percentage');

    const stockValue = parseFloat(stockValueInput.value) || 0;
    const excessPercentage = parseFloat(excessPercentageInput.value) / 100 || 0.60;
    const monthlySales = parseFloat(monthlySalesInput.value) || 0;
    const rupturePercentage = parseFloat(rupturePercentageInput.value) / 100 || 0.10;

    // --- CÁLCULO DO EXCESSO DE ESTOQUE ---

    let excessStockValue = 0;

    if (stockValue > 0) {
        if (isTotalStockCheckbox.checked) {
            // Opção 2: Calcular excesso com base no estoque total
            excessStockValue = stockValue * excessPercentage;
        } else {
            // Opção 1: O valor inserido é o próprio excesso de estoque
            excessStockValue = stockValue;
        }
    }

    // 1. Calcular a economia potencial por redução de excesso (20% e 30%)
    const reduction20 = excessStockValue * 0.20;
    const reduction30 = excessStockValue * 0.30;
    const averageExcessReduction = excessStockValue * 0.25; // Média de 25%

    // --- CÁLCULO DA RUPTURA/VENDA PERDIDA ---

    let ruptureAnnualLoss = 0;
    let ruptureRecovery = 0;

    if (monthlySales > 0) {
        // Calcular a perda anual de vendas por ruptura
        const monthlyRuptureLoss = monthlySales * rupturePercentage;
        ruptureAnnualLoss = monthlyRuptureLoss * 12;
        
        // Assumindo que a Kenit pode recuperar toda a venda perdida por ruptura
        ruptureRecovery = ruptureAnnualLoss;
    }

    // --- CÁLCULO DO ROI TOTAL ---

    // 2. Obter o custo anual do Kenit
    const { totalAnnual } = calculatePlanCost();

    // 3. Calcular a economia total (excesso + ruptura)
    const totalSavings = averageExcessReduction + ruptureRecovery;
    const savings = totalSavings - totalAnnual;
    const roiPercentage = totalAnnual > 0 ? (savings / totalAnnual) * 100 : 0;

    // 4. Atualizar resultados na tela - Excesso de Estoque
    document.getElementById('excess-stock-value').textContent = formatCurrency(excessStockValue);
    document.getElementById('reduction-20-value').textContent = formatCurrency(reduction20);
    document.getElementById('reduction-30-value').textContent = formatCurrency(reduction30);

    // 5. Atualizar resultados na tela - Ruptura
    document.getElementById('rupture-loss-value').textContent = formatCurrency(ruptureAnnualLoss);
    document.getElementById('rupture-recovery-value').textContent = formatCurrency(ruptureRecovery);

    // 6. Atualizar resultados na tela - Breakdown de Economia
    document.getElementById('excess-savings').textContent = formatCurrency(averageExcessReduction);
    document.getElementById('rupture-savings').textContent = formatCurrency(ruptureRecovery);
    document.getElementById('total-savings').textContent = formatCurrency(totalSavings);

    // 7. Atualizar ROI Final
    document.getElementById('roi-final-percentage').textContent = roiPercentage.toFixed(2) + '%';
    document.getElementById('roi-final-percentage').style.color = savings >= 0 ? '#28a745' : '#dc3545';

    // 8. Atualizar a barra de comparação
    const totalValue = totalSavings + totalAnnual;
    const savingsPercentage = totalValue > 0 ? (totalSavings / totalValue) * 100 : 0;
    const costPercentage = totalValue > 0 ? (totalAnnual / totalValue) * 100 : 0;

    const savingsBar = document.getElementById('savings-bar');
    const costBar = document.getElementById('cost-bar');
    const savingsLabel = document.getElementById('savings-bar-label');
    const costLabel = document.getElementById('cost-bar-label');

    savingsBar.style.width = `${savingsPercentage}%`;
    costBar.style.width = `${costPercentage}%`;
    savingsLabel.textContent = `Economia: ${formatCurrency(totalSavings)}`;
    costLabel.textContent = `Custo Kenit: ${formatCurrency(totalAnnual)}`;
    
    // Ajuste visual para casos extremos
    if (savingsPercentage < 10) savingsLabel.textContent = '';
    if (costPercentage < 10) costLabel.textContent = '';
}

// --- INICIALIZAÇÃO ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Configurar eventos de input para o cálculo do plano
    document.getElementById('input-cnpj').addEventListener('input', calculatePlanCost);
    document.getElementById('input-sku').addEventListener('input', calculatePlanCost);
    document.getElementById('input-users').addEventListener('input', calculatePlanCost);

    // 2. Configurar eventos de input e checkbox para o cálculo do ROI
    document.getElementById('input-stock-value').addEventListener('input', calculateROI);
    document.getElementById('input-excess-percentage').addEventListener('input', calculateROI);
    document.getElementById('is-total-stock-checkbox').addEventListener('change', calculateROI);
    document.getElementById('input-monthly-sales').addEventListener('input', calculateROI);
    document.getElementById('input-rupture-percentage').addEventListener('input', calculateROI);

    // 3. Calcular custos iniciais
    calculatePlanCost();
    calculateROI();
});
